import { useState, useEffect } from 'react';

/**
 * Custom hook to detect network connection type and quality
 * Returns 'wifi' for good connections, 'mobile' for slower connections
 */
export const useNetworkQuality = () => {
  const [quality, setQuality] = useState('wifi');

  useEffect(() => {
    // Check if Network Information API is available
    if (navigator.connection) {
      const updateQuality = () => {
        const effectiveType = navigator.connection.effectiveType;

        switch (effectiveType) {
          case '4g':
            setQuality('wifi');
            break;
          case '3g':
            setQuality('mobile');
            break;
          case '2g':
          case 'slow-4g':
            setQuality('mobile');
            break;
          default:
            setQuality('wifi');
        }
      };

      // Set initial quality
      updateQuality();

      // Listen for changes
      navigator.connection.addEventListener('change', updateQuality);

      return () => {
        navigator.connection.removeEventListener('change', updateQuality);
      };
    }
  }, []);

  return quality;
};

/**
 * Get recommended video resolution based on network quality
 */
export const getRecommendedResolution = (networkQuality, availableResolutions = []) => {
  if (!availableResolutions || availableResolutions.length === 0) {
    return null;
  }

  // Sort by resolution
  const sorted = [...availableResolutions].sort((a, b) => {
    const aNum = parseInt(a.resolution);
    const bNum = parseInt(b.resolution);
    return bNum - aNum;
  });

  if (networkQuality === 'wifi') {
    // Prefer highest quality on WiFi
    return sorted[0].resolution;
  } else {
    // Prefer lower quality on mobile to save data
    return sorted[sorted.length - 1].resolution;
  }
};
