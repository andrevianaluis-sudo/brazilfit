import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';

const BG = '#141414';
const SURFACE = '#2a2a2a';
const SURFACE2 = '#333333';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const ANALYTICS_DATA = {
  revenue: {
    thisMonth: 4250, lastMonth: 3800, yearToDate: 48000, projectedAnnual: 51000,
  },
  retention: {
    percentage: 87, avgSessionsPerMonth: 8, clientLifetimeValue: 1250,
  },
  attendance: {
    rate: 92, peakHour: '18:00', busiestDay: 'Thursday',
  },
  classes: [
    { name: 'Morning Strength', attendance: 14, revenue: 420 },
    { name: 'Pilates Flow',     attendance: 12, revenue: 360 },
    { name: 'Dance Cardio',     attendance: 16, revenue: 480 },
    { name: 'Evening Strength', attendance: 18, revenue: 540 },
  ],
  growth: {
    newClientsThisMonth: 4, totalClients: 24, proSubscribers: 8, monthlySubscriptionRevenue: 960,
  },
};

function SectionLabel({ children }) {
  return (
    <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:MUTED, textTransform:'uppercase', margin:'0 0 0.75rem' }}>{children}</p>
  );
}

function MetricCard({ label, value, icon: Icon, trend, color }) {
  return (
    <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}` }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.6rem' }}>
        <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:0 }}>{label}</p>
        <Icon size={14} color={color || ORANGE} style={{ opacity:0.7 }} />
      </div>
      <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.6rem', fontWeight:800, color: color || ORANGE, letterSpacing:'-0.03em', margin:'0 0 0.5rem', lineHeight:1 }}>{value}</p>
      {trend && (
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          {trend > 0
            ? <TrendingUp size={11} color={GREEN} />
            : <TrendingDown size={11} color="#ef4444" />}
          <span style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', fontWeight:600, color: trend > 0 ? GREEN : '#ef4444' }}>
            {Math.abs(trend)}% vs last period
          </span>
        </div>
      )}
    </div>
  );
}

export default function PTAnalytics() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div style={{ padding:'1.5rem 1.25rem', paddingBottom:'6rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

      {/* Header */}
      <div>
        <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 0.3rem' }}>PT Dashboard</p>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <BarChart3 size={18} color={ORANGE} />
          <h1 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.75rem', fontWeight:700, color:TEXT, letterSpacing:'-0.03em', margin:0 }}>Analytics</h1>
        </div>
      </div>

      {/* Time range toggle */}
      <div style={{ display:'flex', gap:'6px', backgroundColor:SURFACE, borderRadius:'10px', padding:'3px', alignSelf:'flex-start' }}>
        {[['week','This Week'],['month','This Month'],['year','This Year']].map(([key, label]) => (
          <button key={key} onClick={() => setTimeRange(key)} style={{
            padding:'6px 14px', borderRadius:'8px', border:'none',
            backgroundColor: timeRange===key ? ORANGE : 'transparent',
            color: timeRange===key ? '#000' : MUTED,
            fontFamily:"'Satoshi', system-ui", fontSize:'0.75rem', fontWeight:700,
            cursor:'pointer', minHeight:'auto', whiteSpace:'nowrap', transition:'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Revenue */}
      <div>
        <SectionLabel>💰 Revenue</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <MetricCard label="This Month"       value={`£${ANALYTICS_DATA.revenue.thisMonth}`}       icon={DollarSign} trend={11.8} color={GREEN} />
          <MetricCard label="Last Month"        value={`£${ANALYTICS_DATA.revenue.lastMonth}`}        icon={DollarSign} color={MUTED} />
          <MetricCard label="Year to Date"      value={`£${ANALYTICS_DATA.revenue.yearToDate}`}       icon={DollarSign} color={ORANGE} />
          <MetricCard label="Projected Annual"  value={`£${ANALYTICS_DATA.revenue.projectedAnnual}`}  icon={DollarSign} color={YELLOW} />
        </div>
      </div>

      {/* Retention */}
      <div>
        <SectionLabel>🔄 Client Retention</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <MetricCard label="Retention Rate"      value={`${ANALYTICS_DATA.retention.percentage}%`}          icon={Users}    trend={5}  color={GREEN} />
          <MetricCard label="Avg Sessions/Month"  value={ANALYTICS_DATA.retention.avgSessionsPerMonth}        icon={Calendar}           color='#60a5fa' />
          <MetricCard label="Client Lifetime"     value={`£${ANALYTICS_DATA.retention.clientLifetimeValue}`}  icon={DollarSign}         color={GREEN} />
        </div>
      </div>

      {/* Attendance */}
      <div>
        <SectionLabel>📅 Attendance</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <MetricCard label="Attendance Rate"  value={`${ANALYTICS_DATA.attendance.rate}%`}  icon={Users}    trend={2}  color={GREEN} />
          <MetricCard label="Peak Hour"        value={ANALYTICS_DATA.attendance.peakHour}    icon={Calendar}           color={ORANGE} />
          <MetricCard label="Busiest Day"      value={ANALYTICS_DATA.attendance.busiestDay}  icon={Calendar}           color='#60a5fa' />
        </div>
      </div>

      {/* Class Performance */}
      <div>
        <SectionLabel>🏋️ Class Performance</SectionLabel>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {ANALYTICS_DATA.classes.map((cls, i) => {
            const pct = (cls.attendance / 20) * 100;
            const colors = [GREEN, ORANGE, YELLOW, '#60a5fa'];
            const c = colors[i % colors.length];
            return (
              <div key={i} style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1rem', border:`1px solid ${BORDER}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:0 }}>{cls.name}</p>
                  <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1rem', fontWeight:800, color:c, margin:0, letterSpacing:'-0.02em' }}>£{cls.revenue}</p>
                </div>
                <div style={{ backgroundColor:SURFACE2, borderRadius:'3px', height:'4px', overflow:'hidden', marginBottom:'6px' }}>
                  <div style={{ height:'100%', width:`${pct}%`, backgroundColor:c, borderRadius:'3px', transition:'width 0.5s ease' }} />
                </div>
                <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', color:MUTED, margin:0 }}>{cls.attendance} avg attendance</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth */}
      <div>
        <SectionLabel>📈 Growth</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <MetricCard label="New Clients"           value={ANALYTICS_DATA.growth.newClientsThisMonth}               icon={Users}      trend={100} color={GREEN} />
          <MetricCard label="Total Clients"         value={ANALYTICS_DATA.growth.totalClients}                       icon={Users}                 color={ORANGE} />
          <MetricCard label="Pro Subscribers"       value={ANALYTICS_DATA.growth.proSubscribers}                     icon={DollarSign}            color={YELLOW} />
          <MetricCard label="Monthly Subscriptions" value={`£${ANALYTICS_DATA.growth.monthlySubscriptionRevenue}`}   icon={DollarSign} trend={25}  color={GREEN} />
        </div>
      </div>
    </div>
  );
}
