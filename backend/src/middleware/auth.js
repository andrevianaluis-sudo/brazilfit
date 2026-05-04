const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'brazilfit-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function requirePT(req, res, next) {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'PT access only' });
  }
  next();
}

function requireClient(req, res, next) {
  if (req.user.role !== 'client' && req.user.role !== 'pt') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

module.exports = { authenticateToken, requirePT, requireClient };
