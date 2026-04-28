import { useState, useEffect } from 'react';
import { Crown, Gift, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PTSubscriptions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giftForm, setGiftForm] = useState({ clientId: '', plan: 'monthly', months: 1 });
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    api.get('/pt/subscriptions').then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load subscription data');
      setLoading(false);
    });
  }, []);

  const giftPro = async () => {
    try {
      await api.post('/pt/subscriptions/gift', giftForm);
      toast.success('Pro gifted successfully!');
      setShowGift(false);
      const res = await api.get('/pt/subscriptions');
      setData(res.data);
    } catch {
      toast.error('Failed to gift Pro');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { clients = [], projections = {} } = data || {};
  const proCount = clients.filter(c => c.is_pro).length;
  const freeCount = clients.length - proCount;

  const formatGBP = (pence) => `£${(pence / 100).toFixed(2)}`;

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">BrazilFit Pro</h1>
      <p className="text-grey-200 text-sm mb-4">Subscription management</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="metric-card text-center">
          <p className="text-2xl font-black text-brazil-yellow">{proCount}</p>
          <p className="text-xs text-grey-200">Pro</p>
        </div>
        <div className="metric-card text-center">
          <p className="text-2xl font-black text-grey-200">{freeCount}</p>
          <p className="text-xs text-grey-200">Free</p>
        </div>
        <div className="metric-card text-center">
          <p className="text-2xl font-black text-brazil-green">{clients.length}</p>
          <p className="text-xs text-grey-200">Total</p>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="card-dark border border-brazil-yellow/20 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-brazil-yellow" />
          <p className="font-bold text-brazil-yellow">Revenue Projections</p>
        </div>
        <div className="space-y-2">
          {[
            { label: '18 clients Monthly', gross: 18 * 9.99 },
            { label: '18 clients Annual', gross: 18 * 79.99 },
            { label: '50 clients Monthly', gross: 50 * 9.99 },
            { label: '50 clients Annual', gross: 50 * 79.99 },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <p className="text-sm text-grey-200">{row.label}</p>
              <div className="text-right">
                <p className="font-bold text-sm text-brazil-yellow">£{row.gross.toFixed(2)}</p>
                <p className="text-xs text-grey-100">Net: £{(row.gross * 0.8).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Pro Button */}
      <button
        onClick={() => setShowGift(!showGift)}
        className="btn-yellow w-full mb-4 flex items-center justify-center gap-2"
      >
        <Gift className="w-5 h-5" /> Gift Pro to a Client
      </button>

      {showGift && (
        <div className="card-dark border border-brazil-yellow/20 mb-4 space-y-3">
          <div>
            <label className="label">Select Client</label>
            <select className="input" value={giftForm.clientId} onChange={e => setGiftForm(f => ({ ...f, clientId: e.target.value }))}>
              <option value="">Choose client...</option>
              {clients.filter(c => !c.is_pro).map(c => (
                <option key={c.client_id} value={c.client_id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Plan</label>
            <select className="input" value={giftForm.plan} onChange={e => setGiftForm(f => ({ ...f, plan: e.target.value }))}>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={giftPro} className="btn-yellow flex-1">Gift Pro Access</button>
            <button onClick={() => setShowGift(false)} className="btn-secondary px-4">Cancel</button>
          </div>
        </div>
      )}

      {/* Client list */}
      <p className="section-header mb-2">All Clients</p>
      <div className="space-y-2">
        {clients.map(c => (
          <div key={c.client_id} className="card-dark flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${c.is_pro ? 'bg-brazil-yellow/20 text-brazil-yellow' : 'bg-grey-100 text-grey-200'}`}>
              {c.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{c.name}</p>
              <p className="text-xs text-grey-100">
                {c.plan ? `${c.plan} plan` : c.pro_trial_used ? 'Trial used' : 'Free tier'}
                {c.current_period_end && ` · Until ${c.current_period_end}`}
              </p>
            </div>
            {c.is_pro ? (
              <span className="badge-pro flex items-center gap-1"><Crown className="w-3 h-3" /> PRO</span>
            ) : (
              <span className="text-xs text-grey-100 bg-grey-100 px-2 py-0.5 rounded-full">Free</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
