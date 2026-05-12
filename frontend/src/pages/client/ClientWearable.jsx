import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, CheckCircle, Zap } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const S2='#222';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const BLUE='#60a5fa';const PURPLE='#a78bfa';

const DEVICES = [
  { id:'garmin',         name:'Garmin',         icon:'⌚', color:'#00A9CE', bg:'rgba(0,169,206,0.1)',  border:'rgba(0,169,206,0.25)',  desc:'Connect, Forerunner, Fenix, Venu & Epix series', data:['Steps','Heart Rate','Sleep','HRV','VO2 Max','Body Battery'], popular:true },
  { id:'apple_health',   name:'Apple Health',   icon:'🍎', color:'#ff6b8a', bg:'rgba(255,107,138,0.1)',border:'rgba(255,107,138,0.25)', desc:'iPhone & Apple Watch via HealthKit',             data:['Steps','Heart Rate','Sleep','Workouts','HRV'], popular:true },
  { id:'oura',           name:'Oura Ring',      icon:'💍', color:YELLOW,    bg:'rgba(255,214,0,0.1)',   border:'rgba(255,214,0,0.25)',   desc:'Oura Ring Gen 2 and Gen 3',                     data:['Readiness','Sleep Score','HRV','Body Temp','SpO2'] },
  { id:'whoop',          name:'Whoop',          icon:'💪', color:GREEN,     bg:'rgba(76,175,80,0.1)',   border:'rgba(76,175,80,0.25)',   desc:'Whoop 4.0 and later — elite recovery tracking', data:['Recovery Score','Sleep','HRV','Strain','Resting HR'] },
  { id:'samsung_health', name:'Samsung Health', icon:'🌀', color:BLUE,      bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.25)',  desc:'Galaxy Watch & Android via Health Connect',     data:['Steps','Heart Rate','Sleep','Stress','SpO2'] },
  { id:'polar',          name:'Polar',          icon:'❄️', color:PURPLE,    bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.25)', desc:'Vantage, Ignite, Grit, Pacer series',           data:['HRV','Sleep','VO2 Max','Nightly Recharge','Running Index'] },
];

