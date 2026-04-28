import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Play, Check, ChevronRight, Timer, X, Dumbbell, ChevronLeft } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import YouTubePlayer from '../../components/YouTubePlayer';

function RestTimer({ seconds, onDone, videoId, exerciseName }) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current); onDone(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/97 backdrop-blur-sm overflow-y-auto">
      {/* Timer */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center py-6">
        <p className="text-xs text-grey-100 font-bold uppercase tracking-widest mb-4">Rest Time</p>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="#27AE60" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black">{remaining}</span>
          </div>
        </div>
        <button onClick={onDone} className="text-xs text-grey-100 hover:text-black border border-grey-100 rounded-[8px] px-4 py-2 transition-colors">
          Skip rest
        </button>
      </div>

      {/* Video replay during rest */}
      {videoId && (
        <div className="px-4 pb-6">
          <p className="text-xs text-grey-100 mb-2 text-center">Review form while you rest</p>
          <YouTubePlayer videoId={videoId} autoplay showSlowMo />
          {exerciseName && <p className="text-xs text-grey-100 text-center mt-2">{exerciseName}</p>}
        </div>
      )}
    </div>
  );
}

export default function ClientWorkout() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [setsDone, setSetsDone] = useState({}); // { exerciseId: setsCompleted }
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/workouts/today')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data?.plan) return (
    <div className="px-4 py-8 text-center animate-fade-in">
      <Dumbbell className="w-12 h-12 text-grey-200 mx-auto mb-3" />
      <p className="text-grey-200 font-semibold">No workout plan assigned</p>
      <p className="text-xs text-grey-100 mt-1">Your PT will assign a workout plan soon.</p>
    </div>
  );

  if (!data.day) return (
    <div className="px-4 py-8 text-center animate-fade-in">
      <Dumbbell className="w-12 h-12 text-grey-200 mx-auto mb-3" />
      <p className="text-grey-200 font-semibold">Rest day today</p>
      <p className="text-xs text-grey-100 mt-1">No workout scheduled — enjoy your recovery!</p>
    </div>
  );

  const { plan, day } = data;
  const exercises = day.exercises || [];

  // Done state
  if (done) {
    return (
      <div className="px-4 py-8 text-center animate-fade-in space-y-4">
        <div className="w-20 h-20 rounded-full bg-brazil-green/20 flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-brazil-green" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Workout Complete!</h2>
          <p className="text-grey-200 text-sm mt-1">{day.day_name} — {exercises.length} exercises done</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {exercises.map(ex => {
            const done = setsDone[ex.id] || 0;
            return (
              <div key={ex.id} className="bg-brazil-green/10 border border-brazil-green/20 rounded-[8px] p-2.5 text-center">
                <p className="text-lg font-black text-brazil-green">{done}/{ex.sets}</p>
                <p className="text-[10px] text-grey-200 truncate">{ex.exercise_name}</p>
              </div>
            );
          })}
        </div>
        <button onClick={() => window.history.back()} className="w-full py-3.5 bg-brazil-green rounded-[8px] font-bold text-black">
          Back to Home
        </button>
      </div>
    );
  }

  // Pre-start overview
  if (!started) {
    return (
      <div className="px-4 py-4 animate-fade-in space-y-4">
        <div>
          <p className="text-xs text-grey-100">{plan.name}</p>
          <h1 className="text-2xl font-black">{day.day_name}</h1>
          <p className="text-sm text-grey-200">{exercises.length} exercises</p>
        </div>

        {data.alreadyLogged && (
          <div className="bg-brazil-yellow/10 border border-brazil-yellow/20 rounded-[8px] px-4 py-3">
            <p className="text-sm text-brazil-yellow font-medium">Already completed today</p>
            <p className="text-xs text-grey-200">You can still start again for an extra session.</p>
          </div>
        )}

        <div className="space-y-2">
          {exercises.map((ex, i) => {
            const muscles = (() => { try { return JSON.parse(ex.muscle_groups); } catch { return []; } })();
            return (
              <div key={ex.id} className="card-dark flex items-center gap-3">
                <div className="w-7 h-7 rounded-[8px] bg-brazil-green/20 text-brazil-green text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{ex.exercise_name}</p>
                  <p className="text-xs text-grey-100">{ex.sets} sets × {ex.reps} reps · {ex.rest_seconds}s rest</p>
                  {muscles.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {muscles.slice(0, 2).map(m => (
                        <span key={m} className="text-[9px] bg-brazil-green/10 text-brazil-green/70 px-1.5 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
                {ex.notes && <p className="text-[10px] text-grey-100 text-right max-w-[80px]">{ex.notes}</p>}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full py-4 bg-brazil-green rounded-[12px] font-black text-lg text-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Play className="w-5 h-5 fill-white" /> Start Workout
        </button>
      </div>
    );
  }

  // Active workout — exercise-by-exercise
  const currentEx = exercises[currentIndex];
  const completedSets = setsDone[currentEx?.id] || 0;
  const instructions = (() => { try { return JSON.parse(currentEx?.instructions || '[]'); } catch { return []; } })();

  const handleSetDone = () => {
    const newSets = completedSets + 1;
    setSetsDone(prev => ({ ...prev, [currentEx.id]: newSets }));

    if (newSets < currentEx.sets) {
      // Rest before next set
      setRestSeconds(currentEx.rest_seconds || 60);
      setResting(true);
    } else {
      // All sets done for this exercise
      if (currentIndex < exercises.length - 1) {
        setRestSeconds(currentEx.rest_seconds || 60);
        setResting(true);
      } else {
        // Workout complete — save log
        finishWorkout({ ...setsDone, [currentEx.id]: newSets });
      }
    }
  };

  const handleRestDone = () => {
    setResting(false);
    const nowSets = setsDone[currentEx?.id] || 0;
    // Check if we were between sets or between exercises
    if ((setsDone[currentEx?.id] || 0) >= currentEx?.sets) {
      // Move to next exercise
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(i => i + 1);
      }
    }
    // else: same exercise next set (nothing to do, button re-appears)
  };

  const finishWorkout = async (finalSetsDone) => {
    setSaving(true);
    try {
      const exercisesCompleted = exercises.map(ex => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets_completed: finalSetsDone[ex.id] || 0,
        sets_target: ex.sets,
        reps: ex.reps,
      }));
      await api.post('/workouts/log', {
        workout_day_id: day.id,
        exercises_completed: exercisesCompleted,
      });
      setSetsDone(finalSetsDone || setsDone);
      setDone(true);
    } catch {
      toast.error('Failed to save workout — your progress is still recorded here.');
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 animate-fade-in space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-grey-100">{day.day_name}</p>
          <p className="text-sm font-bold">{currentIndex + 1} / {exercises.length}</p>
        </div>
        <div className="flex gap-1">
          {exercises.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i < currentIndex ? 'w-6 bg-brazil-green' :
              i === currentIndex ? 'w-6 bg-brazil-green/60' :
              'w-3 bg-white/15'
            }`} />
          ))}
        </div>
      </div>

      {/* Exercise card */}
      {currentEx && (
        <div className="card-dark space-y-4">
          <div>
            <h2 className="text-xl font-black">{currentEx.exercise_name}</h2>
            <p className="text-sm text-grey-200">{currentEx.sets} sets × {currentEx.reps} reps · {currentEx.rest_seconds}s rest</p>
            {currentEx.notes && <p className="text-xs text-brazil-yellow/70 mt-1 bg-brazil-yellow/10 rounded-lg px-3 py-1.5">{currentEx.notes}</p>}
          </div>

          {/* Video — autoplay at highest quality with slow-mo */}
          {currentEx.youtube_video_id && (
            <YouTubePlayer videoId={currentEx.youtube_video_id} autoplay showSlowMo />
          )}

          {/* Sets progress */}
          <div className="flex gap-2">
            {Array.from({ length: currentEx.sets }).map((_, i) => (
              <div key={i} className={`flex-1 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                i < completedSets ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-100'
              }`}>
                {i < completedSets ? <Check className="w-4 h-4" /> : i + 1}
              </div>
            ))}
          </div>

          {/* How-to steps (collapsed by default) */}
          {instructions.length > 0 && (
            <div className="bg-white/3 rounded-[8px] p-3 space-y-1.5">
              <p className="text-[10px] font-bold text-grey-100 uppercase tracking-wide mb-2">How to</p>
              {instructions.slice(0, 3).map((step, i) => (
                <p key={i} className="text-xs text-grey-200 flex gap-2">
                  <span className="text-brazil-green font-bold flex-shrink-0">{i + 1}.</span>{step}
                </p>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={handleSetDone}
            disabled={completedSets >= currentEx.sets || saving}
            className="w-full py-4 bg-brazil-green rounded-[12px] font-black text-lg text-black disabled:opacity-40 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {completedSets >= currentEx.sets
              ? <><Check className="w-5 h-5" /> All sets done!</>
              : <><Check className="w-5 h-5" /> Set {completedSets + 1} done</>
            }
          </button>

          {completedSets >= currentEx.sets && currentIndex < exercises.length - 1 && (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="w-full py-3 bg-grey-100 rounded-[12px] font-semibold text-sm text-black flex items-center justify-center gap-2"
            >
              Next: {exercises[currentIndex + 1]?.exercise_name} <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {completedSets >= currentEx.sets && currentIndex === exercises.length - 1 && (
            <button
              onClick={() => finishWorkout(setsDone)}
              disabled={saving}
              className="w-full py-3 bg-brazil-yellow/20 rounded-[12px] font-bold text-brazil-yellow text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Finish Workout'}
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <div className="flex gap-3">
        {currentIndex > 0 && (
          <button onClick={() => setCurrentIndex(i => i - 1)}
            className="flex-1 py-2.5 bg-grey-100 rounded-[8px] text-sm text-grey-200 flex items-center justify-center gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
        )}
        <button onClick={() => { if (window.confirm('Quit workout?')) window.history.back(); }}
          className="flex-1 py-2.5 bg-grey-100 rounded-[8px] text-sm text-grey-100 flex items-center justify-center gap-1.5">
          <X className="w-4 h-4" /> Quit
        </button>
      </div>

      {resting && (
        <RestTimer
          seconds={restSeconds}
          onDone={handleRestDone}
          videoId={currentEx?.youtube_video_id}
          exerciseName={currentEx?.exercise_name}
        />
      )}
    </div>
  );
}
