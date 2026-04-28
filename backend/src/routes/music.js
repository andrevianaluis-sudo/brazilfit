const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY;
const FREESOUND_BASE_URL = 'https://freesound.org/apiv2';

// Cache for tracks (expires every 24 hours in production)
const musicCache = {
  meditation: { data: null, timestamp: null },
  breathing: { data: null, timestamp: null },
  mindfulness: { data: null, timestamp: null },
  ambient: { data: null, timestamp: null },
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch tracks from Freesound API filtered for Creative Commons 0 license
 * CC0 = completely free for commercial use, no attribution required
 */
async function fetchFreesoundTracks(query, limit = 15) {
  if (!FREESOUND_API_KEY) {
    console.error('[Music] FREESOUND_API_KEY not configured');
    return [];
  }

  try {
    const url = new URL(`${FREESOUND_BASE_URL}/search/text/`);
    url.searchParams.append('query', query);
    url.searchParams.append('fields', 'id,name,description,download_url,previews,duration,license,user,url,tags');
    url.searchParams.append('filter', 'license:("Creative Commons 0")'); // CC0 only
    url.searchParams.append('sort', 'rating_desc'); // Most highly rated first
    url.searchParams.append('page_size', limit);
    url.searchParams.append('token', FREESOUND_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`[Music] Freesound API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!data.results) return [];

    // Transform Freesound results to our format
    return data.results
      .filter(track => track.previews && (track.previews['preview-hq-mp3'] || track.previews['preview-lq-mp3']))
      .map(track => ({
        id: `fs-${track.id}`,
        name: track.name,
        artist: track.user?.username || 'Freesound',
        duration: Math.round(track.duration),
        url: track.previews['preview-hq-mp3'] || track.previews['preview-lq-mp3'],
        freesoundUrl: track.url,
        license: 'Creative Commons 0',
        attribution: `${track.name} by ${track.user?.username || 'Freesound'} (CC0)`,
      }));
  } catch (err) {
    console.error('[Music] Freesound fetch error:', err.message);
    return [];
  }
}

/**
 * GET /api/music/meditation — Meditation & mindfulness tracks
 * Returns cached results with automatic refresh every 24 hours
 * Public endpoint (no auth required) — free Creative Commons content
 */
router.get('/meditation', async (req, res) => {
  const cached = musicCache.meditation;
  const now = Date.now();

  // Return cached data if still valid
  if (cached.data && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
    return res.json(cached.data);
  }

  // Fetch fresh data
  const tracks = await fetchFreesoundTracks('meditation peaceful calm', 20);

  const result = {
    category: 'meditation',
    tracks,
    lastUpdated: new Date().toISOString(),
  };

  musicCache.meditation = { data: result, timestamp: now };
  res.json(result);
});

/**
 * GET /api/music/breathing — Breathing exercise tracks
 */
router.get('/breathing', async (req, res) => {
  const cached = musicCache.breathing;
  const now = Date.now();

  if (cached.data && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
    return res.json(cached.data);
  }

  const tracks = await fetchFreesoundTracks('breathing gentle calm soft', 15);

  const result = {
    category: 'breathing',
    tracks,
    lastUpdated: new Date().toISOString(),
  };

  musicCache.breathing = { data: result, timestamp: now };
  res.json(result);
});

/**
 * GET /api/music/mindfulness — Mindfulness & zen tracks
 */
router.get('/mindfulness', async (req, res) => {
  const cached = musicCache.mindfulness;
  const now = Date.now();

  if (cached.data && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
    return res.json(cached.data);
  }

  const tracks = await fetchFreesoundTracks('mindfulness zen peaceful nature ambient', 15);

  const result = {
    category: 'mindfulness',
    tracks,
    lastUpdated: new Date().toISOString(),
  };

  musicCache.mindfulness = { data: result, timestamp: now };
  res.json(result);
});

/**
 * GET /api/music/ambient — Ambient & nature sound tracks
 */
router.get('/ambient', async (req, res) => {
  const cached = musicCache.ambient;
  const now = Date.now();

  if (cached.data && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
    return res.json(cached.data);
  }

  const tracks = await fetchFreesoundTracks('ambient rain nature forest binaural bowls', 20);

  const result = {
    category: 'ambient',
    tracks,
    lastUpdated: new Date().toISOString(),
  };

  musicCache.ambient = { data: result, timestamp: now };
  res.json(result);
});

/**
 * GET /api/music/chimes — Soft chime/bell sounds for session transitions
 * Used at the start/end of sessions and between instruction changes
 * Returns free Creative Commons 0 sounds
 */
router.get('/chimes', async (req, res) => {
  try {
    // Try to fetch soft chime/bell sounds from Freesound (CC0 only)
    // If that fails, return empty array (chimes are optional)
    const url = new URL(`${FREESOUND_BASE_URL}/search/text/`);
    url.searchParams.append('query', 'bell chime ping notification');
    url.searchParams.append('fields', 'id,name,duration,previews');
    url.searchParams.append('filter', 'license:("Creative Commons 0")');
    url.searchParams.append('sort', 'rating_desc');
    url.searchParams.append('page_size', 10);
    url.searchParams.append('token', FREESOUND_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn('[Chimes] API response not OK:', response.status);
      return res.json({ chimes: [] });
    }

    const data = await response.json();
    const chimes = (data.results || [])
      .filter(t => t.previews && t.duration <= 2) // Very short sounds only
      .slice(0, 4)
      .map(t => ({
        id: `chime-${t.id}`,
        name: t.name,
        url: t.previews['preview-hq-mp3'] || t.previews['preview-lq-mp3'],
        duration: t.duration,
      }));

    res.json({ chimes });
  } catch (err) {
    console.error('[Chimes] Fetch error:', err.message);
    // Return empty chimes gracefully - app works fine without sound
    res.json({ chimes: [] });
  }
});

module.exports = router;
