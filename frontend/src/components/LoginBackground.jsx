import React, { useEffect, useState } from 'react';
import { useColors } from '../hooks/useColors';

export default function LoginBackground() {
  const { gradients } = useColors();
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    // Fetch active login background media from PT
    const fetchLoginBackground = async () => {
      try {
        const res = await fetch('/api/media/public/login_splash');
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setBackgroundImage(`/api/media/serve/${data.media.id}`);
          }
        }
      } catch (err) {
        console.error('Error fetching login background:', err);
      }
    };

    fetchLoginBackground();
  }, []);

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(10,20,40,0.7) 0%, rgba(17,38,60,0.7) 100%), url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    : {
        background: gradients.loginGradient
      };

  return (
    <div
      className="fixed inset-0 -z-10"
      style={backgroundStyle}
    />
  );
}
