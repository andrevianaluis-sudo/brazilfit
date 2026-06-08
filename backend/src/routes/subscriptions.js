const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Apply auth to all routes EXCEPT the Stripe webhook
router.use((req, res, next) => {
  if (req.path === '/webhook') return next();
  return authenticateToken(req, res, next);
});

// Get subscription status for a client
router.get('/status', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const client = db.prepare('SELECT is_pro, pro_expires_at, pro_trial_used FROM clients WHERE id = ?').get(clientId);
  const sub = db.prepare('SELECT * FROM subscriptions WHERE client_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1').get(clientId);

  const now = new Date();
  const isProActive = client.is_pro && (!client.pro_expires_at || new Date(client.pro_expires_at) > now);

  res.json({
    isPro: isProActive,
    proExpiresAt: client.pro_expires_at,
    proTrialUsed: client.pro_trial_used === 1,
    subscription: sub || null,
    plans: {
      monthly: { price: 999, display: '£9.99/month', priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID },
      annual: { price: 7999, display: '£79.99/year', saving: '33%', priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID },
    }
  });
});

// Create Stripe checkout session
router.post('/checkout', async (req, res) => {
  const { plan } = req.body;
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    // Demo mode: simulate successful subscription
    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    const expiresAt = new Date();
    if (plan === 'annual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    db.prepare('UPDATE clients SET is_pro = 1, pro_trial_used = 1, pro_expires_at = ? WHERE id = ?')
      .run(expiresAt.toISOString().split('T')[0], clientId);

    db.prepare(`
      INSERT INTO subscriptions (client_id, plan, status, amount, current_period_start, current_period_end)
      VALUES (?, ?, 'active', ?, date('now'), ?)
    `).run(clientId, plan, plan === 'annual' ? 7999 : 999, expiresAt.toISOString().split('T')[0]);

    return res.json({
      demo: true,
      message: 'Demo mode: Pro activated! Add real Stripe keys to enable payment.',
      isPro: true,
    });
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const db = getDb();
    const client = db.prepare(`
      SELECT c.*, u.email, u.name FROM clients c JOIN users u ON c.user_id = u.id WHERE c.id = ?
    `).get(clientId);

    const priceId = plan === 'annual'
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
      : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: client.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/client/pro-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/client/upgrade`,
      metadata: { clientId: clientId.toString(), plan },
    });

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Payment setup failed', details: err.message });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const db = getDb();
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let clientId = session.metadata?.clientId;
    const plan = session.metadata?.plan || 'annual';
    const email = session.customer_details?.email;

    // If no clientId in metadata, try to find client by email
    if (!clientId && email) {
      const user = db.prepare("SELECT u.id, c.id as client_id FROM users u JOIN clients c ON c.user_id = u.id WHERE LOWER(u.email) = LOWER(?)").get(email);
      if (user) clientId = user.client_id;
    }

    if (clientId) {
      const expiresAt = new Date();
      if (plan === 'annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);
      db.prepare('UPDATE clients SET is_pro = 1, pro_expires_at = ? WHERE id = ?')
        .run(expiresAt.toISOString().split('T')[0], clientId);
      console.log('[webhook] Upgraded client', clientId, 'to Pro until', expiresAt.toISOString().split('T')[0]);
    } else {
      console.log('[webhook] Could not find client for email:', email);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    db.prepare(`UPDATE subscriptions SET status = 'cancelled' WHERE stripe_subscription_id = ?`).run(sub.id);
    // Find client and deactivate pro
    const subscription = db.prepare('SELECT client_id FROM subscriptions WHERE stripe_subscription_id = ?').get(sub.id);
    if (subscription) {
      db.prepare('UPDATE clients SET is_pro = 0 WHERE id = ?').run(subscription.client_id);
    }
  }

  res.json({ received: true });
});

// Start free trial
router.post('/trial', (req, res) => {
  const db = getDb();
  const clientId = req.user.clientId;
  if (!clientId) return res.status(403).json({ error: 'Clients only' });

  const client = db.prepare('SELECT pro_trial_used FROM clients WHERE id = ?').get(clientId);
  if (client.pro_trial_used) {
    return res.status(400).json({ error: 'Trial already used' });
  }

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  db.prepare('UPDATE clients SET is_pro = 1, pro_trial_used = 1, pro_expires_at = ? WHERE id = ?')
    .run(trialEnd.toISOString().split('T')[0], clientId);

  res.json({ message: '7-day free trial activated!', expiresAt: trialEnd.toISOString().split('T')[0] });
});

module.exports = router;
