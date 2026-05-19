import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import PhotoUploadButton from '../../components/PhotoUploadButton';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import PhotoGallery from '../../components/PhotoGallery';
import { useAuth } from '../../context/AuthContext';
import { TrendingDown, TrendingUp, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import PageIntroModal from '../../components/PageIntroModal';
import toast from 'react-hot-toast';

const BG='#0f0f0f';
const SURFACE='#1a1a1a';
const SURFACE2='#222';
const BORDER='rgba(255,255,255,0.08)';
const TEXT = '#ffffff';
const MUTED='#606060';
const ORANGE = '#FF6B2B';
const GREEN = '#4CAF50';
const RED = '#ef4444';

function SectionLabel({ children, color = ORANGE }) {
  return (
    <PageIntroModal pageKey="progress" title="Track Your Progress" color="#4CAF50" description="Log your measurements - weight, waist, hips and more. Add progress photos to see your visual transformation." />`n    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.875rem' }}>
      <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${color},${color}88)` }}/>
      <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color, textTransform:'uppercase', margin:0 }}>{children}</p>
    </div>
  );
}

function StatCard({ label, value, unit, change, accent }) {
  const isGood = change < 0;
  const changeColor = change === null ? MUTED : isGood ? GREEN : RED;
  const accentColor = accent || ORANGE;
  return (
    <PageIntroModal pageKey="progress" title="Track Your Progress" color="#4CAF50" description="Log your measurements - weight, waist, hips and more. Add progress photos to see your visual transformation." />`n    <div style={{ background:`linear-gradient(145deg, #1e1e1e, #252525)`, borderRadius:16, padding:'1.1rem', border:`1px solid rgba(255,255,255,0.07)`, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:value ? `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` : 'transparent', borderRadius:'16px 16px 0 0' }}/>
      <SectionLabel color={value ? accentColor : MUTED}>{label}</SectionLabel>
      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
        <p style={{ fontSize:'2rem', fontWeight:900, color:value?TEXT:MUTED, letterSpacing:'-0.05em', lineHeight:1, margin:0, fontVariantNumeric:'tabular-nums' }}>{value ?? '--'}</p>
        {value && <span style={{ color:accentColor, fontSize:'0.7rem', fontWeight:400, letterSpacing:'0.05em' }}>{unit}</span>}
      </div>
      {change !== null && change !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
          {isGood ? <TrendingDown size={11} color={GREEN}/> : <TrendingUp size={11} color={RED}/>}
          <p style={{ fontSize:'0.68rem', fontWeight:400, color:changeColor, margin:0 }}>{change > 0 ? '+' : ''}{change} {unit}</p>
        </div>
      )}
    </div>
  );
}

function AddMeasurementModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ entry_date: new Date().toISOString().split('T')[0], weight_kg:'', waist_cm:'', hips_cm:'', chest_cm:'', body_fat_pct:'', notes:'' });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!form.weight_kg && !form.waist_cm && !form.hips_cm && !form.chest_cm) { toast.error('Enter at least one measurement'); return; }
    setSaving(true);
    try {
      await api.post('/progress', { entry_date:form.entry_date, weight_kg:form.weight_kg ? parseFloat(form.weight_kg) : null, waist_cm:form.waist_cm ? parseFloat(form.waist_cm) : null, hips_cm:form.hips_cm ? parseFloat(form.hips_cm) : null, chest_cm:form.chest_cm ? parseFloat(form.chest_cm) : null, body_fat_pct:form.body_fat_pct ? parseFloat(form.body_fat_pct) : null, notes:form.notes || null });
      toast.success('Measurements saved!');
      onSaved(); onClose();
    } catch(e) { toast.error('Failed to save'); } finally { setSaving(false); }
  };
  const fields = [['weight_kg','Weight','kg','75.5'],['waist_cm','Waist','cm','80'],['hips_cm','Hips','cm','95'],['chest_cm','Chest','cm','100'],['body_fat_pct','Body Fat','%','20']];
  return (
    <PageIntroModal pageKey="progress" title="Track Your Progress" color="#4CAF50" description="Log your measurements - weight, waist, hips and more. Add progress photos to see your visual transformation." />`n    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:480, background:SURFACE, borderRadius:'20px 20px 0 0', border:`1px solid ${BORDER}`, borderBottom:'none', maxHeight:'90vh', overflowY:'auto', paddingBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 16px', borderBottom:`1px solid ${BORDER}` }}>
          <div><h3 style={{ color:TEXT, fontWeight:400, fontSize:18, margin:0 }}>Add Measurements</h3><p style={{ color:MUTED, fontSize:13, margin:'4px 0 0' }}>Track your body changes over time</p></div>
          <button onClick={onClose} style={{ background:SURFACE2, border:'none', color:MUTED, borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:14, lineHeight:1 }}>X</button>
        </div>
        <div style={{ padding:'20px 20px 0' }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ color:MUTED, fontSize:12, display:'block', marginBottom:6, fontWeight:600 }}>DATE</label>
            <input type="date" value={form.entry_date} onChange={e => setForm(f => ({...f, entry_date:e.target.value}))} style={{ width:'100%', background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, padding:'11px 14px', fontSize:14, boxSizing:'border-box', outline:'none' }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {fields.map(([key, label, unit, placeholder]) => (
              <div key={key}>
                <label style={{ color:MUTED, fontSize:11, display:'block', marginBottom:5, fontWeight:600 }}>{label.toUpperCase()} ({unit})</label>
                <input type="number" step="0.1" value={form[key]} onChange={e => setForm(f => ({...f, [key]:e.target.value}))} placeholder={placeholder} style={{ width:'100%', background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, padding:'11px 12px', fontSize:15, boxSizing:'border-box', outline:'none', fontWeight:600 }}/>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ color:MUTED, fontSize:11, display:'block', marginBottom:5, fontWeight:600 }}>NOTES (optional)</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="How are you feeling?" style={{ width:'100%', background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:10, color:TEXT, padding:'11px 14px', fontSize:14, boxSizing:'border-box', outline:'none' }}/>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ width:'100%', background:saving?SURFACE2:`linear-gradient(135deg,${ORANGE},#FFD600)`, border:'none', borderRadius:14, color:saving?MUTED:'#000', padding:'16px', fontSize:16, fontWeight:800, cursor:saving?'default':'pointer', boxShadow:saving?'none':'0 4px 20px rgba(255,107,43,0.4)' }}>{saving ? 'Saving...' : 'Save Measurements'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ClientProgress() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('progress');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { fetchProgress(); }, [refreshKey]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/progress/' + user.clientId);
      setEntries(res.data?.entries || []);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const latest = entries[entries.length - 1] || null;
  const first = entries[0] || null;
  const weightChange = latest && first && latest.weight_kg && first.weight_kg ? parseFloat((latest.weight_kg - first.weight_kg).toFixed(1)) : null;
  const waistChange = latest && first && latest.waist_cm && first.waist_cm ? parseFloat((latest.waist_cm - first.waist_cm).toFixed(1)) : null;
  const hipsChange = latest && first && latest.hips_cm && first.hips_cm ? parseFloat((latest.hips_cm - first.hips_cm).toFixed(1)) : null;
  const chestChange = latest && first && latest.chest_cm && first.chest_cm ? parseFloat((latest.chest_cm - first.chest_cm).toFixed(1)) : null;
  const shown = expanded ? entries : [...entries].reverse().slice(0, 3);

  return (
    <PageIntroModal pageKey="progress" title="Track Your Progress" color="#4CAF50" description="Log your measurements - weight, waist, hips and more. Add progress photos to see your visual transformation." />`n    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem 1.25rem' }}>
        <BackButton to="/client" />
        <div style={{ margin:'1.25rem 0 1rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Your Journey</p>
            <h1 style={{ fontFamily:"'DM Sans',system-ui", fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:0, lineHeight:1 }}>Progress</h1>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display:'flex', alignItems:'center', gap:6, background:`linear-gradient(135deg,${ORANGE},#FFD600)`, border:'none', borderRadius:12, color:'#000', padding:'10px 18px', fontSize:13, fontWeight:800, cursor:'pointer', boxShadow:`0 4px 16px rgba(255,107,43,0.4)` }}>
            <Plus size={14}/> Add
          </button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:'1.5rem' }}>
          {[{key:'progress',label:' Stats'},{key:'photos',label:' Photos'}].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding:'8px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, minHeight:'auto',
              background: activeTab===t.key ? `rgba(255,107,43,0.18)` : 'rgba(255,255,255,0.04)',
              color: activeTab===t.key ? ORANGE : '#aaa',
              border: activeTab===t.key ? `1px solid rgba(255,107,43,0.4)` : '1px solid rgba(255,255,255,0.08)',
            }}>{t.label}</button>
          ))}
        </div>
        {activeTab === 'progress' && (
          <div>
            {loading ? <div style={{ textAlign:'center', padding:'3rem 0', color:MUTED }}>Loading...</div> : entries.length === 0 ? (
              <div style={{ background:SURFACE, borderRadius:16, padding:'2.5rem 1.5rem', border:`1px solid ${BORDER}`, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:16 }}></div>
                <h3 style={{ color:TEXT, fontWeight:400, fontSize:'1.1rem', margin:'0 0 8px' }}>Start tracking your progress</h3>
                <p style={{ color:MUTED, fontSize:14, margin:'0 0 20px', lineHeight:1.6 }}>Add your first measurements to see how your body changes over time.</p>
                <button onClick={() => setShowAddModal(true)} style={{ background:ORANGE, border:'none', borderRadius:12, color:'#fff', padding:'14px 28px', fontSize:15, fontWeight:400, cursor:'pointer' }}>+ Add First Measurement</button>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, marginBottom:'1rem' }}>
                  <StatCard label="Current Weight" value={latest?.weight_kg} unit="kg" change={weightChange}/>
                  <StatCard label="Waist" value={latest?.waist_cm} unit="cm" change={waistChange}/>
                  <StatCard label="Hips" value={latest?.hips_cm} unit="cm" change={hipsChange}/>
                  <StatCard label="Chest" value={latest?.chest_cm} unit="cm" change={chestChange}/>
                </div>
                {entries.length > 1 && (
                  <div style={{ background:`linear-gradient(135deg, ${ORANGE}15, #FFD60010)`, border:`1px solid ${ORANGE}33`, borderRadius:14, padding:'1rem 1.25rem', marginBottom:'1rem' }}>
                    <p style={{ color:TEXT, fontSize:14, margin:0, lineHeight:1.6 }}>
                      {weightChange !== null && weightChange < 0 ? ` You have lost ${Math.abs(weightChange)}kg since you started. Keep going!` : weightChange !== null && weightChange > 0 ? ` You have gained ${weightChange}kg  muscle building in progress!` : ` Tracking ${entries.length} check-ins over time.`}
                    </p>
                  </div>
                )}
                <div style={{ marginTop:'1.5rem' }}>
                  <SectionLabel>History</SectionLabel>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {shown.map((entry, i) => (
                      <div key={i} style={{ background:'linear-gradient(135deg,#1a2a1a,#1a1a1a)', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(76,175,80,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <p style={{ color:TEXT, fontWeight:700, fontSize:14, margin:'0 0 3px' }}>{new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</p>
                          <p style={{ color:MUTED, fontSize:12, margin:0 }}>{[entry.waist_cm && `Waist ${entry.waist_cm}cm`, entry.hips_cm && `Hips ${entry.hips_cm}cm`, entry.chest_cm && `Chest ${entry.chest_cm}cm`].filter(Boolean).join('  ')}</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontSize:'1.6rem', fontWeight:800, color:GREEN, letterSpacing:'-0.04em', margin:0 }}>{entry.weight_kg || ''}</p>
                          <p style={{ color:MUTED, fontSize:11, margin:0 }}>kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {entries.length > 3 && (
                    <button onClick={() => setExpanded(!expanded)} style={{ width:'100%', background:'none', border:`1px solid ${BORDER}`, borderRadius:10, color:MUTED, padding:'10px', fontSize:13, cursor:'pointer', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      {expanded ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> Show all {entries.length} entries</>}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'photos' && (
          <div>
            <div style={{ marginBottom:'1rem', display:'flex', justifyContent:'flex-end' }}><PhotoUploadButton clientId={user.clientId} onUploadSuccess={() => setRefreshKey(k => k+1)}/></div>
            <BeforeAfterSlider key={refreshKey} clientId={user.clientId}/>
            <div style={{ marginTop:'1.5rem' }}><PhotoGallery key={refreshKey} clientId={user.clientId}/></div>
          </div>
        )}
      </div>
      {showAddModal && <AddMeasurementModal onClose={() => setShowAddModal(false)} onSaved={() => setRefreshKey(k => k+1)}/>}
    </div>
  );
}





