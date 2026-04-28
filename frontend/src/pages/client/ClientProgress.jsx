import { useState } from 'react';
import BackButton from '../../components/BackButton';
import PhotoUploadButton from '../../components/PhotoUploadButton';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import PhotoGallery from '../../components/PhotoGallery';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <div className="w-full bg-white min-h-screen pb-24 animate-fade-in">
      {/* Hero Section */}
      <div className="relative w-full h-80 overflow-hidden">
        <img
          src="/images/newcastle-113.jpg"
          alt="Transformation journey"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle dark gradient overlay at bottom 30% */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.3) 30%, transparent 70%)',
          }}
        />
        {/* Overlay text */}
        <div className="absolute bottom-6 left-5 text-white">
          <h1 className="font-light uppercase mb-2" style={{ fontSize: '32px' }}>YOUR PROGRESS</h1>
          <p className="text-xs uppercase" style={{ letterSpacing: '3px' }}>
            10 WEEKS OF TRANSFORMATION
          </p>
        </div>
      </div>

      <div className="px-5 py-8 space-y-8">
        <BackButton to="/client/home" />
        {/* Stats Grid - Premium minimalist design */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Weight */}
          <div className="bg-white border border-grey-300 rounded-lg p-6">
            <p className="text-grey-200 text-xs uppercase tracking-wider font-medium mb-3">Current Weight</p>
            <p className="font-black text-black mb-2" style={{ fontSize: '36px' }}>{latest.weight}</p>
            <p className={`text-sm font-medium ${weightChange < 0 ? 'text-brazil-green' : 'text-orange-400'}`}>
              {weightChange < 0 ? '↓' : '↑'} {Math.abs(weightChange).toFixed(1)} kg
            </p>
          </div>

          {/* Entries */}
          <div className="bg-white border border-grey-300 rounded-lg p-6">
            <p className="text-grey-200 text-xs uppercase tracking-wider font-medium mb-3">Entries</p>
            <p className="text-5xl font-black text-brazil-green">{measurements.length}</p>
          </div>

          {/* Waist */}
          <div className="bg-white border border-grey-300 rounded-lg p-6">
            <p className="text-grey-200 text-xs uppercase tracking-wider font-medium mb-3">Waist</p>
            <p className="text-5xl font-black text-black mb-1">{latest.waist}</p>
            <p className="text-xs text-grey-200">cm</p>
          </div>

          {/* Hips */}
          <div className="bg-white border border-grey-300 rounded-lg p-6">
            <p className="text-grey-200 text-xs uppercase tracking-wider font-medium mb-3">Hips</p>
            <p className="text-5xl font-black text-black mb-1">{latest.hips}</p>
            <p className="text-xs text-grey-200">cm</p>
          </div>
        </div>

        {/* Progress Photos Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-grey-200 text-xs uppercase tracking-wider font-medium">Progress Photos</p>
            {user?.clientId && <PhotoUploadButton clientId={user.clientId} onUploadSuccess={() => setRefreshKey(k => k + 1)} />}
          </div>

          {user?.clientId && (
            <>
              {/* Before & After Sliders */}
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-black font-semibold text-xs uppercase tracking-wider mb-3">Front View</h3>
                  <BeforeAfterSlider key={`front-${refreshKey}`} clientId={user.clientId} angle="front" />
                </div>
                <div>
                  <h3 className="text-black font-semibold text-xs uppercase tracking-wider mb-3">Side View</h3>
                  <BeforeAfterSlider key={`side-${refreshKey}`} clientId={user.clientId} angle="side" />
                </div>
                <div>
                  <h3 className="text-black font-semibold text-xs uppercase tracking-wider mb-3">Back View</h3>
                  <BeforeAfterSlider key={`back-${refreshKey}`} clientId={user.clientId} angle="back" />
                </div>
              </div>

              {/* Photo Gallery */}
              <PhotoGallery key={`gallery-${refreshKey}`} clientId={user.clientId} />
            </>
          )}
        </div>

        {/* Measurement History */}
        <div>
          <h2 className="text-black text-sm font-bold uppercase tracking-widest mb-4">History</h2>
          <div className="space-y-2">
            {measurements.map((m, i) => (
              <div key={i} className="bg-white border border-grey-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-black font-bold text-sm">{m.date}</p>
                  <p className="text-brazil-green font-bold">{m.weight} kg</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <p className="text-grey-200">Waist</p>
                    <p className="text-black font-bold">{m.waist} cm</p>
                  </div>
                  <div>
                    <p className="text-grey-200">Hips</p>
                    <p className="text-black font-bold">{m.hips} cm</p>
                  </div>
                  <div>
                    <p className="text-grey-200">Chest</p>
                    <p className="text-black font-bold">{m.chest} cm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
