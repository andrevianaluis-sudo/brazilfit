import { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Dumbbell, Play } from 'lucide-react';
import ExerciseImageDisplay from './ExerciseImageDisplay';
import MuscleDiagram from './MuscleDiagram';
import ExerciseTimer from './ExerciseTimer';
import { getExerciseMuscles } from '../data/exerciseMuscleMap';

export default function WorkoutDetailModal({ workout, onClose, onComplete }) {
  const isCompleted = workout.status === 'completed';
  const [gifMapping, setGifMapping] = useState({});
  const [timerExercise, setTimerExercise] = useState(null);

  useEffect(() => {
    // Load GIF mapping for stretching exercises
    fetch('/exercise-gifs/mapping.json')
      .then(res => res.json())
      .then(data => {
        const mapping = {};
        data.forEach(item => {
          mapping[item.exerciseName] = item.filename;
        });
        setGifMapping(mapping);
      })
      .catch(err => console.error('Failed to load GIF mapping:', err));
  }, []);

  const getExerciseImage = (exercise) => {
    // For stretching exercises, use GIF; otherwise use muscle diagram
    if (exercise.type === 'stretching' && gifMapping[exercise.name]) {
      return { type: 'gif', filename: gifMapping[exercise.name] };
    }
    return { type: 'muscles' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-grey-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-grey-100">
          <div className="flex-1">
            <h2 className="text-xl font-black text-black">{workout.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
              <p className="text-sm text-grey-200">{workout.pt_name}</p>
            </div>
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
          {/* Description */}
          {workout.description && (
            <div>
              <h3 className="font-bold text-black mb-2">Description</h3>
              <p className="text-sm text-grey-200">{workout.description}</p>
            </div>
          )}

          {/* Workout Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-grey-100 rounded-lg p-3">
              <p className="text-xs text-grey-200 font-semibold mb-1">Duration</p>
              <p className="font-bold text-black">{workout.estimated_duration_minutes} min</p>
            </div>
            <div className="bg-grey-100 rounded-lg p-3">
              <p className="text-xs text-grey-200 font-semibold mb-1">Difficulty</p>
              <p className="font-bold text-black capitalize">{workout.difficulty}</p>
            </div>
            <div className="bg-grey-100 rounded-lg p-3">
              <p className="text-xs text-grey-200 font-semibold mb-1">Exercises</p>
              <p className="font-bold text-black">{workout.exercises?.length || 0}</p>
            </div>
          </div>

          {/* Scheduled Date */}
          {isCompleted && workout.completed_date && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-green-700">Completed</h3>
              </div>
              <p className="text-sm text-green-600">
                Completed on {new Date(workout.completed_date).toLocaleDateString()}
              </p>
            </div>
          )}

          {!isCompleted && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-blue-700">Scheduled</h3>
              </div>
              <p className="text-sm text-blue-600">
                {new Date(workout.scheduled_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Exercise List */}
          <div>
            <h3 className="font-bold text-black mb-3">Exercises</h3>
            <div className="space-y-3">
              {workout.exercises?.map((ex, idx) => {
                const muscles = getExerciseMuscles(ex.name);
                const imageInfo = getExerciseImage(ex);
                return (
                <div key={idx} className="bg-white rounded-lg border border-grey-100 overflow-hidden exercise-modal-card-enter">
                  {/* Exercise Image - GIF for stretching, Muscle Diagrams for strength */}
                  {imageInfo.type === 'gif' ? (
                    <div className="w-full h-48 bg-white flex items-center justify-center overflow-hidden border-b border-grey-100">
                      <img
                        src={`/exercise-gifs/${imageInfo.filename}`}
                        alt={ex.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        key={imageInfo.filename}
                      />
                    </div>
                  ) : (
                    <div className="bg-grey-100 flex h-48">
                      {muscles.primary.length > 0 || muscles.secondary.length > 0 ? (
                        <>
                          <div className="flex-1">
                            <MuscleDiagram
                              primaryMuscles={muscles.primary}
                              secondaryMuscles={muscles.secondary}
                              view="front"
                              size="medium"
                            />
                          </div>
                          <div className="flex-1 border-l border-grey-100">
                            <MuscleDiagram
                              primaryMuscles={muscles.primary}
                              secondaryMuscles={muscles.secondary}
                              view="back"
                              size="medium"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-center">
                          <Dumbbell className="w-12 h-12 text-brazil-green/40" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">{ex.name}</h4>
                        <p className="text-xs text-grey-200">{ex.category}</p>
                      </div>
                      <span className="exercise-number-badge ml-3">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Primary Muscles */}
                    {muscles.primary.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-grey-200 font-semibold mb-1">Primary Muscles</p>
                        <div className="flex flex-wrap gap-1">
                          {muscles.primary.map(m => (
                            <span key={m} className="text-xs bg-brazil-green text-white px-2 py-1 rounded-full">
                              {m.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secondary Muscles */}
                    {muscles.secondary.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-grey-200 font-semibold mb-1">Secondary Muscles</p>
                        <div className="flex flex-wrap gap-1">
                          {muscles.secondary.map(m => (
                            <span key={m} className="text-xs bg-grey-100 text-grey-200 px-2 py-1 rounded-full">
                              {m.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sets/Reps/Rest/Weight Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <div className="exercise-stat-pill">
                        <div className="exercise-stat-pill-label">Sets</div>
                        <div className="exercise-stat-pill-value">{ex.sets}</div>
                      </div>
                      <div className="exercise-stat-pill">
                        <div className="exercise-stat-pill-label">Reps</div>
                        <div className="exercise-stat-pill-value">{ex.reps}</div>
                      </div>
                      <div className="exercise-stat-pill">
                        <div className="exercise-stat-pill-label">Rest</div>
                        <div className="exercise-stat-pill-value">{ex.rest_seconds}s</div>
                      </div>
                      {ex.weight_kg && (
                        <div className="exercise-stat-pill">
                          <div className="exercise-stat-pill-label">Weight</div>
                          <div className="exercise-stat-pill-value">{ex.weight_kg}kg</div>
                        </div>
                      )}
                    </div>

                    {/* Start Exercise Button */}
                    {ex.type === 'stretching' && gifMapping[ex.name] && (
                      <button
                        onClick={() => setTimerExercise(ex)}
                        className="w-full py-2.5 bg-brazil-green text-white font-bold rounded-lg hover:bg-brazil-green-dark transition-all flex items-center justify-center gap-2 mb-3"
                      >
                        <Play className="w-4 h-4 fill-white" /> Start Exercise
                      </button>
                    )}

                    {/* Notes */}
                    {ex.notes && (
                      <div>
                        <p className="text-xs text-grey-200 font-semibold mb-1">Notes</p>
                        <p className="text-xs text-grey-200">{ex.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-grey-100 p-5 space-y-2">
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full bg-brazil-green text-white py-3 rounded-lg font-semibold hover:bg-brazil-green-dark transition-all mark-complete-pulse"
            >
              Mark as Complete
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-grey-100 text-black py-3 rounded-lg font-semibold hover:bg-grey-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Exercise Timer Modal */}
      {timerExercise && (
        <ExerciseTimer
          exerciseName={timerExercise.name}
          gifUrl={gifMapping[timerExercise.name] ? `/exercise-gifs/${gifMapping[timerExercise.name]}` : null}
          sets={timerExercise.sets}
          reps={timerExercise.reps}
          restSeconds={timerExercise.rest_seconds}
          onDone={() => {}}
          onClose={() => setTimerExercise(null)}
        />
      )}
    </div>
  );
}
