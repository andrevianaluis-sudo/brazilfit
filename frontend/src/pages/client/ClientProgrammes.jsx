import { useState } from 'react';
import { ChevronRight, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PROGRAMMES } from '../../data/programmes';
import BrowseProgrammesScreen from './BrowseProgrammesScreen';
import ProgrammeDetailScreen from './ProgrammeDetailScreen';

export default function ClientProgrammes() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('programmes');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(null);

  // Get the client's current programme (first one for now, in real app would come from API)
  const currentProgramme = PROGRAMMES[0];

  if (screen === 'browse') {
    return (
      <BrowseProgrammesScreen
        onBack={() => setScreen('programmes')}
        onSelectProgramme={(id) => {
          setSelectedProgrammeId(id);
          setScreen('detail');
        }}
      />
    );
  }

  if (screen === 'detail' && selectedProgrammeId) {
    const programme = PROGRAMMES.find(p => p.id === selectedProgrammeId);
    return (
      <ProgrammeDetailScreen
        programme={programme}
        onBack={() => setScreen('programmes')}
        onBrowseOthers={() => setScreen('browse')}
      />
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="w-full min-h-screen pb-24 animate-fade-in" style={{ backgroundColor: '#1C1C1E' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-6 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full bg-grey-300 flex items-center justify-center text-grey-200 font-bold text-sm ${
          user?.isPro ? 'ring-2 ring-brazil-green' : ''
        }`}>
          {initials}
        </div>
      </div>

      {currentProgramme ? (
        <>
          {/* Featured Programme Card */}
          <button
            onClick={() => {
              setSelectedProgrammeId(currentProgramme.id);
              setScreen('detail');
            }}
            className="px-5 mb-6 transition-transform active:scale-95"
          >
            <div className="relative rounded-2xl overflow-hidden group">
              {/* Background image or gradient */}
              <div
                className={`w-full h-64 bg-gradient-to-b ${currentProgramme.backgroundGradient}`}
              />

              {/* Label overlay top left */}
              <div className="absolute top-4 left-4">
                <span className="bg-brazil-green text-black text-[10px] font-bold px-3 py-1 rounded-full">
                  CURRENT PROGRAMME
                </span>
              </div>

              {/* Title and info overlay bottom left */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <h2 className="text-2xl font-black text-white mb-2">{currentProgramme.title}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-grey-300 text-sm">{currentProgramme.duration} {currentProgramme.durationUnit}</p>
                  <p className="text-grey-300 text-sm">{currentProgramme.difficulty}</p>
                </div>
              </div>

              {/* Right arrow */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-100 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </button>

          {/* Sessions list */}
          <div className="px-5">
            <p className="text-grey-300 text-xs font-bold uppercase tracking-widest mb-3">Current Workouts</p>
            <div className="space-y-3">
              {currentProgramme.stages[0]?.sessions.map((session, idx) => (
                <div
                  key={session.id}
                  className={`flex gap-3 pb-3 ${idx !== currentProgramme.stages[0].sessions.length - 1 ? 'border-b border-grey-700' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-grey-700 flex-shrink-0" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{session.title}</p>
                    <p className="text-grey-400 text-xs mt-1">{session.duration}</p>
                    <p className="text-grey-500 text-xs">{session.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* No programme assigned */}
          <div className="px-5 mt-16 text-center">
            <div className="bg-grey-800 rounded-2xl p-8 mb-6">
              <p className="text-white text-lg font-bold mb-4">Your PT will assign your programme soon</p>
              <button
                onClick={() => setScreen('browse')}
                className="bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-3 px-8 rounded-full transition-all active:scale-95 w-full"
              >
                Browse Classes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
