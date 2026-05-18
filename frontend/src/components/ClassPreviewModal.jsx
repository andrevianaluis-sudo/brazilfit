import React, { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

export default function ClassPreviewModal({ classId, className, isOpen, onClose }) {
  const [videoMedia, setVideoMedia] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchClassVideo = async () => {
      try {
        const res = await fetch(`/api/media/public/class_preview_${classId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setVideoMedia(data.media);
          } else {
            setVideoMedia({ id: null, isPlaceholder: true, className });
          }
        }
      } catch (err) {
        console.error('Error fetching class preview:', err);
      }
    };

    fetchClassVideo();
  }, [isOpen, classId, className]);

  if (!isOpen || !videoMedia) {
    return null;
  }

  if (showPlayer) {
    return (
      <div className="fixed inset-0 bg-grey-1000 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[12px] max-w-2xl w-full shadow-2xl overflow-hidden">
          <button
            onClick={() => {
              setShowPlayer(false);
              onClose();
            }}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full transition"
          >
            <X size={24} className="text-gray-900" />
          </button>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{className} Preview</h2>
            <p className="text-gray-600 mb-6">Get a sneak peek of this class</p>

            <CustomVideoPlayer
              videoUrl={videoMedia.id ? `/api/media/serve/${videoMedia.id}` : null}
              isPlaceholder={videoMedia.isPlaceholder}
              title={`${className} Preview`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-grey-1000 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-md w-full shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full transition"
        >
          <X size={24} className="text-gray-900" />
        </button>

        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{className}</h2>

          <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-black">
              <div className="text-6xl mb-4"></div>
              <p className="text-lg font-semibold mb-2">{className}</p>
              <p className="text-grey-200">Preview coming soon</p>
            </div>
          </div>

          <button
            onClick={() => setShowPlayer(true)}
            disabled={videoMedia.isPlaceholder}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Play size={20} className="fill-current" />
            Watch Preview
          </button>

          <p className="text-sm text-gray-600 text-center">
            {videoMedia.isPlaceholder
              ? 'Preview video coming soon'
              : 'Watch how this class will help you reach your goals'}
          </p>
        </div>
      </div>
    </div>
  );
}

