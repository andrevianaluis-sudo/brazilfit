import { ArrowLeft, ChevronRight } from 'lucide-react';
import { PROGRAMMES } from '../../data/programmes';

export default function BrowseProgrammesScreen({ onBack, onSelectProgramme }) {
  return (
    <div className="w-full min-h-screen animate-fade-in" style={{ backgroundColor: '#1C1C1E' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-grey-700 sticky top-0 z-40" style={{ backgroundColor: '#1C1C1E' }}>
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/20 rounded-full transition-all active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="flex-1 text-white font-black text-center text-lg uppercase">
          Browse Programmes
        </h1>
        <div className="w-10" />
      </div>

      {/* Programmes list */}
      <div className="px-5 py-4 space-y-4">
        {PROGRAMMES.map((programme) => (
          <button
            key={programme.id}
            onClick={() => onSelectProgramme(programme.id)}
            className="w-full text-left rounded-2xl overflow-hidden group transition-transform active:scale-95"
          >
            {/* Image with gradient overlay */}
            <div className="relative bg-grey-800 rounded-2xl overflow-hidden">
              <div
                className={`w-full h-56 bg-gradient-to-b ${programme.backgroundGradient} group-hover:opacity-90 transition-opacity`}
              />

              {/* Title overlay at bottom with gradient */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <h2 className="text-2xl font-black text-white">{programme.title}</h2>
              </div>
            </div>

            {/* Info section */}
            <div className="bg-grey-800 rounded-b-2xl px-4 py-3 -mt-1 rounded-t-none">
              <p className="text-grey-300 text-sm mb-2">{programme.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-grey-400">{programme.duration} weeks</span>
                  <span className="text-grey-500">•</span>
                  <span className="text-grey-400">{programme.equipment}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-grey-400" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
