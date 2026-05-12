import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Heart, Moon, Zap, RefreshCw, CheckCircle, AlertCircle, Watch, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const BLUE='#60a5fa';const PURPLE='#a78bfa';

const DEVICES = [
  { id:'garmin',          name:'Garmin',          icon:'⌚', color:BLUE,   desc:'Connect, Forerunner, Fenix, Venu series',        data:['Steps','Heart Rate','Sleep','HRV','VO2 Max','Body Battery'] },
  { id:'whoop',           name:'Whoop',            icon:'💪', color:GREEN,  desc:'Whoop 4.0 and later',                            data:['Recovery Score','Sleep','HRV','Strain','Resting HR'] },
  { id:'oura',            name:'Oura Ring',        icon:'💍', color:YELLOW, desc:'Oura Ring Gen 2 and Gen 3',                      data:['Readiness','Sleep Score','HRV','Body Temp','SpO2'] },
  { id:'apple_health',    name:'Apple Health',     icon:'🍎', color:'#ff6b8a', desc:'iPhone & Apple Watch via HealthKit',          data:['Steps','Heart Rate','Sleep','Workouts','HRV'] },
  { id:'samsung_health',  name:'Samsung Health',   icon:'📱', color:ORANGE, desc:'Galaxy Watch & Android via Health Connect',     data:['Steps','Heart Rate','Sleep','Stress','SpO2'] },
  { id:'polar',           name:'Polar',            icon:'🔵', color:BLUE,   desc:'Vantage, Ignite, Grit, Pacer series',           data:['HRV','Sleep','VO2 Max','Nightly Recharge','Running Index'] },
];

