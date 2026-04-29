import { useState } from 'react';
import BackButton from '../../components/BackButton';
import PhotoUploadButton from '../../components/PhotoUploadButton';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import PhotoGallery from '../../components/PhotoGallery';
import { useAuth } from '../../context/AuthContext';
import { TrendingDown, TrendingUp } from 'lucide-react';

const Label = ({ children }) => (
  <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>{children}</p>
);

const Line = () => <div style={{ height: '1px', backgroundColor: '#141414' }} />;

export default function ClientProgress() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [measurements] = useState([
    { date: '2024-04-15', weight: 78.5, waist: 82, hips: 95, chest: 100 },
    { date: '2024-03-15', weight: 80.2, waist: 85, hips: 98, chest: 103 },
    { date: '2024-02-15', weight: 82.0, waist: 88, hips: 101, chest: 105 },
  ]);

  const latest = measurements[0];
  const previous = measurements[measurements.length - 1];
  const weightChange = latest.weight - previous.weight;
  const waistChange = latest.waist - previous.waist;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingBottom: '100px', width: '100%' }}>

      {/* Header */}
      <div style={{ padding: '2rem 2rem 1.5rem' }}>
        <BackButton to="/client" />
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: '#4CAF50', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Your journey</p>
          <h1 style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Progress</h1>
        </div>
      </div>

      <Line />

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {/* Weight */}
        <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid #141414', borderBottom: '1px solid #141414' }}>
          <Label>Current weight</Label>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.4rem' }}>{latest.weight}</p>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: '0 0 0.5rem', fontWeight: 500 }}>kg</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {weightChange < 0
              ? <TrendingDown size={12} color="#4CAF50" />
              : <TrendingUp size={12} color="#FF6B2B" />}
            <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', fontWeight: 700, color: weightChange < 0 ? '#4CAF50' : '#FF6B2B', margin: 0 }}>
              {weightChange < 0 ? '' : '+'}{Math.abs(weightChange).toFixed(1)} kg overall
            </p>
          </div>
        </div>

        {/* Entries */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #141414' }}>
          <Label>Check-ins</Label>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.4rem' }}>{measurements.length}</p>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>measurements logged</p>
        </div>

        {/* Waist */}
        <div style={{ padding: '1.5rem 2rem', borderRight: '1px solid #141414' }}>
          <Label>Waist</Label>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#FF6B2B', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.4rem' }}>{latest.waist}</p>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: '0 0 0.5rem', fontWeight: 500 }}>cm</p>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', fontWeight: 700, color: waistChange < 0 ? '#4CAF50' : '#FF6B2B', margin: 0 }}>
            {waistChange < 0 ? '' : '+'}{Math.abs(waistChange)} cm overall
          </p>
        </div>

        {/* Hips */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <Label>Hips</Label>
          <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: 800, color: '#FFD600', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 0.4rem' }}>{latest.hips}</p>
          <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#3a3a3a', margin: 0, fontWeight: 500 }}>cm</p>
        </div>
      </div>

      <Line />

      {/* Progress Photos */}
      <div style={{ padding: '1.5rem 2rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label>Progress Photos</Label>
        {user?.clientId && (
          <PhotoUploadButton clientId={user.clientId} onUploadSuccess={() => setRefreshKey(k => k + 1)} />
        )}
      </div>

      {user?.clientId && (
        <div style={{ padding: '0 2rem' }}>
          {/* Before/After Sliders */}
          {['front', 'side', 'back'].map(angle => (
            <div key={angle} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: '#3a3a3a', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>{angle} view</p>
              <BeforeAfterSlider key={`${angle}-${refreshKey}`} clientId={user.clientId} angle={angle} />
            </div>
          ))}

          {/* Gallery */}
          <PhotoGallery key={`gallery-${refreshKey}`} clientId={user.clientId} />
        </div>
      )}

      <Line />

      {/* Measurement History */}
      <div style={{ padding: '1.5rem 2rem 0.75rem' }}>
        <Label>Measurement History</Label>
      </div>

      {measurements.map((m, i) => (
        <div key={i}>
          <div style={{ padding: '1.1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.9rem', fontWeight: 600, color: i === 0 ? '#fff' : '#3a3a3a', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{m.date}</p>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.72rem', color: '#2a2a2a', margin: 0, fontWeight: 500 }}>
                Waist {m.waist} · Hips {m.hips} · Chest {m.chest} cm
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: "'Clash Display', system-ui, sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#4CAF50', letterSpacing: '-0.03em', margin: 0 }}>{m.weight}</p>
              <p style={{ fontFamily: "'Satoshi', system-ui, sans-serif", fontSize: '0.6rem', color: '#3a3a3a', margin: 0, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>kg</p>
            </div>
          </div>
          {i < measurements.length - 1 && <Line />}
        </div>
      ))}

    </div>
  );
}
