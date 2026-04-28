import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

export default function BeforeAfterSlider({ clientId, angle = 'front' }) {
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [beforeSrc, setBeforeSrc] = useState(null);
  const [afterSrc, setAfterSrc] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
    return () => {
      if (beforeSrc) URL.revokeObjectURL(beforeSrc);
      if (afterSrc) URL.revokeObjectURL(afterSrc);
    };
  }, [clientId, angle]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/progress/photos/${clientId}`);
      const anglePhotos = (res.data || []).filter(p => p.angle === angle).sort((a, b) =>
        new Date(a.upload_date) - new Date(b.upload_date)
      );

      if (anglePhotos.length >= 2) {
        setBeforePhoto(anglePhotos[0]);
        setAfterPhoto(anglePhotos[anglePhotos.length - 1]);

        const beforeRes = await api.get(`/progress/photos/${anglePhotos[0].id}/data`, { responseType: 'blob' });
        setBeforeSrc(URL.createObjectURL(beforeRes.data));

        const afterRes = await api.get(`/progress/photos/${anglePhotos[anglePhotos.length - 1].id}/data`, { responseType: 'blob' });
        setAfterSrc(URL.createObjectURL(afterRes.data));
      } else if (anglePhotos.length === 1) {
        setBeforePhoto(anglePhotos[0]);
        setAfterPhoto(null);

        const beforeRes = await api.get(`/progress/photos/${anglePhotos[0].id}/data`, { responseType: 'blob' });
        setBeforeSrc(URL.createObjectURL(beforeRes.data));
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);

  const handleMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const newPos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(newPos);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-grey-100 p-8 text-center">
        <p className="text-grey-200">Loading photos...</p>
      </div>
    );
  }

  if (!beforePhoto) {
    return (
      <div className="bg-white rounded-lg border border-grey-100 p-8 text-center">
        <p className="text-grey-200">No {angle} view photos yet. Upload photos to see before/after comparison.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative w-full bg-grey-100 rounded-lg overflow-hidden cursor-col-resize select-none"
        style={{ paddingBottom: '133.33%' }}
      >
        {/* Before Photo (Full Background) */}
        <img
          src={beforeSrc}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          draggable="false"
        />

        {/* After Photo (Masked by slider position) */}
        {afterPhoto && afterSrc && (
          <>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={afterSrc}
                alt="After"
                className="w-full h-full object-cover"
                style={{ width: `${100 / (sliderPos || 1) * 100}%` }}
                draggable="false"
              />
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
              style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-3">
                <div className="flex gap-1">
                  <div className="w-0.5 h-4 bg-brazil-green" />
                  <div className="w-0.5 h-4 bg-brazil-green" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-xs font-semibold">
              Before: {beforePhoto.upload_date}
            </div>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs font-semibold">
              After: {afterPhoto.upload_date}
            </div>
          </>
        )}

        {!afterPhoto && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-white text-center font-semibold">
              Upload a newer photo to compare
            </p>
          </div>
        )}
      </div>

      {afterPhoto && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white rounded-lg border border-grey-100 p-3">
            <p className="text-grey-200 font-semibold mb-1">Before</p>
            <p className="text-black font-bold">{beforePhoto.upload_date}</p>
          </div>
          <div className="bg-white rounded-lg border border-grey-100 p-3">
            <p className="text-grey-200 font-semibold mb-1">After</p>
            <p className="text-black font-bold">{afterPhoto.upload_date}</p>
          </div>
        </div>
      )}
    </div>
  );
}
