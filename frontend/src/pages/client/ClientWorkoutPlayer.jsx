import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Share2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock workout data
const WORKOUT_DATA = {
  id: 1,
  title: 'Full Body Strength',
  duration: 45,
  exercises: [
    { id: 1, name: 'Push-ups', sets: 3, reps: 12, rest: 45 },
    { id: 2, name: 'Squats', sets: 3, reps: 15, rest: 45 },
    { id: 3, name: 'Deadlifts', sets: 3, reps: 8, rest: 60 },
    { id: 4, name: 'Pull-ups', sets: 3, reps: 10, rest: 45 },
    { id: 5, name: 'Plank Hold', sets: 3, reps: 45, rest: 30 },
    { id: 6, name: 'Lunges', sets: 3, reps: 12, rest: 45 },
  ],
};

export default function ClientWorkoutPlayer() {
  const navigate = useNavigate();
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({
    startTime: Date.now(),
    completedExercises: 0,
  });

  const currentExercise = WORKOUT_DATA.exercises[currentExerciseIdx];
  const isLastExercise = currentExerciseIdx === WORKOUT_DATA.exercises.length - 1;
  const isLastSet = currentSet === currentExercise.sets;
  const totalExercises = WORKOUT_DATA.exercises.length;
  const progressPercent = ((currentExerciseIdx + (currentSet / currentExercise.sets)) / totalExercises) * 100;

  // Rest timer countdown
  useEffect(() => {
    if (!isResting) return;
    if (restTime <= 0) {
      setIsResting(false);
      // Auto-load next set or exercise
      if (isLastSet) {
        if (isLastExercise) {
          setIsCompleted(true);
        } else {
          setCurrentExerciseIdx(currentExerciseIdx + 1);
          setCurrentSet(1);
        }
      } else {
        setCurrentSet(currentSet + 1);
      }
      return;
    }
    const timer = setTimeout(() => setRestTime(restTime - 1), 1000);
    return () => clearTimeout(timer);
  }, [isResting, restTime, currentSet, currentExerciseIdx, isLastSet, isLastExercise]);

  const handleCompleteSet = () => {
    if (isLastSet && isLastExercise) {
      setIsCompleted(true);
    } else if (isLastSet) {
      setCurrentExerciseIdx(currentExerciseIdx + 1);
      setCurrentSet(1);
      setIsResting(true);
      setRestTime(currentExercise.rest);
    } else {
      setIsResting(true);
      setRestTime(currentExercise.rest);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const handleExit = () => {
    if (showExit) {
      navigate('/client');
    } else {
      setShowExit(true);
    }
  };

  if (isCompleted) {
    const duration = Math.round((Date.now() - workoutStats.startTime) / 60000);
    return (
      <div className="fixed inset-0 bg-white w-full h-full z-50 flex flex-col items-center justify-center p-6">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white">
          <div className="h-full w-full bg-brazil-green" />
        </div>

        <div className="flex flex-col items-center">
          <div className="checkmark-animate mb-8">
            <CheckCircle className="w-20 h-20 text-brazil-green" />
          </div>
          <h1 className="text-4xl font-black text-black mb-4 text-center">WORKOUT COMPLETE</h1>

          {/* Stats */}
          <div className="bg-grey-300 rounded-[12px] p-6 w-full max-w-sm mb-8 text-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-grey-200 text-xs mb-1">DURATION</p>
                <p className="text-black text-2xl font-black">{duration}m</p>
              </div>
              <div>
                <p className="text-grey-200 text-xs mb-1">EXERCISES</p>
                <p className="text-black text-2xl font-black">{totalExercises}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <button className="w-full max-w-sm bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-4 rounded-[8px] mb-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Share2 className="w-5 h-5" />
            SHARE ACHIEVEMENT
          </button>
          <button
            onClick={() => navigate('/client')}
            className="w-full max-w-sm bg-grey-300 hover:bg-white text-black font-bold py-4 rounded-[8px] active:scale-95 transition-transform"
          >
            DONE
          </button>
        </div>
      </div>
    );
  }

  if (isResting) {
    const getTimerColor = () => {
      if (restTime > 10) return 'rest-timer-normal';
      if (restTime > 3) return 'rest-timer-warning';
      return 'rest-timer-danger';
    };

    const getRingColor = () => {
      if (restTime > 10) return '#27AE60';
      if (restTime > 3) return '#F59E0B';
      return '#EF4444';
    };

    return (
      <div className="fixed inset-0 bg-white w-full h-full z-50 flex flex-col items-center justify-center p-6 rest-bg-pulse">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white">
          <div
            className="h-full bg-brazil-green transition-all duration-1000"
            style={{
              width: `${((currentExercise.rest - restTime) / currentExercise.rest) * 100}%`,
            }}
          />
        </div>

        {/* Exit button */}
        <button
          onClick={handleExit}
          className="absolute top-6 left-6 p-2 hover:bg-grey-300 transition rounded-full"
        >
          <X className="w-6 h-6 text-black" />
        </button>

        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-grey-200 text-sm mb-12 text-center">REST</p>

          {/* Circular rest timer with color-changing ring */}
          <div className="relative w-48 h-48 mb-12">
            <svg className="w-full h-full transform -rotate-90" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' }}>
              <circle cx="96" cy="96" r="85" fill="none" stroke="#333333" strokeWidth="4" />
              <circle
                cx="96"
                cy="96"
                r="85"
                fill="none"
                stroke={getRingColor()}
                strokeWidth="4"
                strokeDasharray={`${(534 * (currentExercise.rest - restTime)) / currentExercise.rest} 534`}
                strokeLinecap="round"
                style={{ transition: 'stroke 0.3s ease, stroke-dasharray 0.3s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-8xl font-black ${getTimerColor()}`}>{restTime}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSkipRest}
            className="text-grey-200 hover:text-black transition text-sm font-medium"
          >
            SKIP REST
          </button>
        </div>

        {showExit && (
          <div className="fixed inset-0 bg-grey-1000 flex items-center justify-center z-50">
            <div className="bg-grey-300 rounded-[12px] p-6 max-w-sm w-full mx-6">
              <h3 className="text-xl font-black text-black mb-4">Exit Workout?</h3>
              <p className="text-grey-200 text-sm mb-6">Your progress will not be saved.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExit(false)}
                  className="flex-1 bg-white hover:bg-grey-1000 text-black font-bold py-3 rounded-[8px] active:scale-95 transition-transform"
                >
                  CONTINUE
                </button>
                <button
                  onClick={() => navigate('/client')}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-[8px] active:scale-95 transition-transform"
                >
                  EXIT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white w-full h-full z-50 flex flex-col p-6 pb-12">
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white">
        <div
          className="h-full bg-brazil-green progress-fill-animate transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header with exit button */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <p className="text-grey-200 text-xs">EXERCISE {currentExerciseIdx + 1} OF {totalExercises}</p>
        </div>
        <button
          onClick={handleExit}
          className="p-2 hover:bg-grey-300 transition rounded-full"
        >
          <X className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Exercise info */}
      <div className="flex-1 flex flex-col justify-center items-center text-center mb-12">
        <h1 className="text-4xl font-black text-black uppercase mb-6">{currentExercise.name}</h1>

        {/* Exercise image placeholder */}
        <div className="w-full max-w-sm h-48 bg-grey-300 rounded-[12px] mb-8 flex items-center justify-center">
          <p style={{color:"#606060"}}>Exercise Image</p>
        </div>

        {/* Set counter */}
        <p className="text-grey-200 text-sm mb-4">SET {currentSet} OF {currentExercise.sets}</p>

        {/* Reps/duration display */}
        <div className="text-6xl font-black text-black mb-2">
          {currentExercise.reps}
        </div>
        <p className="text-grey-200 text-sm mb-12">
          {currentExercise.reps >= 30 ? 'SECONDS' : 'REPS'}
        </p>

        {/* Complete set button */}
        <button
          onClick={handleCompleteSet}
          className="w-full max-w-sm bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-4 rounded-[8px] active:scale-95 transition-transform"
        >
          COMPLETE SET
        </button>
      </div>

      {showExit && (
        <div className="fixed inset-0 bg-grey-1000 flex items-center justify-center z-50">
          <div className="bg-grey-300 rounded-[12px] p-6 max-w-sm w-full mx-6">
            <h3 className="text-xl font-black text-black mb-4">Exit Workout?</h3>
            <p className="text-grey-200 text-sm mb-6">Your progress will not be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExit(false)}
                className="flex-1 bg-white hover:bg-grey-1000 text-black font-bold py-3 rounded-[8px] active:scale-95 transition-transform"
              >
                CONTINUE
              </button>
              <button
                onClick={() => navigate('/client')}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-[8px] active:scale-95 transition-transform"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

