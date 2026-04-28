import { useState, useEffect } from 'react';
import { Pause, Play, RotateCcw, Check, X } from 'lucide-react';

export default function ExerciseTimer({
  exerciseName,
  gifUrl,
  sets,
  reps,
  restSeconds,
  onDone,
  onClose
}) {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setTimeLeft(selectedDuration);
  }, [selectedDuration]);

  useEffect(() => {
    if (!isRunning || isCompleted) return;

    if (timeLeft <= 0) {
      setIsCompleted(true);
      playCompletionSound();
      setIsRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isCompleted]);

  const playCompletionSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const progress = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-brazil-green/20 flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-brazil-green" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-black">Great Job!</h2>
            <p className="text-grey-200 text-sm mt-2">{exerciseName}</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs mx-auto">
            <button
              onClick={() => {
                setIsCompleted(false);
                setTimeLeft(selectedDuration);
                setIsRunning(false);
              }}
              className="flex-1 py-3 bg-grey-100 rounded-[8px] font-bold text-black hover:bg-grey-200 transition-all"
            >
              Repeat
            </button>
            <button
              onClick={() => {
                onDone();
                onClose();
              }}
              className="flex-1 py-3 bg-brazil-green rounded-[8px] font-bold text-black hover:bg-brazil-green-dark transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-grey-100 rounded-lg transition-all"
      >
        <X className="w-6 h-6 text-grey-200" />
      </button>

      {/* Exercise name */}
      <h2 className="text-2xl font-black text-black mb-4 text-center">{exerciseName}</h2>

      {/* GIF display */}
      {gifUrl && (
        <div className="w-full max-w-md h-64 bg-grey-100 rounded-[12px] mb-6 flex items-center justify-center overflow-hidden">
          <img
            src={gifUrl}
            alt={exerciseName}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Sets/Reps/Rest info */}
      {(sets || reps || restSeconds) && (
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {sets && (
            <span className="px-3 py-1.5 bg-brazil-green/20 text-brazil-green rounded-full text-xs font-semibold">
              {sets} Sets
            </span>
          )}
          {reps && (
            <span className="px-3 py-1.5 bg-brazil-green/20 text-brazil-green rounded-full text-xs font-semibold">
              {reps} Reps
            </span>
          )}
          {restSeconds && (
            <span className="px-3 py-1.5 bg-brazil-green/20 text-brazil-green rounded-full text-xs font-semibold">
              {restSeconds}s Rest
            </span>
          )}
        </div>
      )}

      {/* Duration selector (only if not started) */}
      {!isRunning && (
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm font-semibold text-grey-200">Duration</p>
          <div className="flex gap-2 justify-center">
            {[30, 45, 60].map(dur => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                className={`px-4 py-2 rounded-[8px] font-bold transition-all ${
                  selectedDuration === dur
                    ? 'bg-brazil-green text-white'
                    : 'bg-grey-100 text-black hover:bg-grey-200'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer circle */}
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#27AE60"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-black text-black">{timeLeft}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-3 justify-center mb-6">
        {isRunning ? (
          <button
            onClick={() => setIsRunning(false)}
            className="p-3 bg-grey-100 rounded-full hover:bg-grey-200 transition-all"
          >
            <Pause className="w-6 h-6 text-black" />
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(true)}
            className="p-3 bg-brazil-green rounded-full hover:bg-brazil-green-dark transition-all"
          >
            <Play className="w-6 h-6 text-black fill-black" />
          </button>
        )}
        <button
          onClick={() => {
            setTimeLeft(selectedDuration);
            setIsRunning(false);
          }}
          className="p-3 bg-grey-100 rounded-full hover:bg-grey-200 transition-all"
        >
          <RotateCcw className="w-6 h-6 text-black" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full max-w-xs py-3 bg-grey-100 rounded-[8px] font-semibold text-black hover:bg-grey-200 transition-all"
      >
        Close
      </button>
    </div>
  );
}
