import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Crown, Users, Plus, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG = '#141414';
const SURFACE = '#2a2a2a';
const SURFACE2 = '#333333';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

function getStatusColor(status) {
  if (status === 'renew') return '#ef4444';
  if (status === 'critical') return ORANGE;
  if (status === 'warning') return YELLOW;
  return GREEN;
}

function StatusBadge({ status, sessionsRemaining }) {
  const color = getStatusColor(status);
  const label = status === 'renew' ? 'Renew Now' : `${sessionsRemaining} Left`;
  return (
    <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase', color, backgroundColor:`${color}18`, padding:'3px 8px', borderRadius:'4px' }}>
      {label}
    </span>
  );
}

function BlockProgress({ used, total = 10 }) {
  const pct = Math.min(100, (used / total) * 100);
  const color = pct >= 90 ? '#ef4444' : pct >= 80 ? ORANGE : GREEN;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', flex:1 }}>
      <div style={{ flex:1, backgroundColor:SURFACE2, borderRadius:'2px', height:'3px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, backgroundColor:color, borderRadius:'2px', transition:'width 0.5s ease' }} />
      </div>
      <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', color:MUTED, fontWeight:500, flexShrink:0 }}>{used}/{total}</span>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'0.75rem 1rem', border:`1px solid ${BORDER}`, borderRadius:'8px',
  backgroundColor:SURFACE2, color:TEXT, fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem',
  outline:'none', transition:'border-color 0.15s', boxSizing:'border-box',
};

export default function PTClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    fullName:'', email:'', phone:'', username:'', password:'',
    clientType:'F2F', package:'400', sessionsInBlock:'10',
    startDate: new Date().toISOString().split('T')[0], notes:''
  });
  const [creatingClient, setCreatingClient] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let pwd = '';
    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewClientForm(f => ({...f, password: pwd}));
  };

  const handleAddClient = async () => {
    if (!newClientForm.fullName || !newClientForm.email || !newClientForm.username || !newClientForm.password) {
      toast.error('Please fill all required fields'); return;
    }
    setCreatingClient(true);
    try {
      await api.post('/pt/clients/create', {
        name: newClientForm.fullName, email: newClientForm.email, phone: newClientForm.phone,
        username: newClientForm.username, password: newClientForm.password,
        client_type: newClientForm.clientType, block_price: parseInt(newClientForm.package),
        block_start_date: newClientForm.startDate, sessions_in_block: parseInt(newClientForm.sessionsInBlock),
        notes: newClientForm.notes
      });
      toast.success(`Client created! Username: ${newClientForm.username}`);
      setShowAddModal(false);
      setNewClientForm({ fullName:'', email:'', phone:'', username:'', password:'', clientType:'F2F', package:'400', sessionsInBlock:'10', startDate: new Date().toISOString().split('T')[0], notes:'' });
      const res = await api.get('/pt/clients');
      setClients(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create client');
    } finally { setCreatingClient(false); }
  };

  useEffect(() => {
    api.get('/pt/clients')
      .then(res => { setClients(res.data); setLoading(false); })
      .catch(() => { toast.error('Failed to load clients'); setLoading(false); });
  }, []);

  const alerts = clients.filter(c => c.status === 'renew' || c.status === 'critical');
  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'alert') return c.status === 'renew' || c.status === 'critical';
    if (filter === 'f2f') return c.client_type === 'F2F';
    if (filter === 'online') return c.client_type === 'Online';
    return true;
  });

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div style={{ width:'20px', height:'20px', border:`2px solid ${ORANGE}`, borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding:'1.5rem 1.25rem', paddingBottom:'4rem' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 0.3rem' }}>PT Dashboard</p>
          <h1 style={{ fontFamily:"'DM Sans', system-ui", fontSize:'1.75rem', fontWeight:400, color:TEXT, letterSpacing:'-0.04em', margin:'0 0 0.25rem' }}>Clients</h1>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.8rem', color:MUTED, margin:0 }}>{clients.length} active · {alerts.length} need attention</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          display:'flex', alignItems:'center', gap:'6px', padding:'0.7rem 1.25rem',
          background:`linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
          border:'none', borderRadius:'8px', color:'#000',
          fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:300,
          cursor:'pointer', minHeight:'auto', transition:'all 0.15s',
        }}>
          <Plus size={15} /> Add Client
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginBottom:'1.25rem' }}>
        {[
          { value: clients.length, label: 'Total', color: TEXT },
          { value: clients.filter(c=>c.client_type==='F2F').length, label: 'F2F', color: GREEN },
          { value: alerts.length, label: 'Alerts', color: alerts.length > 0 ? '#ef4444' : MUTED },
        ].map((s,i) => (
          <div key={i} style={{ backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem', border:`1px solid ${BORDER}`, textAlign:'center' }}>
            <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'1.4rem', fontWeight:300, color:s.color, letterSpacing:'-0.04em', margin:'0 0 2px' }}>{s.value}</p>
            <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.62rem', color:MUTED, margin:0, fontWeight:400, letterSpacing:'0.1em', textTransform:'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:'0.75rem' }}>
        <Search size={15} color={MUTED} style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)' }} />
        <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft:'2.5rem' }}
          onFocus={e => e.target.style.borderColor = ORANGE}
          onBlur={e => e.target.style.borderColor = BORDER} />
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'1.25rem', overflowX:'auto', paddingBottom:'2px' }}>
        {[
          { key:'all', label:'All' },
          { key:'alert', label:`⚠️ Alerts (${alerts.length})` },
          { key:'f2f', label:'F2F' },
          { key:'online', label:'Online' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            flexShrink:0, padding:'6px 14px', borderRadius:'6px',
            border:`1px solid ${filter===f.key ? ORANGE : BORDER}`,
            backgroundColor: filter===f.key ? `${ORANGE}20` : 'transparent',
            color: filter===f.key ? ORANGE : MUTED,
            fontFamily:"'DM Sans', system-ui", fontSize:'0.78rem', fontWeight:400,
            cursor:'pointer', minHeight:'auto', whiteSpace:'nowrap', transition:'all 0.15s',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Client list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {filtered.map(c => {
          const statusColor = getStatusColor(c.status);
          const initials = c.name.charAt(0).toUpperCase();
          const avatarColor = c.client_type === 'Online' ? '#60a5fa' : ORANGE;
          return (
            <Link key={c.id} to={`/pt/clients/${c.id}`} style={{
              display:'flex', alignItems:'center', gap:'12px', padding:'0.875rem 1rem',
              backgroundColor:SURFACE, borderRadius:'10px',
              border:`1px solid ${c.status==='renew' ? 'rgba(239,68,68,0.25)' : c.status==='critical' ? `${ORANGE}25` : BORDER}`,
              textDecoration:'none', color:'inherit', transition:'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=`${ORANGE}44`; e.currentTarget.style.backgroundColor=SURFACE2; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=c.status==='renew'?'rgba(239,68,68,0.25)':c.status==='critical'?`${ORANGE}25`:BORDER; e.currentTarget.style.backgroundColor=SURFACE; }}
            >
              {/* Avatar */}
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', backgroundColor:`${avatarColor}18`, border:`1px solid ${avatarColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', system-ui", fontSize:'0.9rem', fontWeight:300, color:avatarColor, flexShrink:0 }}>
                {initials}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'3px' }}>
                  <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.9rem', fontWeight:400, color:TEXT, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                  {c.is_pro === 1 && <Crown size={12} color={YELLOW} />}
                  <span style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:400, color: c.client_type==='Online' ? '#60a5fa' : MUTED, backgroundColor: c.client_type==='Online' ? 'rgba(96,165,250,0.1)' : SURFACE2, padding:'2px 6px', borderRadius:'3px', flexShrink:0 }}>
                    {c.client_type} · £{c.block_price}
                  </span>
                </div>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.72rem', color:MUTED, margin:'0 0 6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</p>
                <BlockProgress used={c.sessions_used} />
              </div>

              {/* Status + arrow */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                <StatusBadge status={c.status} sessionsRemaining={c.sessions_remaining} />
                <ChevronRight size={14} color={MUTED} />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
          <Users size={32} color={MUTED} style={{ marginBottom:'1rem', opacity:0.4 }} />
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'1.1rem', fontWeight:400, color:MUTED, letterSpacing:'-0.04em', margin:'0 0 0.4rem' }}>No clients found</p>
          <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.82rem', color:MUTED, margin:0, opacity:0.7 }}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.8)', zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor:'#111', borderRadius:'16px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflow:'auto', border:`1px solid ${BORDER}` }}>

            <div style={{ padding:'1.25rem 1.5rem', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, backgroundColor:'#111', zIndex:1 }}>
              <div>
                <p style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.6rem', fontWeight:400, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 2px' }}>PT Dashboard</p>
                <h2 style={{ fontFamily:"'DM Sans', system-ui", fontSize:'1.2rem', fontWeight:400, color:TEXT, letterSpacing:'-0.04em', margin:0 }}>Add New Client</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, padding:'4px', minHeight:'auto', minWidth:'auto' }}><X size={18} /></button>
            </div>

            <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { label:'Full Name *', key:'fullName', type:'text', placeholder:'e.g. John Smith' },
                { label:'Email *', key:'email', type:'email', placeholder:'john@example.com' },
                { label:'Phone', key:'phone', type:'tel', placeholder:'07700 123456' },
                { label:'Username *', key:'username', type:'text', placeholder:'john.smith' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>{field.label}</label>
                  <input type={field.type} value={newClientForm[field.key]} placeholder={field.placeholder}
                    onChange={e => setNewClientForm(f => ({...f, [field.key]: e.target.value, ...(field.key==='fullName' ? {username: e.target.value.toLowerCase().split(' ')[0]||''} : {})}))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = ORANGE}
                    onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
              ))}

              {/* Password */}
              <div>
                <label style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Password *</label>
                <div style={{ display:'flex', gap:'6px' }}>
                  <input type="text" value={newClientForm.password} onChange={e => setNewClientForm(f=>({...f,password:e.target.value}))} placeholder="Auto-generated"
                    style={{ ...inputStyle, flex:1 }}
                    onFocus={e => e.target.style.borderColor = ORANGE}
                    onBlur={e => e.target.style.borderColor = BORDER} />
                  <button onClick={generatePassword} style={{ padding:'0 1rem', backgroundColor:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:'8px', color:ORANGE, fontFamily:"'DM Sans', system-ui", fontSize:'0.78rem', fontWeight:400, cursor:'pointer', minHeight:'auto', whiteSpace:'nowrap' }}>Generate</button>
                </div>
              </div>

              {/* Package type */}
              <div>
                <label style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Package Type</label>
                <select value={newClientForm.clientType} onChange={e => setNewClientForm(f=>({...f,clientType:e.target.value}))} style={inputStyle}>
                  <option value="F2F">F2F £400</option>
                  <option value="Online">Online £350</option>
                  <option value="Elite">Elite £600</option>
                </select>
              </div>

              {/* Sessions + Date */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <div>
                  <label style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Sessions</label>
                  <input type="number" value={newClientForm.sessionsInBlock} min="1" onChange={e => setNewClientForm(f=>({...f,sessionsInBlock:e.target.value}))}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = ORANGE} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
                <div>
                  <label style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Start Date</label>
                  <input type="date" value={newClientForm.startDate} onChange={e => setNewClientForm(f=>({...f,startDate:e.target.value}))}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = ORANGE} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontFamily:"'DM Sans', system-ui", fontSize:'0.65rem', fontWeight:400, letterSpacing:'0.12em', color:MUTED, textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Notes</label>
                <textarea value={newClientForm.notes} onChange={e => setNewClientForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes..." rows={3}
                  style={{ ...inputStyle, resize:'vertical' }}
                  onFocus={e => e.target.style.borderColor = ORANGE}
                  onBlur={e => e.target.style.borderColor = BORDER} />
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:'8px', paddingTop:'0.25rem' }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex:1, padding:'0.875rem', backgroundColor:'transparent', border:`1px solid ${BORDER}`, borderRadius:'8px', color:MUTED, fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:600, cursor:'pointer', minHeight:'auto' }}>Cancel</button>
                <button onClick={handleAddClient} disabled={creatingClient} style={{ flex:2, padding:'0.875rem', background:`linear-gradient(135deg, ${ORANGE}, ${YELLOW})`, border:'none', borderRadius:'8px', color:'#000', fontFamily:"'DM Sans', system-ui", fontSize:'0.875rem', fontWeight:300, cursor:creatingClient?'not-allowed':'pointer', opacity:creatingClient?0.7:1, minHeight:'auto' }}>
                  {creatingClient ? 'Creating...' : 'Create Client Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
