import { useState, useRef } from 'react';
import { Phone, Video, MessageCircle, Share2, Clock, AlertCircle } from 'lucide-react';

export default function ClientVirtualSession() {
  const [sessionActive, setSessionActive] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [timer, setTimer] = useState(1245);
  const timerRef = useRef(null);

  React.useEffect(() => {
    if (!sessionActive) return;
    timerRef.current = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    setSessionActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!sessionActive) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center pb-24 animate-fade-in">
        <div className="text-center px-5 space-y-6">
          <div className="text-6xl mb-4"></div>
          <div>
            <h2 className="text-3xl font-black text-black uppercase mb-2">Session Complete</h2>
            <p className="text-grey-200 text-sm mb-6">Great work today! Andre was impressed with your form.</p>
            <p className="text-brazil-green font-bold text-lg mb-6">{formatTime(timer)} completed</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full p-4 rounded-[12px] bg-brazil-green text-black font-bold uppercase text-xs tracking-widest hover:bg-brazil-green-dark transition"
            >
              Back to Home
            </button>
            <button className="w-full p-4 rounded-[12px] bg-grey-300 text-black font-bold uppercase text-xs tracking-widest hover:bg-white transition">
              Share Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen pb-24 flex flex-col animate-fade-in">
      {/* Video Container */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {/* Trainer Video (Full Screen) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brazil-green to-brazil-green/50 mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl"></span>
              </div>
              <p className="text-black font-bold text-xl">Andre Viana</p>
              <p className="text-grey-200 text-sm">Personal Trainer</p>
            </div>
          </div>
        </div>

        {/* Timer Overlay */}
        <div className="absolute top-6 left-6 bg-white/60 backdrop-blur rounded-[12px] px-4 py-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brazil-green" />
            <span className="text-black font-bold text-lg font-mono">{formatTime(timer)}</span>
          </div>
        </div>

        {/* Your Video (Small) */}
        <div className="absolute bottom-6 right-6 w-24 h-32 rounded-[12px] bg-grey-300 border border-grey-100 flex items-center justify-center overflow-hidden">
          {videoOn ? (
            <div className="text-4xl"></div>
          ) : (
            <div className="text-center px-2">
              <div className="text-2xl mb-1"></div>
              <p className="text-xs text-grey-200">Camera Off</p>
            </div>
          )}
        </div>

        {/* Network Status */}
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-bold">Connected</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-grey-300 border-t border-grey-100 px-5 py-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* Microphone */}
          <button
            onClick={() => setAudioOn(!audioOn)}
            className={`p-3 rounded-full transition ${
              audioOn
                ? 'bg-white/20 text-black hover:bg-white/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
          >
            <div className="relative">
              <div className={`w-1 h-1 ${audioOn ? 'hidden' : 'block'} absolute top-0 left-1/2 -translate-x-1/2 translate-y-1 bg-red-400 rounded-full`} />
              <MessageCircle className="w-5 h-5" />
            </div>
          </button>

          {/* Camera */}
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-3 rounded-full transition ${
              videoOn
                ? 'bg-white/20 text-black hover:bg-white/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Share Screen */}
          <button className="p-3 rounded-full bg-white/20 text-black hover:bg-white/30 transition">
            <Share2 className="w-5 h-5" />
          </button>

          {/* End Call */}
          <button
            onClick={handleEndSession}
            className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center text-xs text-grey-200">
          {audioOn && videoOn ? ' Video & Audio ON' : ' Microphone OFF'}
        </div>
      </div>

      {/* Chat/Notes Panel (Expandable) */}
      <div className="bg-white border-t border-grey-100 px-5 py-4 max-h-32 overflow-y-auto">
        <p className="text-xs text-grey-200 font-bold uppercase tracking-widest mb-3">Session Notes</p>
        <div className="space-y-2 text-xs text-black">
          <p> Perfect form on the deadlifts</p>
          <p> Great pace - keep it up</p>
          <p>Next: Increase weight by 5kg</p>
        </div>
      </div>
    </div>
  );
}

