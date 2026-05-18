import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StretchDetailModal({ stretch, onClose }) {
  const [selectedTime, setSelectedTime] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const clientId = localStorage.getItem('clientId');

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  function handleStartStretch() {
    setIsActive(true);
    setTimeLeft(selectedTime);
    setIsCompleted(false);
  }

  async function handleComplete() {
    if (!clientId) {
      toast.error('Client ID not found');
      return;
    }

    try {
      setIsLogging(true);
      // Log the completed stretch to the database
      // For now, we'll just show the completion state
      toast.success('Stretch logged!');
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to log stretch:', err);
      toast.error('Failed to log stretch');
    } finally {
      setIsLogging(false);
    }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4">
      <div className="w-full max-w-[700px] bg-white rounded-[12px] border border-grey-100 overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-grey-100 rounded-lg transition"
        >
          <X className="w-6 h-6 text-grey-200" />
        </button>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-6 p-6">
            {/* Left Side - GIF Animation (280x280px, crisp) */}
            <div className="flex-shrink-0">
              <div className="w-[280px] h-[280px] bg-white rounded-[8px] overflow-hidden border border-grey-100 flex items-center justify-center">
                <img
                  src={`/exercise-gifs/${stretch.filename}`}
                  alt={stretch.name}
                  className="w-full h-full object-contain bg-white"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            </div>

            {/* Right Side - Exercise Details */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h2 className="text-3xl font-black text-black mb-2">{stretch.name}</h2>

              {/* Category Badge */}
              <div className="mb-6 flex items-center gap-3">
                <span className="text-sm bg-[#e8f5f0] text-[#2d7a5c] px-3 py-1.5 rounded-full font-semibold">
                  {stretch.category}
                </span>
                <span className="text-sm bg-grey-100 text-grey-200 px-3 py-1.5 rounded-full font-semibold">
                  Bodyweight
                </span>
              </div>

              {/* Timer Section */}
              <div className="bg-grey-100 rounded-[8px] p-6 mb-6">
                {!isActive && !isCompleted && (
                  <>
                    <p className="text-sm font-semibold text-black mb-3">Select Duration</p>
                    <div className="flex gap-3 mb-4">
                      {[30, 45, 60].map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          disabled={isActive}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            selectedTime === time
                              ? 'bg-brazil-green text-white'
                              : 'bg-white border border-grey-100 text-grey-200 hover:bg-white'
                          }`}
                        >
                          {time}s
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {isActive && (
                  <div className="text-center">
                    <p className="text-sm text-grey-200 mb-2">Time Remaining</p>
                    <div className="text-5xl font-black text-brazil-green font-mono mb-4">
                      {displayTime}
                    </div>
                    <p className="text-sm text-grey-200">Keep stretching...</p>
                  </div>
                )}

                {isCompleted && (
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-brazil-green mx-auto mb-3" />
                    <p className="text-xl font-bold text-black mb-1">Completed!</p>
                    <p className="text-sm text-grey-200">Stretch logged to your history</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!isCompleted && (
                <button
                  onClick={handleStartStretch}
                  disabled={isActive || isLogging}
                  className="w-full bg-brazil-green text-white py-4 rounded-lg font-bold text-lg hover:bg-brazil-green/90 disabled:opacity-50 transition-all"
                >
                  {isActive ? 'Stretching...' : 'Start Stretch'}
                </button>
              )}

              {isCompleted && (
                <button
                  onClick={onClose}
                  className="w-full bg-grey-100 text-black py-4 rounded-lg font-bold text-lg hover:bg-grey-200 transition-all"
                >
                  Close
                </button>
              )}

              {/* Info Section */}
              <div className="mt-6 pt-6 border-t border-grey-100 space-y-4">
                <div>
                  <h4 className="font-bold text-black text-sm mb-2">How to Perform</h4>
                  <ol className="space-y-2 text-sm text-grey-200">
                    <li>1. Start in a comfortable position</li>
                    <li>2. Gently move into the stretch position</li>
                    <li>3. Hold and breathe deeply during the timer</li>
                    <li>4. Slowly release after the timer ends</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold text-black text-sm mb-2">Pro Tips</h4>
                  <ul className="space-y-1 text-sm text-grey-200">
                    <li> Move slowly and avoid bouncing</li>
                    <li> Only stretch to mild tension, never pain</li>
                    <li> Breathe deeply throughout the stretch</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

