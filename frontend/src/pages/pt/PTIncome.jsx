import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BookOpen, Crown } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatGBP(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatGBPWhole(pounds) {
  return `£${Number(pounds).toLocaleString('en-GB')}`;
}

function IncomeCard({ label, gross, tax, net, accent = 'green' }) {
  const colors = {
    green: 'text-brazil-green',
    yellow: 'text-brazil-yellow',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
  };
  return (
    <div className="metric-card">
      <p className={`text-lg font-black ${colors[accent]}`}>{formatGBPWhole(gross)}</p>
      <p className="text-xs text-grey-200">{label}</p>
      <div className="flex gap-3 mt-1 text-xs">
        <span className="text-red-400/80">Tax: {formatGBPWhole(tax)}</span>
        <span className="text-grey-200">Net: {formatGBPWhole(net)}</span>
      </div>
    </div>
  );
}

export default function PTIncome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pt');

  useEffect(() => {
    api.get('/pt/income').then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load income data');
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { ptIncome = [], classIncome = [], summary = {}, proIncome = [] } = data || {};

  const proGross = proIncome.reduce((s, p) => s + p.total, 0) / 100;
  const proNet = Math.round(proGross * 0.8);
  const proTax = Math.round(proGross * 0.2);

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Income & Tax</h1>
      <p className="text-grey-200 text-sm mb-4">20% tax set aside automatically</p>

      {/* Grand Total */}
      <div className="rounded-[12px] p-4 mb-5 bg-gradient-to-br from-brazil-green/20 to-brazil-yellow/10 border border-brazil-green/30">
        <p className="text-xs text-grey-200 mb-1">Total Gross Income</p>
        <p className="text-4xl font-black text-brazil-green mb-1">{formatGBPWhole(summary.totalGross || 0)}</p>
        <div className="flex gap-4 text-sm mt-3">
          <div className="bg-red-500/20 rounded-[8px] px-3 py-2 flex-1 text-center">
            <p className="text-red-400 font-bold">{formatGBPWhole(summary.totalTax || 0)}</p>
            <p className="text-xs text-grey-200">Tax Pot (20%)</p>
          </div>
          <div className="bg-brazil-green/20 rounded-[8px] px-3 py-2 flex-1 text-center">
            <p className="text-brazil-green font-bold">{formatGBPWhole(summary.totalNet || 0)}</p>
            <p className="text-xs text-grey-200">Net Income</p>
          </div>
        </div>
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <IncomeCard label="PT Sessions" gross={summary.ptGross || 0} tax={Math.round((summary.ptGross || 0) * 0.2)} net={Math.round((summary.ptGross || 0) * 0.8)} accent="green" />
        <IncomeCard label="Classes" gross={summary.classGross || 0} tax={Math.round((summary.classGross || 0) * 0.2)} net={Math.round((summary.classGross || 0) * 0.8)} accent="yellow" />
        <IncomeCard label="Pro Subs" gross={proGross} tax={proTax} net={proNet} accent="purple" />
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'pt', label: 'PT Clients', icon: TrendingUp },
          { key: 'classes', label: 'Classes', icon: BookOpen },
          { key: 'pro', label: 'BrazilFit Pro', icon: Crown },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-xs font-medium transition-all ${tab === t.key ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pt' && (
        <div className="space-y-2">
          {ptIncome.map(c => (
            <div key={c.id} className="card-dark">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{c.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.client_type === 'Online' ? 'bg-blue-500/20 text-blue-400' : 'bg-grey-100 text-grey-200'}`}>{c.client_type}</span>
                  </div>
                  <p className="text-xs text-grey-200">{c.blocks_sold} block{c.blocks_sold !== 1 ? 's' : ''} · £{c.block_price}/block</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brazil-green">{formatGBPWhole(c.total_earned)}</p>
                  <p className="text-xs text-grey-100">Net: {formatGBPWhole(c.net)}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-1.5 text-xs text-grey-100">
                <span>Tax: {formatGBPWhole(c.tax)}</span>
              </div>
            </div>
          ))}
          {ptIncome.length === 0 && <p className="text-center text-grey-100 py-8">No PT income data</p>}
        </div>
      )}

      {tab === 'classes' && (
        <div className="space-y-2">
          {classIncome.map(c => (
            <div key={c.id} className="card-dark">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-grey-200">
                    {DAY_NAMES[c.day_of_week]} {c.class_time} · {c.sessions_run} sessions run
                    {c.payment_type === 'per_person' ? ` · £${c.per_person_fee}/person × ${c.max_people}` : ` · £${c.flat_fee}/session`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brazil-yellow">{formatGBPWhole(c.total_earned)}</p>
                  <p className="text-xs text-grey-100">Net: {formatGBPWhole(c.net)}</p>
                </div>
              </div>
              <div className="text-xs text-grey-100 mt-1">Tax set aside: {formatGBPWhole(c.tax)}</div>
            </div>
          ))}

          {/* Thursday Pilates highlight */}
          <div className="card-dark border border-brazil-yellow/20 mt-2">
            <p className="text-xs text-brazil-yellow mb-1 font-semibold">Thursday Pilates — Per Person</p>
            <p className="text-sm text-grey-200">12 people × £8 = <span className="text-brazil-yellow font-bold">£96/session</span></p>
          </div>

          {classIncome.length === 0 && <p className="text-center text-grey-100 py-8">No class income data</p>}
        </div>
      )}

      {tab === 'pro' && (
        <div className="space-y-3">
          {/* Pro income breakdown */}
          {proIncome.length > 0 ? (
            <div className="card-dark">
              {proIncome.map(p => (
                <div key={p.plan} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-semibold capitalize">{p.plan} Plan</p>
                    <p className="text-xs text-grey-200">{p.count} subscriber{p.count !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="font-bold text-purple-400">{formatGBP(p.total)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-dark text-center py-6">
              <Crown className="w-8 h-8 text-grey-100 mx-auto mb-2" />
              <p className="text-grey-200 text-sm">No Pro subscriptions yet</p>
            </div>
          )}

          {/* Revenue Projections */}
          <div className="card-dark border border-brazil-yellow/20">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-brazil-yellow" />
              <p className="font-bold text-brazil-yellow">Revenue Projections</p>
            </div>
            <div className="space-y-2">
              <ProjectionRow label="18 clients · Monthly" gross={18 * 9.99} />
              <ProjectionRow label="18 clients · Annual" gross={18 * 79.99} />
              <ProjectionRow label="50 clients · Monthly" gross={50 * 9.99} />
              <ProjectionRow label="50 clients · Annual" gross={50 * 79.99} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectionRow({ label, gross }) {
  const net = gross * 0.8;
  const tax = gross * 0.2;
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <p className="text-sm text-grey-200">{label}</p>
      <div className="text-right">
        <p className="font-bold text-sm">£{gross.toFixed(2)}</p>
        <p className="text-xs text-grey-100">Net: £{net.toFixed(2)}</p>
      </div>
    </div>
  );
}
