import { useState, useRef, useEffect } from 'react';
import { ChevronUp, Plus, Maximize2 } from 'lucide-react';

export function ProgressPhotoSlider({ beforePhoto, afterPhoto, weeksElapsed = 8 }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Slider Container */}
      <div
        ref={containerRef}
        className="relative w-full h-96 rounded-lg overflow-hidden bg-white border border-grey-300 cursor-col-resize"
        onMouseDown={handleMouseDown}
      >
        {/* Before Photo (Left) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${beforePhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-white/30" />
          <div className="absolute top-6 left-6">
            <p className="text-black text-xs font-bold uppercase">Before</p>
          </div>
        </div>

        {/* After Photo (Right) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${afterPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: `inset(0 0 0 ${100 - sliderPosition}%)`,
          }}
        >
          <div className="absolute inset-0 bg-white/30" />
          <div className="absolute top-6 right-6">
            <p className="text-black text-xs font-bold uppercase">After</p>
          </div>
        </div>

        {/* Divider and Handle */}
        <div
          className="absolute inset-y-0 w-1 bg-white transition-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Circular Handle - Green with white arrows */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-brazil-green rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing">
            <div className="flex gap-1">
              <ChevronUp className="w-4 h-4 text-white rotate-90" />
              <ChevronUp className="w-4 h-4 text-white -rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Below Slider */}
      <div className="flex items-center justify-between mt-6">
        <div>
          <p className="text-grey-200 text-xs uppercase font-medium tracking-wider">{weeksElapsed} weeks progress</p>
          <p className="text-grey-200 text-xs mt-2">Drag to compare your transformation</p>
        </div>
        <button
          onClick={() => setIsFullScreen(true)}
          className="p-2 hover:bg-grey-300 transition rounded-full"
        >
          <Maximize2 className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Upload Button */}
      <div className="px-5 py-6">
        <button className="w-full flex items-center justify-center gap-2 bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-3 rounded-[8px] transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          UPLOAD NEW PHOTO
        </button>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 text-black hover:text-grey-200 z-10"
          >
            ✕
          </button>
          <div
            ref={containerRef}
            className="relative flex-1 rounded-lg overflow-hidden cursor-col-resize border border-grey-300"
            onMouseDown={handleMouseDown}
          >
            {/* Before Photo */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${beforePhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* After Photo */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${afterPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: `inset(0 0 0 ${100 - sliderPosition}%)`,
              }}
            />

            {/* Divider */}
            <div
              className="absolute inset-y-0 w-1 bg-white"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-brazil-green rounded-full flex items-center justify-center shadow-lg">
                <div className="flex gap-2">
                  <ChevronUp className="w-6 h-6 text-white rotate-90" />
                  <ChevronUp className="w-6 h-6 text-white -rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
