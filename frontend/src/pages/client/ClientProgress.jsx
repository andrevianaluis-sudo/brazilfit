import { useState } from 'react';
import BackButton from '../../components/BackButton';
import PhotoUploadButton from '../../components/PhotoUploadButton';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import PhotoGallery from '../../components/PhotoGallery';
import { useAuth } from '../../context/AuthContext';
import { TrendingDown, TrendingUp, Camera } from 'lucide-react';

const BG = '#141414';
const SURFACE = '#1e1e1e';
const SURFACE2 = '#272727';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

function SectionLabel({ children, color = MUTED }) {
  return <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.18em', color, textTransform:'uppercase', margin:'0 0 0.75rem' }}>{children}</p>;
}

export default function ClientProgress() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [measurements] = useState([
    { date:'2024-04-15', weight:78.5, waist:82, hips:95, chest:100 },
    { date:'2024-03-15', weight:80.2, waist:85, hips:98, chest:103 },
    { date:'2024-02-15', weight:82.0, waist:88, hips:101, chest:105 },
  ]);

  const latest = measurements[0];
  const previous = measurements[measurements.length - 1];
  const weightChange = latest.weight - previous.weight;
  const waistChange = latest.waist - previous.waist;

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem 1.25rem' }}>
        <BackButton to="/client" />

        {/* Header */}
        <div style={{ margin:'1.25rem 0 1.5rem' }}>
          <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:'0 0 0.4rem' }}>Your Journey</p>
          <h1 style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2rem', fontWeight:700, color:TEXT, letterSpacing:'-0.03em', margin:0 }}>Progress</h1>
        </div>

        {/* Key stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px', marginBottom:'1rem' }}>
          {/* Weight */}
          <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}` }}>
            <SectionLabel>Current Weight</SectionLabel>
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2.2rem', fontWeight:800, color:TEXT, letterSpacing:'-0.04em', lineHeight:1, margin:'0 0 2px' }}>{latest.weight}</p>
            <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', color:MUTED, margin:'0 0 0.5rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>kg</p>
            <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
              {weightChange < 0 ? <TrendingDown size={11} color={GREEN}/> : <TrendingUp size={11} color={ORANGE}/>}
              <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', fontWeight:700, color:weightChange<0?GREEN:ORANGE, margin:0 }}>
                {weightChange<0?'':'+' }{Math.abs(weightChange).toFixed(1)} kg overall
              </p>
            </div>
          </div>

          {/* Check-ins */}
          <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}` }}>
            <SectionLabel>Check-ins</SectionLabel>
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2.2rem', fontWeight:800, color:GREEN, letterSpacing:'-0.04em', lineHeight:1, margin:'0 0 2px' }}>{measurements.length}</p>
            <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', color:MUTED, margin:0, fontWeight:500 }}>measurements logged</p>
          </div>

          {/* Waist */}
          <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}` }}>
            <SectionLabel>Waist</SectionLabel>
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2.2rem', fontWeight:800, color:ORANGE, letterSpacing:'-0.04em', lineHeight:1, margin:'0 0 2px' }}>{latest.waist}</p>
            <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', color:MUTED, margin:'0 0 0.5rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>cm</p>
            <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', fontWeight:700, color:waistChange<0?GREEN:ORANGE, margin:0 }}>
              {waistChange<0?'':'+' }{Math.abs(waistChange)} cm overall
            </p>
          </div>

          {/* Hips */}
          <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.1rem', border:`1px solid ${BORDER}` }}>
            <SectionLabel>Hips</SectionLabel>
            <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'2.2rem', fontWeight:800, color:YELLOW, letterSpacing:'-0.04em', lineHeight:1, margin:'0 0 2px' }}>{latest.hips}</p>
            <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.65rem', color:MUTED, margin:0, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>cm</p>
          </div>
        </div>

        {/* Progress Photos */}
        <div style={{ backgroundColor:SURFACE, borderRadius:'12px', padding:'1.25rem', border:`1px solid ${BORDER}`, marginBottom:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Camera size={15} color={ORANGE} />
              <SectionLabel color={ORANGE}>Progress Photos</SectionLabel>
            </div>
            {user?.clientId && (
              <PhotoUploadButton clientId={user.clientId} onUploadSuccess={() => setRefreshKey(k => k+1)} />
            )}
          </div>

          {user?.clientId && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {['front','side','back'].map(angle => (
                <div key={angle}>
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.14em', color:MUTED, textTransform:'uppercase', margin:'0 0 0.6rem' }}>{angle} view</p>
                  <BeforeAfterSlider key={`${angle}-${refreshKey}`} clientId={user.clientId} angle={angle} />
                </div>
              ))}
              <PhotoGallery key={`gallery-${refreshKey}`} clientId={user.clientId} />
            </div>
          )}
        </div>

        {/* Measurement History */}
        <div>
          <SectionLabel>Measurement History</SectionLabel>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {measurements.map((m, i) => (
              <div key={i} style={{ backgroundColor:SURFACE, borderRadius:'10px', padding:'0.875rem 1rem', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between', opacity: i === 0 ? 1 : 0.7 }}>
                <div>
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.875rem', fontWeight:600, color:i===0?TEXT:MUTED, margin:'0 0 2px' }}>{m.date}</p>
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.7rem', color:MUTED, margin:0 }}>
                    Waist {m.waist} · Hips {m.hips} · Chest {m.chest} cm
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:"'Clash Display', system-ui", fontSize:'1.3rem', fontWeight:800, color:i===0?GREEN:MUTED, letterSpacing:'-0.03em', margin:0 }}>{m.weight}</p>
                  <p style={{ fontFamily:"'Satoshi', system-ui", fontSize:'0.6rem', color:MUTED, margin:0, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
