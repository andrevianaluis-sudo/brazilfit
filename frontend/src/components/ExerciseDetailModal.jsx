import { X } from 'lucide-react';

export default function ExerciseDetailModal({ exercise, onClose }) {
  const instructions = exercise.instructions ? JSON.parse(exercise.instructions) : [];
  const commonMistakes = exercise.common_mistakes ? JSON.parse(exercise.common_mistakes) : [];
  const proTips = exercise.pro_tips ? JSON.parse(exercise.pro_tips) : [];
  const muscleGroups = exercise.muscle_groups ? JSON.parse(exercise.muscle_groups) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-grey-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-grey-100">
          <div>
            <h2 className="text-xl font-black text-black">{exercise.name}</h2>
            <p className="text-sm text-grey-200">{exercise.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-grey-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-grey-200" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-brazil-green/10 text-brazil-green px-3 py-1 rounded-full font-semibold">
              {exercise.difficulty}
            </span>
            <span className="text-xs bg-grey-100 text-grey-200 px-3 py-1 rounded-full font-semibold">
              {exercise.equipment || 'Bodyweight'}
            </span>
            <span className="text-xs bg-grey-100 text-grey-200 px-3 py-1 rounded-full font-semibold">
              {exercise.sets_reps || 'Varies'}
            </span>
          </div>

          {/* Muscle Groups */}
          {muscleGroups.length > 0 && (
            <div>
              <h4 className="font-bold text-black mb-2">Muscles Worked</h4>
              <div className="flex flex-wrap gap-2">
                {muscleGroups.map((muscle, i) => (
                  <span key={i} className="text-xs bg-brazil-green text-white px-2 py-1 rounded">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Placeholder */}
          <div className="bg-grey-100 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center">
              <p className="text-grey-200 font-semibold">Video Coming Soon</p>
              <p className="text-xs text-grey-200 mt-1">YouTube video integration coming in next update</p>
            </div>
          </div>

          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <h4 className="font-bold text-black mb-2">How to Perform</h4>
              <ol className="space-y-2">
                {instructions.map((step, i) => (
                  <li key={i} className="text-sm text-black flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-brazil-green text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div>
              <h4 className="font-bold text-black mb-2">Common Mistakes</h4>
              <ul className="space-y-2">
                {commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-sm text-black flex gap-3">
                    <span className="text-red-500 font-bold"></span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tips */}
          {proTips.length > 0 && (
            <div>
              <h4 className="font-bold text-black mb-2">Pro Tips</h4>
              <ul className="space-y-2">
                {proTips.map((tip, i) => (
                  <li key={i} className="text-sm text-black flex gap-3">
                    <span className="text-brazil-green font-bold"></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-grey-100 p-5">
          <button
            onClick={onClose}
            className="w-full bg-grey-100 text-black py-3 rounded-lg font-semibold hover:bg-grey-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

