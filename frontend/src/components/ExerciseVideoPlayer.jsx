import React, { useEffect, useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';

export default function ExerciseVideoPlayer({ exerciseId, youtubeVideoId, exerciseName }) {
  const [customVideoMedia, setCustomVideoMedia] = useState(null);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);

  useEffect(() => {
    // Check if PT has uploaded custom video for this exercise
    const fetchCustomVideo = async () => {
      try {
        const res = await fetch(`/api/media/public/exercise_demo_${exerciseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setCustomVideoMedia(data.media);
            setHasCustomVideo(true);
          }
        }
      } catch (err) {
        console.error('Error fetching custom video:', err);
      }
    };

    fetchCustomVideo();
  }, [exerciseId]);

  // Show custom video if available, otherwise show YouTube embed
  if (hasCustomVideo && customVideoMedia) {
    return (
      <div className="space-y-2">
        <CustomVideoPlayer
          videoUrl={`/api/media/serve/${customVideoMedia.id}`}
          isPlaceholder={false}
          title={`${exerciseName} - Video Demonstration`}
        />
        <p className="text-xs text-gray-600">Custom demonstration video from your PT</p>
      </div>
    );
  }

  // Show YouTube embed as fallback
  if (youtubeVideoId) {
    return (
      <div className="space-y-2">
        <div className="aspect-video rounded-lg overflow-hidden bg-white">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            title={exerciseName}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-gray-600">Demonstration video from YouTube</p>
      </div>
    );
  }

  // Placeholder if no video
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center text-grey-200">
        <div className="text-4xl mb-2"></div>
        <p>Video demonstration coming soon</p>
      </div>
    </div>
  );
}

