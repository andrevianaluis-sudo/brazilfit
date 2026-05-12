import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3, Activity } from 'lucide-react';
import api from '../../utils/api';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const BLUE='#60a5fa';

function SectionLabel({ children, color=ORANGE }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.875rem' }}>
      <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${color},${color}88)` }}/>
      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color, textTransform:'uppercase', margin:0 }}>{children}</p>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, trend, color=ORANGE, sub }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color}10,${SURFACE})`, borderRadius:'14px', padding:'1.1rem', border:`1px solid ${color}20` }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.5rem' }}>
        <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:0 }}>{label}</p>
        <Icon size={14} color={color} style={{ opacity:0.7 }}/>
      </div>
      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.7rem', fontWeight:800, color, letterSpacing:'-0.04em', margin:'0 0 4px', lineHeight:1 }}>{value}</p>
      {trend !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          <TrendingUp size={11} color={trend>=0?GREEN:'#ef4444'}/>
          <span style={{ fontSize:'0.65rem', fontWeight:700, color:trend>=0?GREEN:'#ef4444' }}>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
      {sub && <p style={{ fontSize:'0.68rem', color:MUTED, margin:'2px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function PTAnalytics() {
  const [income, setIncome] = useState(null);
  const [clients, setClients] = useState([]);
  const [checkins, setCheckins] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/pt/income').catch(() => null),
      api.get('/pt/clients').catch(() => null),
      api.get('/pt/dashboard/checkins').catch(() => null),
    ]).then(([incRes, clRes, ciRes]) => {
      if (incRes) setIncome(incRes.data);
      if (clRes) setClients(clRes.data || []);
      if (ciRes) setCheckins(ciRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:BG }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.sessions_remaining > 0).length;
  const totalRevenue = income?.summary?.totalGross || 0;
  const netRevenue = income?.summary?.totalNet || 0;
  const ptRevenue = income?.summary?.ptGross || 0;
  const classRevenue = income?.summary?.classGross || 0;
  const avgBlockPrice = clients.length > 0 ? Math.round(clients.reduce((sum,c) => sum + (c.block_price||0), 0) / clients.length) : 0;
  const totalSessionsUsed = clients.reduce((sum,c) => sum + (c.sessions_used||0), 0);
  const checkinRate = checkins?.weeklyRate || 0;

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', padding:'1.5rem 1.25rem', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>

      {/* Header */}
      <div style={{ marginBottom:'2rem' }}>
        <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>PT Dashboard</p>
        <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Analytics</h1>
        <p style={{ fontSize:'0.82rem', color:MUTED, margin:'4px 0 0' }}>Real data from your business</p>
      </div>

      {/* Revenue */}
      <div style={{ marginBottom:'1.75rem' }}>
        <SectionLabel color={GREEN}>💰 Revenue</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <MetricCard label="Total Gross"    value={`£${totalRevenue.toLocaleString()}`}  icon={DollarSign} color={GREEN}/>
          <MetricCard label="Net (after 20% tax)" value={`£${netRevenue.toLocaleString()}`} icon={DollarSign} color={ORANGE}/>
          <MetricCard label="From PT Sessions" value={`£${ptRevenue.toLocaleString()}`}  icon={DollarSign} color={BLUE} sub={`Avg block: £${avgBlockPrice}`}/>
          <MetricCard label="From Classes"   value={`£${classRevenue.toLocaleString()}`}  icon={DollarSign} color={YELLOW}/>
        </div>
      </div>

      {/* Clients */}
      <div style={{ marginBottom:'1.75rem' }}>
        <SectionLabel color={BLUE}>👥 Clients</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
          <MetricCard label="Total Clients"   value={totalClients}   icon={Users}    color={ORANGE}/>
          <MetricCard label="Active (sessions left)" value={activeClients} icon={Users} color={GREEN}/>
          <MetricCard label="Sessions Delivered" value={totalSessionsUsed} icon={Calendar} color={BLUE}/>
          <MetricCard label="Check-in Rate"  value={`${checkinRate}%`} icon={Activity} color={YELLOW}/>
        </div>

        {/* Client breakdown */}
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {clients.slice(0,8).map((c,i) => {
            const pct = c.sessions_used && (c.sessions_used + c.sessions_remaining) > 0
              ? Math.round((c.sessions_used / (c.sessions_used + c.sessions_remaining)) * 100)
              : 0;
            const colors = [GREEN, ORANGE, BLUE, YELLOW, '#f472b6', '#a78bfa', GREEN, ORANGE];
            const col = colors[i % colors.length];
            return (
              <div key={c.id} style={{ background:SURFACE, borderRadius:'12px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                  <p style={{ fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:0 }}>{c.name}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <p style={{ fontSize:'0.72rem', color:MUTED, margin:0 }}>{c.sessions_used||0} sessions done</p>
                    <p style={{ fontSize:'0.82rem', fontWeight:800, color:col, margin:0 }}>{pct}%</p>
                  </div>
                </div>
                <div style={{ width:'100%', height:'4px', background:S2, borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:col, borderRadius:'2px', transition:'width 0.5s' }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Income per client */}
      {income?.ptIncome?.length > 0 && (
        <div style={{ marginBottom:'1.75rem' }}>
          <SectionLabel color={GREEN}>💳 Revenue per Client</SectionLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {income.ptIncome.filter(c => c.total_earned > 0).sort((a,b) => b.total_earned - a.total_earned).map((c,i) => (
              <div key={c.id} style={{ background:SURFACE, borderRadius:'12px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:'0 0 2px' }}>{c.name}</p>
                  <p style={{ fontSize:'0.7rem', color:MUTED, margin:0 }}>{c.blocks_sold} block{c.blocks_sold!==1?'s':''} · Net £{c.net.toLocaleString()}</p>
                </div>
                <p style={{ fontSize:'1.1rem', fontWeight:800, color:GREEN, margin:0, letterSpacing:'-0.02em' }}>£{c.total_earned.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classes performance */}
      {income?.classIncome?.length > 0 && (
        <div>
          <SectionLabel color={YELLOW}>🏋️ Class Performance</SectionLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {income.classIncome.map((cls,i) => {
              const colors = [GREEN, ORANGE, YELLOW, BLUE];
              const c = colors[i % colors.length];
              const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              return (
                <div key={cls.id} style={{ background:SURFACE, borderRadius:'12px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cls.name}</p>
                    <p style={{ fontSize:'0.7rem', color:MUTED, margin:0 }}>{days[cls.day_of_week]} {cls.class_time} · {cls.sessions_run} sessions run</p>
                  </div>
                  <p style={{ fontSize:'1rem', fontWeight:800, color:c, margin:0, flexShrink:0 }}>£{cls.total_earned.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalRevenue === 0 && clients.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem', background:SURFACE, borderRadius:'16px', border:`1px solid ${BORDER}` }}>
          <p style={{ fontSize:'2rem', margin:'0 0 8px' }}>📊</p>
          <p style={{ fontSize:'0.875rem', color:MUTED, margin:0 }}>No data yet — add clients and record blocks to see analytics</p>
        </div>
      )}
    </div>
  );
}
