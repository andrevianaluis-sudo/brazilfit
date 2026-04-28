import React, { useEffect, useState } from 'react';
import { useColors } from '../hooks/useColors';

export default function WellnessBackground({ type = 'meditation' }) {
  const { gradients } = useColors();
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    // Fetch wellness background for type (meditation or breathing)
    const fetchBackground = async () => {
      try {
        const res = await fetch(`/api/media/public/wellness_${type}`);
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setBackgroundImage(`/api/media/serve/${data.media.id}`);
          }
        }
      } catch (err) {
        console.error('Error fetching wellness background:', err);
      }
    };

    fetchBackground();
  }, [type]);

  const gradientKey = type === 'meditation' ? 'meditationGradient' : 'breathingGradient';
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(10,20,40,0.5) 0%, rgba(17,38,60,0.5) 100%), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        background: gradients[gradientKey]
      };

  return (
    <div
      className="fixed inset-0 -z-10"
      style={backgroundStyle}
    />
  );
}
