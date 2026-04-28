import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function StatusIcon({ status }) {
  if (status === 'renew') return <AlertCircle className="w-5 h-5 text-red-400" />;
  if (status === 'critical') return <AlertTriangle className="w-5 h-5 text-orange-400" />;
  if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  return <CheckCircle className="w-5 h-5 text-brazil-green" />;
}

function BlockProgressBar({ used }) {
  const segments = Array.from({ length: 10 }, (_, i) => i < used);
  return (
    <div className="flex gap-0.5">
      {segments.map((filled, i) => (
        <div
          key={i}
          className={`flex-1 h-2 rounded-sm transition-all ${filled
            ? used >= 9 ? 'bg-red-400' : used >= 8 ? 'bg-orange-400' : 'bg-brazil-green'
            : 'bg-white/15'}`}
        />
      ))}
    </div>
  );
}

export default function PTBlockTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadBlocks(); }, []);

  const loadBlocks = async () => {
    try {
      const res = await api.get('/pt/blocks');
      setData(res.data);
    } catch {
      toast.error('Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  const renewBlock = async (clientId, clientName) => {
    try {
      await api.post(`/pt/blocks/${clientId}/renew`, { paymentDate });
      toast.success(`✓ ${clientName}'s block renewed!`);
      setRenewingId(null);
      loadBlocks();
    } catch (e) {
      toast.error('Failed to renew block: ' + (e.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const clients = data?.clients || [];
  const renewalCount = data?.renewalCount || 0;
  const urgent = clients.filter(c => c.status === 'renew' || c.status === 'critical');
  const warning = clients.filter(c => c.status === 'warning');
  const ok = clients.filter(c => c.status === 'ok');

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Block Tracker</h1>
      <p className="text-grey-200 text-sm mb-4">{clients.length} clients · {renewalCount} need attention</p>

      {/* Alert Banner */}
      {urgent.length > 0 && (
        <div className="mb-4 rounded-[12px] bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="font-bold text-red-400">{urgent.length} client{urgent.length !== 1 ? 's' : ''} need renewal</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {urgent.map(c => (
              <span key={c.id} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-lg">{c.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Client Blocks */}
      {[
        { label: 'Urgent', items: urgent, color: 'text-red-400' },
        { label: 'Warning', items: warning, color: 'text-yellow-400' },
        { label: 'On Track', items: ok, color: 'text-brazil-green' },
      ].map(group => group.items.length > 0 && (
        <div key={group.label} className="mb-5">
          <p className={`section-header ${group.color} mb-2`}>{group.label} — {group.items.length}</p>
          <div className="space-y-3">
            {group.items.map(c => (
              <div key={c.id} className={`card-dark border ${c.status === 'renew' ? 'border-red-500/30' : c.status === 'critical' ? 'border-orange-500/30' : c.status === 'warning' ? 'border-yellow-500/20' : 'border-white/10'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <StatusIcon status={c.status} />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-grey-200">
                        Block {c.current_block_number} · {c.client_type} · £{c.block_price}
                        {c.block_start_date && ` · Started ${c.block_start_date}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{c.sessions_used}<span className="text-grey-100 font-normal">/10</span></p>
                    <p className="text-xs text-grey-200">{c.sessions_remaining} left</p>
                  </div>
                </div>

                <BlockProgressBar used={c.sessions_used} />

                {(c.status === 'renew' || c.status === 'critical') && (
                  <div className="mt-3">
                    {renewingId === c.id ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-grey-200 mb-1 block">Payment Date</label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={e => setPaymentDate(e.target.value)}
                            className="input text-sm py-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => renewBlock(c.id, c.name)}
                            className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Confirm Renewal
                          </button>
                          <button onClick={() => setRenewingId(null)} className="btn-secondary px-4 text-sm py-2">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRenewingId(c.id)}
                        className={`w-full py-2 rounded-[8px] text-sm font-semibold transition-all active:scale-98 flex items-center justify-center gap-1.5 ${c.status === 'renew' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'}`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {c.status === 'renew' ? 'Renew Block Now' : 'Prepare Renewal'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
