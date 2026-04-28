import React, { useEffect, useState } from 'react';
import { Play, Heart } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

export default function WeeklyMotivationCard() {
  const [videoMedia, setVideoMedia] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);

  useEffect(() => {
    fetchWeeklyVideo();
  }, []);

  const fetchWeeklyVideo = async () => {
    try {
      const res = await fetch('/api/media/weekly/motivation_video');
      if (res.ok) {
        const data = await res.json();
        if (data.media) {
          setVideoMedia(data.media);
          fetchReactions(data.media.id);
        } else {
          // Show placeholder
          setVideoMedia({ id: null, isPlaceholder: true });
        }
      }
    } catch (err) {
      console.error('Error fetching weekly video:', err);
    }
  };

  const fetchReactions = async (mediaId) => {
    try {
      const res = await fetch(`/api/media/${mediaId}/reactions`);
      if (res.ok) {
        const data = await res.json();
        const heartReactions = data.reactions.find(r => r.reaction_type === 'heart');
        setReactionCount(heartReactions?.count || 0);
      }
    } catch (err) {
      console.error('Error fetching reactions:', err);
    }
  };

  const handleReact = async () => {
    if (!videoMedia?.id || videoMedia.isPlaceholder) return;

    try {
      const res = await fetch(`/api/media/${videoMedia.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: 'heart' })
      });

      if (res.ok) {
        setHasReacted(!hasReacted);
        fetchReactions(videoMedia.id);
      }
    } catch (err) {
      console.error('Error reacting:', err);
    }
  };

  if (!videoMedia) {
    return null;
  }

  if (showPlayer) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowPlayer(false)}
          className="text-emerald-600 hover:text-emerald-700 font-semibold transition"
        >
          ← Back
        </button>
        <CustomVideoPlayer
          videoUrl={videoMedia.id ? `/api/media/serve/${videoMedia.id}` : null}
          isPlaceholder={videoMedia.isPlaceholder}
          title="Weekly Motivation"
        />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[8px] p-6 text-black shadow-lg">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-emerald-100 text-sm">This Week's Motivation</p>
          <h3 className="text-2xl font-bold">Weekly Message from Your PT</h3>
          <p className="text-emerald-50">New video every Monday</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShowPlayer(true)}
            disabled={videoMedia.isPlaceholder}
            className="bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-emerald-600 rounded-full p-4 transition"
          >
            <Play size={28} className="fill-current" />
          </button>

          <button
            onClick={handleReact}
            disabled={videoMedia.isPlaceholder}
            className={`flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasReacted ? 'text-red-400' : 'text-black hover:text-black 
            } transition`}
          >
            <Heart size={20} className={hasReacted ? 'fill-current' : ''} />
            <span className="text-sm">{reactionCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