function StatCard({ icon, label, value, unit, color }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color}15,${SURFACE})`, border:`1px solid ${color}30`, borderRadius:'14px', padding:'1rem 0.75rem', textAlign:'center' }}>
      <p style={{ fontSize:'1.4rem', margin:'0 0 6px' }}>{icon}</p>
      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.5rem', fontWeight:800, color, margin:'0 0 3px', letterSpacing:'-0.03em', lineHeight:1 }}>
        {value}<span style={{ fontSize:'0.7rem', fontWeight:600, opacity:0.8 }}>{unit}</span>
      </p>
      <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', margin:0 }}>{label}</p>
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
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleConnect = async (device) => {
    setConnecting(device.id);
    try {
      const res = await api.post('/wearables/connect', { provider: device.id });
      if (res.data?.auth_url) window.location.href = res.data.auth_url;
      else if (res.data?.connection_url) window.location.href = res.data.connection_url;
      else toast.success(`${device.name} connection initiated!`);
    } catch { toast.error(`Failed to connect ${device.name}`); }
    finally { setConnecting(null); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try { await api.post('/wearables/sync'); toast.success('Syncing...'); setTimeout(loadData, 3000); }
    catch { toast.error('Sync failed'); }
    finally { setSyncing(false); }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`Disconnect? Your data will be kept.`)) return;
    try { await api.delete(`/wearables/connections/${provider}`); toast.success('Disconnected'); loadData(); }
    catch { toast.error('Failed to disconnect'); }
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
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Health Intelligence</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:'0 0 4px', lineHeight:1 }}>Wearables</h1>
          <p style={{ fontSize:'0.82rem', color:MUTED, margin:0 }}>Connect your device — your health data flows automatically into BrazilFit</p>
        </div>

        {/* Hero banner — no devices connected */}
        {connected.length === 0 && (
          <div style={{ borderRadius:'20px', padding:'2rem', marginBottom:'1.5rem', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#1a1a0a,#0a1a2a,#1a0a1a)', border:'1px solid rgba(255,107,43,0.2)', boxShadow:'0 8px 40px rgba(255,107,43,0.08)' }}>
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', borderRadius:'50%', background:ORANGE, opacity:0.06, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:'-30px', left:'20px', width:'100px', height:'100px', borderRadius:'50%', background:BLUE, opacity:0.05, pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'1.25rem' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0, boxShadow:`0 8px 24px ${ORANGE}44` }}>⌚</div>
              <div>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.2rem', fontWeight:800, color:TEXT, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Connect your smartwatch</p>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.8rem', color:MUTED, margin:0, lineHeight:1.5 }}>Your PT sees your recovery, sleep & readiness to personalise every session</p>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {[{icon:'😴',label:'Sleep Quality',color:PURPLE},{icon:'❤️',label:'Heart Rate',color:'#ef4444'},{icon:'⚡',label:'Readiness',color:YELLOW},{icon:'📊',label:'HRV Score',color:BLUE},{icon:'👣',label:'Daily Steps',color:GREEN},{icon:'🔋',label:'Recovery',color:ORANGE}].map((s,i)=>(
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'10px 8px', textAlign:'center' }}>
                  <p style={{ fontSize:'1.2rem', margin:'0 0 4px' }}>{s.icon}</p>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.62rem', fontWeight:600, color:s.color, margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's stats */}
        {dailyData && (
          <div style={{ marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${GREEN},${GREEN}88)` }}/>
                <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:GREEN, textTransform:'uppercase', margin:0 }}>Today's Stats</p>
              </div>
              <button onClick={handleSync} disabled={syncing} style={{ display:'flex', alignItems:'center', gap:'5px', background:'rgba(255,255,255,0.06)', border:`1px solid ${BORDER}`, borderRadius:'8px', padding:'5px 12px', cursor:'pointer', color:MUTED, fontSize:'0.72rem', fontWeight:600, minHeight:'auto' }}>
                <RefreshCw size={12} style={{ animation:syncing?'spin 1s linear infinite':'none' }}/>{syncing?'Syncing...':'Sync Now'}
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {dailyData.steps && <StatCard icon="👣" label="Steps" value={Number(dailyData.steps).toLocaleString()} unit="" color={GREEN}/>}
              {dailyData.heart_rate_avg && <StatCard icon="❤️" label="Avg HR" value={dailyData.heart_rate_avg} unit="bpm" color='#ef4444'/>}
              {dailyData.calories_burned && <StatCard icon="🔥" label="Calories" value={dailyData.calories_burned} unit="kcal" color={ORANGE}/>}
              {dailyData.sleep_duration && <StatCard icon="😴" label="Sleep" value={(dailyData.sleep_duration/60).toFixed(1)} unit="h" color={PURPLE}/>}
              {dailyData.hrv && <StatCard icon="📊" label="HRV" value={dailyData.hrv} unit="ms" color={BLUE}/>}
              {dailyData.readiness_score && <StatCard icon="⚡" label="Readiness" value={dailyData.readiness_score} unit="%" color={YELLOW}/>}
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
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {connected.map(device => {
                const conn = connections.find(c => c.provider === device.id);
                return (
                  <div key={device.id} style={{ borderRadius:'16px', overflow:'hidden', background:`linear-gradient(135deg,${device.bg.replace('0.1','0.15')},${SURFACE})`, border:`1px solid ${device.border}`, boxShadow:`0 4px 20px ${device.color}10` }}>
                    <div style={{ height:'3px', background:`linear-gradient(90deg,${device.color},${device.color}44)` }}/>
                    <div style={{ padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'14px' }}>
                      <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:device.bg, border:`1px solid ${device.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{device.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1rem', fontWeight:800, color:TEXT, margin:0 }}>{device.name}</p>
                          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'0.6rem', fontWeight:700, color:GREEN, background:'rgba(76,175,80,0.12)', border:'1px solid rgba(76,175,80,0.25)', borderRadius:'20px', padding:'2px 9px' }}>
                            <CheckCircle size={10}/> Live
                          </span>
                        </div>
                        <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.72rem', color:MUTED, margin:0 }}>
                          Last sync: {conn?.last_synced_at ? new Date(conn.last_synced_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : 'Never'}
                        </p>
                      </div>
                      <button onClick={()=>handleDisconnect(device.id)} style={{ background:'transparent', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:'8px', cursor:'pointer', color:'#ef4444', fontSize:'0.7rem', fontWeight:700, minHeight:'auto', padding:'5px 12px', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available devices */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${ORANGE},${ORANGE}88)` }}/>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:0 }}>
              {connected.length > 0 ? 'Add Another Device' : 'Choose Your Device'}
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {notConnected.map(device => (
              <div key={device.id} style={{ borderRadius:'16px', overflow:'hidden', background:SURFACE, border:`1px solid ${BORDER}`, transition:'all 0.2s', position:'relative' }}
                onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${device.border}`;e.currentTarget.style.boxShadow=`0 4px 20px ${device.color}15`;}}
                onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${BORDER}`;e.currentTarget.style.boxShadow='none';}}>
                {device.popular && (
                  <div style={{ position:'absolute', top:'12px', right:'12px', fontSize:'0.58rem', fontWeight:800, color:'#000', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, borderRadius:'20px', padding:'2px 8px', letterSpacing:'0.05em' }}>POPULAR</div>
                )}
                <div style={{ padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:device.bg, border:`1px solid ${device.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>{device.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1rem', fontWeight:800, color:TEXT, margin:'0 0 3px', letterSpacing:'-0.01em' }}>{device.name}</p>
                    <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.72rem', color:MUTED, margin:'0 0 8px', lineHeight:1.4 }}>{device.desc}</p>
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      {device.data.slice(0,3).map(d => (
                        <span key={d} style={{ fontSize:'0.6rem', fontWeight:600, color:device.color, background:device.bg, border:`1px solid ${device.border}`, borderRadius:'20px', padding:'2px 8px' }}>{d}</span>
                      ))}
                      {device.data.length > 3 && <span style={{ fontSize:'0.6rem', fontWeight:600, color:MUTED, background:S2, border:`1px solid ${BORDER}`, borderRadius:'20px', padding:'2px 8px' }}>+{device.data.length-3} more</span>}
                    </div>
                  </div>
                  <button onClick={() => handleConnect(device)} disabled={connecting===device.id} style={{
                    padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', flexShrink:0,
                    background: connecting===device.id ? S2 : `linear-gradient(135deg,${ORANGE},${YELLOW})`,
                    color: connecting===device.id ? MUTED : '#000',
                    fontFamily:"'DM Sans',system-ui", fontSize:'0.8rem', fontWeight:800,
                    minHeight:'auto', boxShadow: connecting===device.id ? 'none' : `0 4px 16px ${ORANGE}40`,
                    transition:'all 0.2s', whiteSpace:'nowrap',
                  }}>
                    {connecting===device.id ? '...' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy footer */}
        <div style={{ marginTop:'1.5rem', background:'linear-gradient(135deg,#1a2a1a,#1a1a1a)', border:'1px solid rgba(76,175,80,0.15)', borderRadius:'16px', padding:'1.25rem', display:'flex', gap:'14px', alignItems:'flex-start' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(76,175,80,0.1)', border:'1px solid rgba(76,175,80,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.2rem' }}>🔒</div>
          <div>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.85rem', fontWeight:700, color:TEXT, margin:'0 0 4px' }}>Your data stays private</p>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.75rem', color:MUTED, margin:0, lineHeight:1.65 }}>All health data is stored on BrazilFit's own servers. Only you and your PT can see it. No data is ever shared with third parties.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
