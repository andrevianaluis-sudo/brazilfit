import React, { useEffect, useState } from 'react';
import { useColors } from '../hooks/useColors';

export default function EmptyState({ section = 'progress', message = 'No data yet', actionButton = null }) {
  const { gradients } = useColors();
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    // Fetch empty state background for section
    const fetchBackground = async () => {
      try {
        const res = await fetch(`/api/media/public/empty_state_${section}`);
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setBackgroundImage(`/api/media/serve/${data.media.id}`);
          }
        }
      } catch (err) {
        console.error('Error fetching empty state background:', err);
      }
    };

    fetchBackground();
  }, [section]);

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(10,20,40,0.7) 0%, rgba(17,38,60,0.7) 100%), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        background: gradients.emptyStateGradient
      };

  const icons = {
    progress: '',
    diary: '',
    badges: '',
    checkIn: '',
    messages: '',
    wearables: '',
    classes: '',
    success: ''
  };

  return (
    <div
      className="rounded-lg p-12 text-center text-black"
      style={backgroundStyle}
    >
      <div className="text-6xl mb-4">{icons[section] || ''}</div>
      <h3 className="text-2xl font-bold mb-2">{message}</h3>
      <p className="text-black mb-6 max-w-sm mx-auto">
        {section === 'progress' && "Start logging your measurements and progress photos to track your transformation"}
        {section === 'diary' && 'Begin tracking your daily food intake and mood patterns to gain insights'}
        {section === 'badges' && 'Complete workouts and challenges to unlock achievement badges'}
        {section === 'checkIn' && 'Complete your first weekly check-in to share how your week went'}
        {section === 'messages' && 'Send a message to your PT to get personalized advice and feedback'}
        {section === 'wearables' && 'Connect your smartwatch or fitness tracker to monitor your daily metrics'}
        {section === 'classes' && 'No classes scheduled yet. Check back soon or ask your PT about available classes'}
        {section === 'success' && 'Your success stories will inspire others in the community'}
      </p>

      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-black font-semibold px-6 py-3 rounded-lg transition inline-block"
        >
          {actionButton.label || 'Get Started'}
        </button>
      )}
    </div>
  );
}