function StatCard({ icon, label, value, unit, color, trend }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color}12,${SURFACE})`, border:`1px solid ${color}25`, borderRadius:'14px', padding:'1rem', textAlign:'center' }}>
      <p style={{ fontSize:'1.5rem', margin:'0 0 4px' }}>{icon}</p>
      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.6rem', fontWeight:800, color, margin:'0 0 2px', letterSpacing:'-0.03em', lineHeight:1 }}>{value}<span style={{ fontSize:'0.75rem', fontWeight:600, opacity:0.8 }}>{unit}</span></p>
      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.1em', color:MUTED, textTransform:'uppercase', margin:0 }}>{label}</p>
      {trend && <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.65rem', color:trend>0?GREEN:'#ef4444', margin:'4px 0 0', fontWeight:700 }}>{trend>0?'↑':'↓'} {Math.abs(trend)}% vs yesterday</p>}
    </div>
  );
}

export default function ClientWearable() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connRes, dailyRes] = await Promise.all([
        api.get('/wearables/connections').catch(() => ({ data: [] })),
        api.get(`/wearables/daily/${new Date().toISOString().split('T')[0]}`).catch(() => ({ data: null })),
      ]);
      setConnections(connRes.data || []);
      setDailyData(dailyRes.data || null);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (device) => {
    setConnecting(device.id);
    try {
      const res = await api.post('/wearables/connect', { provider: device.id });
      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url;
      } else if (res.data?.connection_url) {
        window.location.href = res.data.connection_url;
      } else {
        toast.success(`${device.name} connection initiated! Check your email for the connection link.`);
      }
    } catch(e) {
      toast.error(`Failed to connect ${device.name}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/wearables/sync');
      toast.success('Syncing your data... This may take a minute.');
      setTimeout(() => loadData(), 3000);
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`Disconnect ${provider}? Your historical data will be kept.`)) return;
    try {
      await api.delete(`/wearables/connections/${provider}`);
      toast.success('Device disconnected');
      loadData();
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const connected = DEVICES.filter(d => connections.find(c => c.provider === d.id && c.status === 'active'));
  const notConnected = DEVICES.filter(d => !connections.find(c => c.provider === d.id && c.status === 'active'));

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:BG }}>
      <div style={{ width:'24px', height:'24px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'2rem 1.25rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Health Data</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:'0 0 4px', lineHeight:1 }}>Wearables</h1>
          <p style={{ fontSize:'0.82rem', color:MUTED, margin:0 }}>Connect your device — data flows automatically into BrazilFit</p>
        </div>

        {/* Today's stats — show if we have data */}
        {dailyData && (
          <div style={{ marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${GREEN},${GREEN}88)` }}/>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:GREEN, textTransform:'uppercase', margin:0 }}>Today's Stats</p>
              </div>
              <button onClick={handleSync} disabled={syncing} style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(255,255,255,0.06)', border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'5px 12px', cursor:'pointer', color:MUTED, fontSize:'0.72rem', fontWeight:600, minHeight:'auto' }}>
                <RefreshCw size={12} style={{ animation:syncing?'spin 1s linear infinite':'none' }}/>{syncing?'Syncing...':'Sync'}
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'8px' }}>
              {dailyData.steps && <StatCard icon="👣" label="Steps" value={dailyData.steps?.toLocaleString()||'—'} unit="" color={GREEN}/>}
              {dailyData.heart_rate_avg && <StatCard icon="❤️" label="Avg HR" value={dailyData.heart_rate_avg||'—'} unit=" bpm" color='#ef4444'/>}
              {dailyData.calories_burned && <StatCard icon="🔥" label="Calories" value={dailyData.calories_burned||'—'} unit=" kcal" color={ORANGE}/>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {dailyData.sleep_duration && <StatCard icon="😴" label="Sleep" value={(dailyData.sleep_duration/60).toFixed(1)||'—'} unit="h" color={PURPLE}/>}
              {dailyData.hrv && <StatCard icon="📊" label="HRV" value={dailyData.hrv||'—'} unit=" ms" color={BLUE}/>}
              {dailyData.readiness_score && <StatCard icon="⚡" label="Readiness" value={dailyData.readiness_score||'—'} unit="%" color={YELLOW}/>}
            </div>
          </div>
        )}

        {/* Connected devices */}
        {connected.length > 0 && (
          <div style={{ marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${GREEN},${GREEN}88)` }}/>
              <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:GREEN, textTransform:'uppercase', margin:0 }}>Connected ({connected.length})</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {connected.map(device => {
                const conn = connections.find(c => c.provider === device.id);
                return (
                  <div key={device.id} style={{ background:`linear-gradient(135deg,${device.color}10,${SURFACE})`, border:`1px solid ${device.color}30`, borderRadius:'14px', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${device.color}20`, border:`1px solid ${device.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{device.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                        <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.95rem', fontWeight:700, color:TEXT, margin:0 }}>{device.name}</p>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.62rem', fontWeight:700, color:GREEN, background:'rgba(76,175,80,0.12)', border:'1px solid rgba(76,175,80,0.25)', borderRadius:'20px', padding:'1px 8px' }}>
                          <CheckCircle size={10}/> Connected
                        </span>
                      </div>
                      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.72rem', color:MUTED, margin:0 }}>
                        Last sync: {conn?.last_synced_at ? new Date(conn.last_synced_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Never'}
                      </p>
                    </div>
                    <button onClick={()=>handleDisconnect(device.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color:MUTED, fontSize:'0.72rem', fontWeight:600, minHeight:'auto', padding:'4px 8px' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#ef4444'}
                      onMouseLeave={e=>e.currentTarget.style.color=MUTED}>
                      Disconnect
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Connect devices */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${ORANGE},${ORANGE}88)` }}/>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:0 }}>
              {connected.length > 0 ? `Add Another Device` : 'Connect Your Device'}
            </p>
          </div>

          {connected.length === 0 && (
            <div style={{ background:'linear-gradient(135deg,rgba(255,107,43,0.08),#1a1a1a)', border:'1px solid rgba(255,107,43,0.2)', borderRadius:'16px', padding:'1.5rem', marginBottom:'1rem', textAlign:'center' }}>
              <p style={{ fontSize:'2rem', margin:'0 0 8px' }}>⌚</p>
              <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1rem', fontWeight:700, color:TEXT, margin:'0 0 6px' }}>Connect your smartwatch</p>
              <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.8rem', color:MUTED, margin:0, lineHeight:1.6 }}>Your health data flows automatically into BrazilFit. Your PT can see your recovery, sleep and readiness to personalise every session.</p>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {notConnected.map(device => (
              <div key={device.id} style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:'14px', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'14px', transition:'border-color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=`${device.color}40`}
                onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:S2, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{device.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.95rem', fontWeight:700, color:TEXT, margin:'0 0 3px' }}>{device.name}</p>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.72rem', color:MUTED, margin:'0 0 6px' }}>{device.desc}</p>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    {device.data.slice(0,3).map(d => (
                      <span key={d} style={{ fontSize:'0.58rem', fontWeight:600, color:device.color, background:`${device.color}12`, border:`1px solid ${device.color}25`, borderRadius:'20px', padding:'1px 7px' }}>{d}</span>
                    ))}
                    {device.data.length > 3 && <span style={{ fontSize:'0.58rem', fontWeight:600, color:MUTED, background:S2, border:`1px solid ${BORDER}`, borderRadius:'20px', padding:'1px 7px' }}>+{device.data.length-3} more</span>}
                  </div>
                </div>
                <button onClick={() => handleConnect(device)} disabled={connecting===device.id} style={{
                  padding:'8px 16px', borderRadius:'10px', border:'none', cursor:'pointer', flexShrink:0,
                  background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,
                  color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.78rem', fontWeight:800,
                  minHeight:'auto', boxShadow:`0 4px 12px ${ORANGE}30`,
                  opacity:connecting===device.id?0.7:1,
                }}>
                  {connecting===device.id ? '...' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info footer */}
        <div style={{ marginTop:'1.5rem', background:'linear-gradient(135deg,#1a2a1a,#1a1a1a)', border:'1px solid rgba(76,175,80,0.15)', borderRadius:'14px', padding:'1rem 1.25rem', display:'flex', gap:'12px' }}>
          <span style={{ fontSize:'1.2rem', flexShrink:0 }}>🔒</span>
          <div>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', fontWeight:700, color:TEXT, margin:'0 0 3px' }}>Your data stays private</p>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', color:MUTED, margin:0, lineHeight:1.6 }}>All wearable data is stored on BrazilFit's own servers. Only you and your PT can see it. No third-party data sharing, ever.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
