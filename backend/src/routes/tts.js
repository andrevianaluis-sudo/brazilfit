const express = require('express');
const router  = express.Router();
const { authenticateToken } = require('../middleware/auth');

// ── Allowed voices (confirmed free-tier premade voices) ───────────────────────
const ALLOWED_VOICES = new Set([
  '9BWtsMINqrJLrRacOk9x', // Aria      — warm, natural American female  ← DEFAULT FEMALE
  'pNInz6obpgDQGcFmaJgB', // Adam      — warm, deep American male       ← DEFAULT MALE
  'TxGEqnHWrfWFTfGW9XjX', // Josh      — calm, warm male alternative
  'XB0fDUnXU5powFXDhCwa', // Charlotte — calm, warm British female
  'EXAVITQu4vr4xnSDxMaL', // Sarah
  'FGY2WhTYpPnrIDTdsKH5', // Laura
  'IKne3meq5aSn9XLyUdCD', // Charlie
  'JBFqnCBsd6RMkjVDRZzb', // George
  'N2lVS1w4EtoT3dr4eOWO', // Callum
  'TX3LPaxmHKxFdv7VOQHJ', // Liam
  'Xb7hH8MSUJpSbSDYk0k2', // Alice
  'XrExE9yKIg1WjnnlVkGX', // Matilda
  'bIHbv24MWmeRgasZH58o', // Will
  'cgSgspJ2msm6clMCkdW9', // Jessica
  'cjVigY5qzO86Huf0OWal', // Eric
  'iP95p4xoKVk53GoZ742B', // Chris
  'nPczCjzI2devNBz1zQrb', // Brian
  'onwK4e9ZLuTAKqWW03F9', // Daniel
  'pFZP5JQG7iQjIQuC4Bku', // Lily
  'pqHfZKP75CvOlQylNhV4', // Bill
]);

const DEFAULT_FEMALE_VOICE = '9BWtsMINqrJLrRacOk9x'; // Aria
const DEFAULT_MALE_VOICE   = 'pNInz6obpgDQGcFmaJgB'; // Adam

// ── Voice settings per session type ──────────────────────────────────────────
// stability    : lower = more expressive/natural variation; higher = more consistent
// similarity   : how closely to match the reference voice
// style        : expressiveness / emotional range (0 = neutral, 1 = very expressive)
// speaker_boost: adds clarity and presence
// speaking_rate: voice speed (0.5–2.0); 0.80 = 20% slower than normal
function getVoiceSettings(sessionType) {
  switch (sessionType) {
    case 'meditation':
      // Very calm, slow, almost whisper-like — maximum natural variation
      return { stability: 0.30, similarity_boost: 0.75, style: 0.40, speaking_rate: 0.80, use_speaker_boost: true };
    case 'breathing':
      // Gentle, clear, measured — slightly expressive for encouragement
      return { stability: 0.30, similarity_boost: 0.75, style: 0.40, speaking_rate: 0.80, use_speaker_boost: true };
    default:
      // General coaching — warm, natural, conversational
      return { stability: 0.30, similarity_boost: 0.75, style: 0.40, speaking_rate: 0.80, use_speaker_boost: true };
  }
}

// ── SSML helpers ─────────────────────────────────────────────────────────────

// Adds natural pauses to meditation text by inserting SSML <break> tags after
// sentence-ending punctuation and commas, then wraps in <speak>.
function addMeditationSSML(text) {
  if (!text || text.includes('<speak>')) return text; // already SSML
  const enhanced = text
    .replace(/([.!?])\s+/g,  '$1<break time="2.0s"/>')  // sentence end → 2.0s pause
    .replace(/([,;:])\s+/g,  '$1<break time="0.7s"/>');  // clause pause  → 0.7s
  return `<speak>${enhanced}<break time="1.5s"/></speak>`;
}

// Wraps a single breathing cue word in a soft SSML context for gentler delivery.
// Adds a 3-second pause at the end to give time for the breathing action.
function addBreathingSSML(text) {
  if (!text || text.includes('<speak>')) return text;
  return `<speak><prosody rate="slow" pitch="-2st">${text}</prosody><break time="3.0s"/></speak>`;
}

// ── Shared TTS handler ────────────────────────────────────────────────────────
async function handleTTS(req, res) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your-elevenlabs-api-key-here') {
    return res.status(503).json({ error: 'TTS not configured' });
  }

  const { text, voiceId, sessionType = 'general' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }

  const rawText = text.slice(0, 700); // free-tier safety limit
  const vid     = (typeof voiceId === 'string' && ALLOWED_VOICES.has(voiceId))
    ? voiceId
    : DEFAULT_FEMALE_VOICE;
  const settings = getVoiceSettings(sessionType);

  // Transform plain text → SSML depending on session type for maximum naturalness
  let ttsText;
  if (sessionType === 'meditation') {
    ttsText = addMeditationSSML(rawText);
  } else if (sessionType === 'breathing') {
    ttsText = addBreathingSSML(rawText);
  } else {
    ttsText = rawText;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method:  'POST',
      headers: {
        'xi-api-key':   apiKey,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text:           ttsText,
        model_id:       'eleven_turbo_v2_5',  // highest quality, free-tier compatible
        voice_settings: settings,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[TTS] ElevenLabs error', response.status, errText.slice(0, 300));
      return res.status(response.status).json({ error: 'ElevenLabs error', status: response.status });
    }

    res.set('Content-Type',  'audio/mpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // 24h browser cache
    const buf = await response.arrayBuffer();
    res.send(Buffer.from(buf));

  } catch (err) {
    console.error('[TTS] Network error:', err.message);
    res.status(502).json({ error: 'Failed to reach ElevenLabs' });
  }
}

// POST /api/tts          — used by ClientWellness preloadTexts
router.post('/',      authenticateToken, handleTTS);
// POST /api/tts/speak    — kept for compatibility
router.post('/speak', authenticateToken, handleTTS);

module.exports = router;
