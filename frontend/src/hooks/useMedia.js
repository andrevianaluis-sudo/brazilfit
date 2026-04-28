import { useState, useEffect } from 'react';

export const useMedia = (category, subCategory = '') => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    const fetchMedia = async () => {
      try {
        setLoading(true);
        const url = subCategory
          ? `/api/media/public/${category}_${subCategory}`
          : `/api/media/public/${category}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMedia(data.media);
        } else {
          setError('Failed to load media');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [category, subCategory]);

  return { media, loading, error };
};

export const useWeeklyMedia = (type) => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type) {
      setLoading(false);
      return;
    }

    const fetchMedia = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/media/weekly/${type}`);
        if (res.ok) {
          const data = await res.json();
          setMedia(data.media);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching weekly media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [type]);

  return { media, loading, error };
};
