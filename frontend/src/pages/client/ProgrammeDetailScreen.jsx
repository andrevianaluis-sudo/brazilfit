import { useState } from 'react';
import { ArrowLeft, Share2, ChevronRight } from 'lucide-react';

export default function ProgrammeDetailScreen({ programme, onBack, onBrowseOthers }) {
  const [currentStage, setCurrentStage] = useState(0);
  const stage = programme.stages[currentStage];

  return (
    <div className="w-full min-h-screen animate-fade-in" style={{ backgroundColor: '#1C1C1E' }}>
      {/* Top section with image and title */}
      <div className="relative">
        {/* Full bleed image */}
        <div
          className={`w-full h-80 bg-gradient-to-b ${programme.backgroundGradient}`}
        />

        {/* Back and Share buttons */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-all active:scale-95 z-10"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <button className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all active:scale-95 z-10">
          <Share2 className="w-6 h-6 text-white" />
        </button>

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <h1 className="text-4xl font-black text-white">{programme.title}</h1>
        </div>
      </div>

      {/* Lower section - dark background */}
      <div style={{ backgroundColor: '#2C2C2C' }}>
        {/* Stats grid 2x2 */}
        <div className="px-5 pt-6 pb-6 grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded bg-brazil-green" />
              <p className="text-white font-bold text-sm">{programme.stages.length}</p>
            </div>
            <p className="text-grey-400 text-xs">Stages</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded bg-brazil-green" />
              <p className="text-white font-bold text-sm">{programme.duration}</p>
            </div>
            <p className="text-grey-400 text-xs">Duration (weeks)</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded bg-brazil-green" />
              <p className="text-white font-bold text-sm">{programme.difficulty}</p>
            </div>
            <p className="text-grey-400 text-xs">Difficulty</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded bg-brazil-green" />
              <p className="text-white font-bold text-sm">30-50m</p>
            </div>
            <p className="text-grey-400 text-xs">Per session</p>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 pb-6">
          <p className="text-grey-300 text-sm leading-relaxed">{programme.description}</p>
        </div>

        {/* Equipment */}
        <div className="px-5 pb-6 border-b border-grey-700">
          <p className="text-white font-bold text-sm mb-2">Equipment</p>
          <p className="text-grey-400 text-sm">{programme.equipment}</p>
        </div>

        {/* Sessions list for current stage */}
        <div className="px-5 py-6">
          <p className="text-white font-bold text-sm mb-3">{stage.title}</p>
          <div className="space-y-3">
            {stage.sessions.map((session, idx) => (
              <div
                key={session.id}
                className={`flex gap-3 pb-3 ${idx !== stage.sessions.length - 1 ? 'border-b border-grey-700' : ''}`}
              >
                <div className="w-16 h-16 rounded-lg bg-grey-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{session.title}</p>
                  <p className="text-grey-400 text-xs mt-1">{session.duration}</p>
                  <p className="text-grey-500 text-xs">{session.level}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 py-6 space-y-3">
          <button className="w-full py-3 px-6 border-2 border-white rounded-full bg-transparent hover:bg-white/10 text-white font-bold transition-all active:scale-95">
            Go to Next Stage
          </button>
          <button className="w-full py-3 px-6 border-2 border-white rounded-full bg-transparent hover:bg-white/10 text-white font-bold transition-all active:scale-95">
            View Programme Progress
          </button>
        </div>
      </div>

      {/* White section - other options */}
      <div className="bg-white">
        <button
          onClick={onBrowseOthers}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-grey-100 hover:bg-grey-300 transition-all active:scale-95"
        >
          <span className="text-black font-bold text-sm">Browse Other Programmes</span>
          <ChevronRight className="w-5 h-5 text-grey-200" />
        </button>

        <button className="w-full flex items-center justify-between px-5 py-4 border-b border-grey-100 hover:bg-grey-300 transition-all active:scale-95">
          <span className="text-black font-bold text-sm">Programme Overview</span>
          <ChevronRight className="w-5 h-5 text-grey-200" />
        </button>

        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-grey-300 transition-all active:scale-95">
          <span className="text-black font-bold text-sm">End Programme</span>
          <ChevronRight className="w-5 h-5 text-grey-200" />
        </button>
      </div>
    </div>
  );
}
