import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

export default function WelcomeVideoModal({ isOpen, onClose }) {
  const [videoMedia, setVideoMedia] = useState(null);
  const [hasWatched, setHasWatched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check if client just completed onboarding
    const checkOnboarding = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          // If onboarding_completed and not marked as watched welcome video
          if (data.user && data.user.onboarding_completed && !hasWatched) {
            fetchWelcomeVideo();
          }
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
      }
    };

    checkOnboarding();
  }, [isOpen, hasWatched]);

  const fetchWelcomeVideo = async () => {
    try {
      const res = await fetch('/api/media/public/welcome');
      if (res.ok) {
        const data = await res.json();
        if (data.media) {
          setVideoMedia(data.media);
        } else {
          // No welcome video uploaded yet, show placeholder
          setVideoMedia({ id: null, isPlaceholder: true });
        }
      }
    } catch (err) {
      console.error('Error fetching welcome video:', err);
    }
  };

  if (!isOpen || !videoMedia) {
    return null;
  }

  const handleClose = () => {
    setHasWatched(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-grey-1000 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full transition"
        >
          <X size={24} className="text-gray-900" />
        </button>

        {/* Video */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BrazilFit!</h2>
          <p className="text-gray-600 mb-6">Here's a message from your PT to get you started</p>

          <CustomVideoPlayer
            videoUrl={videoMedia.id ? `/api/media/serve/${videoMedia.id}` : null}
            isPlaceholder={videoMedia.isPlaceholder}
            title="Welcome Message"
          />

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-black font-semibold py-3 rounded-lg transition"
            >
              Let's Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

