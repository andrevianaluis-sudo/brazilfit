import React, { useEffect, useState } from 'react';
import { useColors } from '../hooks/useColors';

export default function HomeBanner() {
  const { gradients } = useColors();
  const [bannerImage, setBannerImage] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('morning'); // morning, afternoon, evening

  useEffect(() => {
    // Determine time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }
  }, []);

  useEffect(() => {
    // Fetch appropriate banner for time of day
    const fetchBanner = async () => {
      try {
        const res = await fetch(`/api/media/public/home_banner_${timeOfDay}`);
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setBannerImage(`/api/media/serve/${data.media.id}`);
          }
        }
      } catch (err) {
        console.error('Error fetching home banner:', err);
      }
    };

    if (timeOfDay) {
      fetchBanner();
    }
  }, [timeOfDay]);

  const backgroundStyle = bannerImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(10,20,40,0.6) 0%, rgba(17,38,60,0.6) 100%), url('${bannerImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        background: gradients.homeGradient
      };

  return (
    <div
      className="w-full rounded-[8px] p-6 md:p-8 text-black min-h-40 flex flex-col justify-center shadow-lg"
      style={backgroundStyle}
    >
      <h1 className="text-3xl md:text-4xl font-black mb-2">
        {timeOfDay === 'morning' && '🌅 Good Morning'}
        {timeOfDay === 'afternoon' && '☀️ Good Afternoon'}
        {timeOfDay === 'evening' && '🌙 Good Evening'}
      </h1>
      <p className="text-black text-lg">Let's train smarter today</p>
    </div>
  );
}
