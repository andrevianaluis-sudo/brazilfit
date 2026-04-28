import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import {
  Brain, Wind, Leaf, Heart, Waves, Crown, Play, Pause,
  ChevronDown, ChevronUp, Clock, X, CheckCircle,
  Volume2, Volume1, VolumeX, Music,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ─── Static data ──────────────────────────────────────────────────────────────

const TYPES = [
  { key: 'mindfulness',    label: 'Mindfulness',   icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  { key: 'breathing',      label: 'Breathing',      icon: Wind,  color: 'text-blue-400',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30'   },
  { key: 'rest_day',       label: 'Rest Day',        icon: Leaf,  color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/30'  },
  { key: 'mental_wellness',label: 'Mental Health',   icon: Heart, color: 'text-pink-400',   bg: 'bg-pink-500/20',   border: 'border-pink-500/30'   },
  { key: 'stress',         label: 'Stress',          icon: Waves, color: 'text-teal-400',   bg: 'bg-teal-500/20',   border: 'border-teal-500/30'   },
];

const SECTION_INFO = {
  mindfulness:     { emoji: '🧘', text: 'Guided meditation sessions to sharpen focus and aid recovery' },
  breathing:       { emoji: '💨', text: 'Breathing techniques for pre-workout energy and post-workout calm' },
  rest_day:        { emoji: '🌿', text: 'Stretching routines and foam rolling guides for active recovery' },
  mental_wellness: { emoji: '💚', text: 'Tips and insights to build a stronger, healthier mindset' },
  stress:          { emoji: '🌊', text: 'Strategies to manage stress and protect your training progress' },
};

const DIFFICULTY_STYLE = {
  beginner:     'bg-green-500/20 text-green-400',
  intermediate: 'bg-orange-500/20 text-orange-400',
  advanced:     'bg-red-500/20 text-red-400',
};

const AMBIENT_OPTIONS = [
  { key: 'silence', label: 'Silence', emoji: '🔇' },
  { key: 'rain',    label: 'Rain',    emoji: '🌧️' },
  { key: 'forest',  label: 'Forest',  emoji: '🌿' },
];

// Fallback royalty-free tracks from Pixabay CDN (for when API is unavailable)
const FALLBACK_MUSIC_TRACKS = [
  {
    id:     'tibetan',
    name:   'Tibetan Bowls',
    artist: 'DesiFreeMuzic',
    emoji:  '🎵',
    url:    'https://cdn.pixabay.com/download/audio/2025/07/04/audio_56496453ec.mp3?filename=desifreemusic-minimalistic-meditation-soundscape-with-tibetan-singing-bowls-369761.mp3',
    license: 'Pixabay License',
    attribution: 'Tibetan Bowls by DesiFreeMuzic (Pixabay)',
  },
  {
    id:     'piano',
    name:   'Peaceful Piano',
    artist: 'HarumachiMusic',
    emoji:  '🎹',
    url:    'https://cdn.pixabay.com/download/audio/2022/05/28/audio_b79a40aa49.mp3?filename=harumachimusic-peaceful-garden-healing-light-piano-for-meditation-zen-landscapes-112199.mp3',
    license: 'Pixabay License',
    attribution: 'Peaceful Piano by HarumachiMusic (Pixabay)',
  },
  {
    id:     'flute',
    name:   'Nature & Flute',
    artist: 'Siarhei_Korbut',
    emoji:  '🌿',
    url:    'https://cdn.pixabay.com/download/audio/2025/08/10/audio_d7b8695825.mp3?filename=siarhei_korbut-elven-flute-meditation-nature-remix-387545.mp3',
    license: 'Pixabay License',
    attribution: 'Nature & Flute by Siarhei_Korbut (Pixabay)',
  },
  {
    id:     'om',
    name:   'Deep Om',
    artist: 'kalsstockmedia',
    emoji:  '🕉️',
    url:    'https://cdn.pixabay.com/download/audio/2024/08/04/audio_6729bddbf2.mp3?filename=kalsstockmedia-deep-om-chants-with-reverb-229614.mp3',
    license: 'Pixabay License',
    attribution: 'Deep Om by kalsstockmedia (Pixabay)',
  },
  {
    id:     'binaural',
    name:   'Binaural Beats',
    artist: 'CHAKONG',
    emoji:  '🔮',
    url:    'https://cdn.pixabay.com/download/audio/2023/12/19/audio_1a5566c7ca.mp3?filename=chakong-binaural-beats-alpha-sinewaves-meditation-focus-relax-7-hz-182096.mp3',
    license: 'Pixabay License',
    attribution: 'Binaural Beats by CHAKONG (Pixabay)',
  },
];

const PREF_TRACK_KEY = 'bf_music_track';
const PREF_VOL_KEY   = 'bf_music_vol';
const PREF_LOOP_KEY  = 'bf_music_loop';
const PREF_SHUFFLE_KEY = 'bf_music_shuffle';

// ─── Chime sounds for session transitions (no voice guidance) ─────────────────

function useChimeSound() {
  const chimesRef = useRef([]);
  const [loading, setLoading] = useState(false);

  // Fetch chime sounds from Freesound API on mount
  useEffect(() => {
    const fetchChimes = async () => {
      try {
        const res = await fetch('/api/music/chimes');
        if (!res.ok) throw new Error('Failed to fetch chimes');
        const data = await res.json();
        if (data.chimes && data.chimes.length > 0) {
          chimesRef.current = data.chimes;
        }
      } catch (err) {
        console.warn('[Chime] Fetch failed, using silent mode:', err.message);
        chimesRef.current = [];
      }
    };
    fetchChimes();
  }, []);

  const playChime = useCallback(() => {
    if (chimesRef.current.length === 0) return;
    try {
      const randomChime = chimesRef.current[Math.floor(Math.random() * chimesRef.current.length)];
      const audio = new Audio();
      audio.src = randomChime.url;
      audio.volume = 0.3;
      audio.play().catch(e => console.warn('[Chime] Play failed:', e.message));
    } catch (err) {
      console.warn('[Chime] Error:', err.message);
    }
  }, []);

  return { playChime };
}

// ─── Ambient Sound Generator (Web Audio API) ─────────────────────────────────

function buildAmbientNodes(ctx, type) {
  const sr  = ctx.sampleRate;
  const len = sr * 10;
  const buf = ctx.createBuffer(2, len, sr);

  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    if (type === 'rain') {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
        d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.13;
        b6 = w * 0.115926;
      }
    } else if (type === 'forest') {
      for (let i = 0; i < len; i++) {
        const env = 0.85 + 0.15 * Math.sin((i / sr) * 0.4 * Math.PI);
        d[i] = (Math.random() * 2 - 1) * 0.14 * env;
      }
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop   = true;

  if (type === 'rain') {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1600;
    source.connect(lp);
    return { source, outputNode: lp };
  }
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.6;
  source.connect(bp);
  return { source, outputNode: bp };
}

// ─── useSessionAudio — ElevenLabs TTS (+ Web Speech fallback) + ambient ──────

function useSessionAudio(clientGender) {
  // Auto-select voice based on client gender if no manual override in localStorage
  const getInitialVoice = () => {
    const saved = localStorage.getItem(VOICE_PREF_KEY);
    if (saved) return saved; // manual override takes precedence
    // Auto-select based on gender
    if (clientGender === 'male') return 'male';
    return 'aria'; // default to female for unknown/female
  };

  const [volume,     setVolumeState]  = useState(0.75);
  const [muted,      setMutedState]   = useState(false);
  const [ambient,    setAmbientState] = useState('silence');
  const [voicePref,  setVoicePrefSt]  = useState(getInitialVoice);
  const [ttsLoading, setTtsLoading]   = useState(false);

  const volumeRef  = useRef(0.75);
  const mutedRef   = useRef(false);
  const ambientRef = useRef('silence');
  const voiceRef   = useRef(getInitialVoice());

  // Shared Web Audio context for ambient generation + ElevenLabs playback
  const ctxRef     = useRef(null);
  const ambGainRef = useRef(null);
  const ambSrcRef  = useRef(null);
  const ttsSrcRef  = useRef(null);
  const ttsGainRef = useRef(null);

  // ElevenLabs cache: `${text}__${voiceId}` → AudioBuffer (or null = failed → use fallback)
  const cacheRef = useRef(new Map());

  const getCtx = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  };

  // ── Ambient ──────────────────────────────────────────────────────────────

  const stopAmbient = useCallback(() => {
    if (ambSrcRef.current)  { try { ambSrcRef.current.stop();       } catch {} ambSrcRef.current  = null; }
    if (ambGainRef.current) { try { ambGainRef.current.disconnect(); } catch {} ambGainRef.current = null; }
  }, []);

  const startAmbient = useCallback(() => {
    stopAmbient();
    const type = ambientRef.current;
    if (type === 'silence') return;
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain();
      gain.gain.value = mutedRef.current ? 0 : volumeRef.current * 0.38;
      gain.connect(ctx.destination);
      ambGainRef.current = gain;
      const { source, outputNode } = buildAmbientNodes(ctx, type);
      outputNode.connect(gain);
      source.start();
      ambSrcRef.current = source;
    } catch (e) { console.warn('Ambient error:', e); }
  }, [stopAmbient]);

  // ── Web Speech API fallback ───────────────────────────────────────────────

  const speakFallback = useCallback((text) => {
    if (!text || mutedRef.current) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = () => {
      const u  = new SpeechSynthesisUtterance(text);
      u.rate   = 0.75; u.pitch = 0.88;
      u.volume = volumeRef.current;
      const voices    = synth.getVoices();
      const isFemale  = voiceRef.current === 'female';
      const pick = isFemale
        ? voices.find(v => /samantha|karen|moira|fiona|victoria/i.test(v.name)) ||
          voices.find(v => v.lang.startsWith('en') && /female/i.test(v.name)) ||
          voices.find(v => v.lang.startsWith('en'))
        : voices.find(v => /daniel|james|oliver|george|arthur/i.test(v.name)) ||
          voices.find(v => v.lang.startsWith('en') && /male/i.test(v.name)) ||
          voices.find(v => v.lang.startsWith('en'));
      if (pick) u.voice = pick;
      synth.speak(u);
    };
    synth.getVoices().length > 0 ? utter() : synth.addEventListener('voiceschanged', utter, { once: true });
  }, []);

  // ── ElevenLabs playback via Web Audio ────────────────────────────────────

  const stopSpeech = useCallback(() => {
    if (ttsSrcRef.current)  { try { ttsSrcRef.current.stop();       } catch {} ttsSrcRef.current  = null; }
    if (ttsGainRef.current) { try { ttsGainRef.current.disconnect(); } catch {} ttsGainRef.current = null; }
    window.speechSynthesis?.cancel();
  }, []);

  const playBuffer = useCallback((buffer) => {
    stopSpeech();
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const gain = ctx.createGain();
      gain.gain.value = mutedRef.current ? 0 : volumeRef.current;
      gain.connect(ctx.destination);
      ttsGainRef.current = gain;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(gain);
      src.start();
      ttsSrcRef.current = src;
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
  }, [stopSpeech]);

  const speak = useCallback((text) => {
    if (!text || mutedRef.current) return;
    const voiceId  = EL_VOICES[voiceRef.current]?.id || EL_VOICES.aria.id;
    const cacheKey = `${text}__${voiceId}`;
    if (cacheRef.current.has(cacheKey)) {
      const buf = cacheRef.current.get(cacheKey);
      buf ? playBuffer(buf) : speakFallback(text); // null = ElevenLabs failed → fallback
    } else {
      speakFallback(text); // not pre-cached yet → fallback
    }
  }, [playBuffer, speakFallback]);

  // Pre-fetch ElevenLabs audio for all session texts in parallel.
  // Call this when the session overlay opens so playback is instant.
  // sessionType: 'general' | 'breathing' | 'meditation' — controls voice settings + SSML on backend
  const preloadTexts = useCallback(async (texts, sessionType = 'general') => {
    const voiceId  = EL_VOICES[voiceRef.current]?.id || EL_VOICES.aria.id;
    const uncached = texts.filter(t => t && !cacheRef.current.has(`${t}__${voiceId}`));
    if (uncached.length === 0) return;
    setTtsLoading(true);
    // Mark all as in-progress immediately so speak() falls back gracefully if called before done
    uncached.forEach(t => cacheRef.current.set(`${t}__${voiceId}`, null));
    try {
      await Promise.all(uncached.map(async (text) => {
        const key = `${text}__${voiceId}`;
        try {
          const token = localStorage.getItem('brazilfit_token');
          const resp = await fetch('/api/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            // Send voiceId + sessionType so backend applies the right voice and SSML
            body: JSON.stringify({ text, voiceId, sessionType }),
          });
          if (!resp.ok) throw new Error(`TTS ${resp.status}`);
          const arrayBuffer = await resp.arrayBuffer();
          const ctx  = getCtx();
          const buf  = await ctx.decodeAudioData(arrayBuffer);
          cacheRef.current.set(key, buf);
        } catch (e) {
          // Leave as null — speak() will use Web Speech API fallback for this text
          console.warn('[TTS] ElevenLabs unavailable for:', text.slice(0, 40), '-', e?.message || 'error');
        }
      }));
    } finally {
      setTtsLoading(false);
    }
  }, []);

  // ── Volume / Mute / Voice preference ─────────────────────────────────────

  const setVolume = useCallback((v) => {
    volumeRef.current = v; setVolumeState(v);
    const t = ctxRef.current?.currentTime ?? 0;
    if (ambGainRef.current) ambGainRef.current.gain.setTargetAtTime(mutedRef.current ? 0 : v * 0.38, t, 0.08);
    if (ttsGainRef.current) ttsGainRef.current.gain.setTargetAtTime(mutedRef.current ? 0 : v, t, 0.08);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next; setMutedState(next);
    const t = ctxRef.current?.currentTime ?? 0;
    if (ambGainRef.current) ambGainRef.current.gain.setTargetAtTime(next ? 0 : volumeRef.current * 0.38, t, 0.08);
    if (next) stopSpeech();
  }, [stopSpeech]);

  const setAmbient = useCallback((type) => {
    ambientRef.current = type; setAmbientState(type);
  }, []);

  const setVoicePref = useCallback((pref) => {
    voiceRef.current = pref;
    setVoicePrefSt(pref);
    localStorage.setItem(VOICE_PREF_KEY, pref);
    cacheRef.current.clear(); // clear cache — new voice needs fresh audio
  }, []);

  const cleanup = useCallback(() => {
    stopSpeech(); stopAmbient();
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, [stopSpeech, stopAmbient]);

  return {
    volume, setVolume,
    muted, toggleMute,
    ambient, setAmbient,
    voicePref, setVoicePref,
    ttsLoading,
    speak, stopSpeech,
    startAmbient, stopAmbient,
    preloadTexts,
    cleanup,
  };
}

// ─── useMusicPlayer — Freesound API + real audio tracks with fade, shuffle, loop ──

function useMusicPlayer() {
  const initTrack = localStorage.getItem(PREF_TRACK_KEY) || FALLBACK_MUSIC_TRACKS[0].id;
  const initVol   = parseFloat(localStorage.getItem(PREF_VOL_KEY) || '0.55');
  const initLoop  = localStorage.getItem(PREF_LOOP_KEY) === 'true';
  const initShuffle = localStorage.getItem(PREF_SHUFFLE_KEY) === 'true';

  const [tracks,      setTracks]       = useState(FALLBACK_MUSIC_TRACKS);
  const [selectedId,  setSelectedId]   = useState(initTrack);
  const [favouriteId, setFavouriteId]  = useState(initTrack);
  const [volume,      setVolumeState]  = useState(initVol);
  const [isPlaying,   setIsPlaying]    = useState(false);
  const [isLoading,   setIsLoading]    = useState(false);
  const [loopMode,    setLoopModeState] = useState(initLoop); // true = loop, false = no loop
  const [shuffle,     setShuffleState]  = useState(initShuffle);
  const [attribution, setAttribution]   = useState('');

  const elRef    = useRef(null);  // HTMLAudioElement
  const volRef   = useRef(initVol);
  const fadeRef  = useRef(null);
  const playQueueRef = useRef([]); // For shuffle mode

  // Fetch tracks from Freesound API on component mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/music/meditation');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks([...data.tracks, ...FALLBACK_MUSIC_TRACKS]);
        }
      } catch (err) {
        console.warn('[Music] Freesound fetch failed, using fallback:', err.message);
        setTracks(FALLBACK_MUSIC_TRACKS);
      }
    };
    fetchTracks();
  }, []);

  // Cancel any in-progress fade
  const clearFade = () => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  };

  // Get/create the audio element, updating src only when needed
  const getEl = (url) => {
    if (!elRef.current) {
      const a = new Audio();
      a.preload = 'auto';
      elRef.current = a;
    }
    if (elRef.current.src !== url) {
      elRef.current.src = url;
    }
    return elRef.current;
  };

  // Fade volume from current → target over durationMs, then call onDone
  const fadeTo = (el, target, durationMs, onDone) => {
    clearFade();
    const start = el.volume;
    const steps = Math.max(1, Math.round(durationMs / 50));
    let   step  = 0;
    fadeRef.current = setInterval(() => {
      step++;
      el.volume = Math.max(0, Math.min(1, start + (target - start) * (step / steps)));
      if (step >= steps) {
        clearFade();
        el.volume = target;
        onDone?.();
      }
    }, 50);
  };

  const buildPlayQueue = () => {
    if (shuffle) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playQueueRef.current = shuffled.map(t => t.id);
    } else {
      playQueueRef.current = tracks.map(t => t.id);
    }
  };

  const play = useCallback(() => {
    const track = tracks.find(t => t.id === selectedId);
    if (!track) return;
    clearFade();
    const el = getEl(track.url);
    el.volume = 0;
    el.loop = loopMode;
    setIsLoading(true);
    setAttribution(track.attribution || `${track.name} by ${track.artist}`);
    el.play()
      .then(() => {
        setIsLoading(false);
        setIsPlaying(true);
        fadeTo(el, volRef.current, 3000); // 3-second fade-in
      })
      .catch(() => { setIsLoading(false); console.warn('Music play failed'); });
  }, [selectedId, tracks, loopMode]); // eslint-disable-line

  const stop = useCallback(() => {
    const el = elRef.current;
    if (!el || el.paused) { setIsPlaying(false); return; }
    fadeTo(el, 0, 2000, () => { // 2-second fade-out
      el.pause();
      el.currentTime = 0;
      setIsPlaying(false);
    });
  }, []);

  // Switch track — if currently playing, crossfade seamlessly
  const setTrack = useCallback((id) => {
    setSelectedId(id);
    const el = elRef.current;
    if (!el || el.paused) return; // not playing — just update selection
    // Fade out current, then fade in new
    fadeTo(el, 0, 800, () => {
      el.pause();
      const track = tracks.find(t => t.id === id);
      if (!track) return;
      el.src = track.url;
      el.volume = 0;
      el.loop = loopMode;
      setAttribution(track.attribution || `${track.name} by ${track.artist}`);
      el.play()
        .then(() => {
          setIsLoading(false);
          fadeTo(el, volRef.current, 1500); // quick fade-in on switch
        })
        .catch(() => {});
    });
  }, [tracks, loopMode]); // eslint-disable-line

  const nextTrack = useCallback(() => {
    const currentIdx = tracks.findIndex(t => t.id === selectedId);
    if (currentIdx === -1) return;
    const nextIdx = (currentIdx + 1) % tracks.length;
    setTrack(tracks[nextIdx].id);
  }, [selectedId, tracks, setTrack]); // eslint-disable-line

  const prevTrack = useCallback(() => {
    const currentIdx = tracks.findIndex(t => t.id === selectedId);
    if (currentIdx === -1) return;
    const prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;
    setTrack(tracks[prevIdx].id);
  }, [selectedId, tracks, setTrack]); // eslint-disable-line

  const toggleLoop = useCallback(() => {
    const newLoop = !loopMode;
    setLoopModeState(newLoop);
    localStorage.setItem(PREF_LOOP_KEY, String(newLoop));
    if (elRef.current) elRef.current.loop = newLoop;
  }, [loopMode]);

  const toggleShuffle = useCallback(() => {
    const newShuffle = !shuffle;
    setShuffleState(newShuffle);
    localStorage.setItem(PREF_SHUFFLE_KEY, String(newShuffle));
    buildPlayQueue();
  }, [shuffle]);

  const saveFavourite = useCallback(() => {
    localStorage.setItem(PREF_TRACK_KEY, selectedId);
    setFavouriteId(selectedId);
  }, [selectedId]);

  const setVolume = useCallback((v) => {
    volRef.current = v;
    setVolumeState(v);
    localStorage.setItem(PREF_VOL_KEY, String(v));
    const el = elRef.current;
    if (el && !el.paused) el.volume = v;
  }, []);

  const cleanup = useCallback(() => {
    clearFade();
    if (elRef.current) {
      elRef.current.pause();
      elRef.current.src = '';
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Preload the selected track in the background so playback is instant
  useEffect(() => {
    const track = tracks.find(t => t.id === selectedId);
    if (!track) return;
    const el = elRef.current;
    if (!el || el.paused) getEl(track.url); // sets src & triggers browser preload
  }, [selectedId, tracks]); // eslint-disable-line

  return {
    tracks, selectedId, setTrack,
    favouriteId, saveFavourite,
    volume, setVolume,
    isPlaying, isLoading,
    loopMode, toggleLoop,
    shuffle, toggleShuffle,
    play, stop, cleanup,
    nextTrack, prevTrack,
    attribution,
  };
}

// ─── MusicSelector ────────────────────────────────────────────────────────────

function MusicSelector({ music }) {
  const track = music.tracks.find(t => t.id === music.selectedId);
  const isFav = music.favouriteId === music.selectedId;

  return (
    <div className="w-full space-y-2">
      {/* Current track info + playback controls */}
      {track && (
        <div className="bg-grey-100 rounded-[8px] p-3 space-y-2.5">
          {/* Track display */}
          <div className="flex items-start gap-2.5">
            {music.isLoading ? (
              <div className="w-3 h-3 rounded-full border-2 border-brazil-green border-t-transparent animate-spin flex-shrink-0 mt-0.5" />
            ) : music.isPlaying ? (
              <span className="flex items-end gap-[2px] h-3 flex-shrink-0">
                {[1,2,3].map(i => (
                  <span key={i} className="w-1 bg-brazil-green rounded-full animate-pulse"
                    style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            ) : (
              <Music className="w-3 h-3 text-grey-100 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">{track.name}</p>
              <p className="text-xs text-grey-200 truncate">by {track.artist}</p>
              {music.attribution && (
                <p className="text-[11px] text-grey-100 truncate mt-0.5">🎵 {music.attribution}</p>
              )}
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <Volume1 className="w-3.5 h-3.5 text-grey-200 flex-shrink-0" />
            <input
              type="range" min="0" max="1" step="0.05"
              value={music.volume}
              onChange={e => music.setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 accent-brazil-green cursor-pointer"
              title="Music volume"
            />
            <span className="text-[10px] text-grey-200 w-6 text-right flex-shrink-0">{Math.round(music.volume * 100)}%</span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-2.5">
            {/* Previous */}
            <button
              onClick={music.prevTrack}
              title="Previous track"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-grey-100 hover:bg-white/15 text-black transition-all active:scale-95"
            >
              <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={music.isPlaying ? music.stop : music.play}
              title={music.isPlaying ? 'Pause' : 'Play'}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-brazil-green hover:bg-brazil-green-dark text-black transition-all active:scale-95"
            >
              {music.isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={music.nextTrack}
              title="Next track"
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-grey-100 hover:bg-white/15 text-black transition-all active:scale-95"
            >
              <ChevronDown className="w-4 h-4 rotate-[90deg]" />
            </button>

            {/* Loop toggle */}
            <button
              onClick={music.toggleLoop}
              title={music.loopMode ? 'Loop enabled' : 'Loop disabled'}
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all active:scale-95 text-xs font-bold ${
                music.loopMode
                  ? 'bg-brazil-green/30 text-brazil-green'
                  : 'bg-grey-100 text-grey-100 hover:bg-white/15'
              }`}
            >
              🔁
            </button>

            {/* Shuffle toggle */}
            <button
              onClick={music.toggleShuffle}
              title={music.shuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all active:scale-95 text-xs font-bold ${
                music.shuffle
                  ? 'bg-brazil-green/30 text-brazil-green'
                  : 'bg-grey-100 text-grey-100 hover:bg-white/15'
              }`}
            >
              🔀
            </button>

            {/* Favourite */}
            <button
              onClick={music.saveFavourite}
              title={isFav ? 'Saved' : 'Save favourite'}
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all active:scale-95 ${
                isFav ? 'text-brazil-yellow' : 'text-grey-100 hover:text-grey-200'
              }`}
            >
              {isFav ? '♥' : '♡'}
            </button>
          </div>
        </div>
      )}

      {/* Scrollable track buttons */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {music.tracks.slice(0, 12).map(t => {
          const sel = music.selectedId === t.id;
          const fav = music.favouriteId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => music.setTrack(t.id)}
              className={`relative flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-[8px] transition-all w-[62px] ${
                sel
                  ? 'bg-brazil-green/25 border border-brazil-green/50 text-brazil-green'
                  : 'bg-grey-100 border border-transparent text-grey-200 hover:bg-white/14'
              }`}
              title={t.name}
            >
              {fav && (
                <span className="absolute top-0.5 right-1 text-brazil-yellow leading-none" style={{ fontSize: 8 }}>♥</span>
              )}
              <span className="text-lg leading-none">🎵</span>
              <span className="text-[9px] font-medium text-center leading-tight">{t.name.slice(0, 10)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── AudioControls — voice preference + TTS volume + ambient ────────────────

function AudioControls({ audio, onAmbientChange }) {
  return (
    <div className="w-full space-y-2">
      {/* Voice preference: Female (Rachel) / Male (Adam) */}
      <div className="flex items-center gap-1.5">
        {Object.entries(EL_VOICES).map(([key, voice]) => (
          <button
            key={key}
            onClick={() => audio.setVoicePref(key)}
            className={`flex-1 py-1.5 rounded-[8px] text-[10px] font-medium transition-all ${
              audio.voicePref === key
                ? 'bg-white/18 text-black border border-white/25'
                : 'bg-grey-100 text-grey-100 hover:bg-white/12 border border-transparent'
            }`}
          >
            {voice.label}
          </button>
        ))}
        {audio.ttsLoading && (
          <div className="flex items-center gap-1 text-[9px] text-grey-100 flex-shrink-0 pl-1">
            <div className="w-2 h-2 rounded-full border border-white/30 border-t-transparent animate-spin" />
            <span>loading</span>
          </div>
        )}
      </div>

      {/* Voice volume + mute */}
      <div className="flex items-center gap-2">
        <button onClick={audio.toggleMute}
          className="p-1.5 rounded-lg bg-grey-100 hover:bg-white/18 transition-all flex-shrink-0"
          title={audio.muted ? 'Unmute voice' : 'Mute voice'}>
          {audio.muted
            ? <VolumeX  className="w-4 h-4 text-red-400" />
            : audio.volume < 0.45
              ? <Volume1 className="w-4 h-4 text-grey-200" />
              : <Volume2 className="w-4 h-4 text-grey-200" />}
        </button>
        <input type="range" min="0" max="1" step="0.05"
          value={audio.volume}
          onChange={e => audio.setVolume(parseFloat(e.target.value))}
          disabled={audio.muted}
          className={`flex-1 h-1.5 accent-brazil-green cursor-pointer ${audio.muted ? 'opacity-30' : ''}`}
          title="Voice volume" />
        <span className="text-[10px] text-grey-100 w-6 text-right tabular-nums">
          {audio.muted ? '—' : Math.round(audio.volume * 100)}
        </span>
      </div>

      {/* Ambient selector */}
      <div className="flex gap-1.5">
        {AMBIENT_OPTIONS.map(({ key, label, emoji }) => (
          <button key={key} onClick={() => onAmbientChange(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[8px] text-[10px] font-medium transition-all ${
              audio.ambient === key
                ? 'bg-white/18 text-black border border-white/25'
                : 'bg-grey-100 text-grey-100 hover:bg-white/12 border border-transparent'
            }`}>
            <span>{emoji}</span><span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-widest text-grey-200 text-center mb-1.5">{children}</p>
  );
}

// ─── Mindfulness Player ──────────────────────────────────────────────────────

function MindfulnessPlayer({ session, onClose, clientGender }) {
  const [elapsed,  setElapsed]  = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [fadeIn,   setFadeIn]   = useState(false);
  const intervalRef = useRef(null);
  const prevStepRef = useRef(-1);

  const music = useMusicPlayer();
  const chime = useChimeSound();

  let parsed;
  try { parsed = JSON.parse(session.content); } catch { parsed = {}; }
  const steps       = Array.isArray(parsed) ? parsed : (parsed.steps || []);
  const totalSecs   = (session.duration_minutes || 5) * 60;
  const secPerStep  = steps.length > 0 ? Math.floor(totalSecs / steps.length) : totalSecs;

  const isDone         = elapsed >= totalSecs;
  const progressPct    = Math.min((elapsed / totalSecs) * 100, 100);
  const currentStepIdx = Math.min(Math.floor(elapsed / secPerStep), steps.length - 1);
  const remaining      = totalSecs - elapsed;

  // Timer
  useEffect(() => {
    if (isActive && !isDone) {
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isDone]);

  // Play chime + fade text when step advances
  useEffect(() => {
    if (!isActive || isDone || steps.length === 0) return;
    if (currentStepIdx !== prevStepRef.current) {
      prevStepRef.current = currentStepIdx;
      setFadeIn(false);
      setTimeout(() => setFadeIn(true), 100);
      chime.playChime();
    }
  }, [currentStepIdx, isActive, isDone]); // eslint-disable-line

  // Completion
  useEffect(() => {
    if (!isDone) return;
    music.stop();
    setTimeout(() => chime.playChime(), 300);
  }, [isDone]); // eslint-disable-line

  useEffect(() => () => { music.cleanup(); }, []); // eslint-disable-line

  const toggle = () => {
    if (isDone) return;
    const starting = !isActive;
    setIsActive(starting);
    if (starting) {
      music.play();
      chime.playChime();
      setFadeIn(true);
    }
  };

  const handleClose = () => { music.stop(); setTimeout(music.cleanup, 2200); onClose(); };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const circ = 2 * Math.PI * 44;

  return (
    <div className="fixed inset-0 z-50 bg-white/97 flex flex-col items-center px-5 pt-10 pb-5 safe-top safe-bottom overflow-y-auto">
      <button onClick={handleClose} className="absolute top-5 right-5 p-2 rounded-full bg-grey-100 hover:bg-white/20 transition-all">
        <X className="w-5 h-5 text-grey-200" />
      </button>

      <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">Mindfulness Session</p>
      <h2 className="text-xl font-bold text-center mb-6">{session.title}</h2>

      {/* ── Music selector ── */}
      <div className="w-full max-w-xs mb-6">
        <SectionLabel>Background Music</SectionLabel>
        <MusicSelector music={music} />
      </div>

      {/* Ring timer */}
      <div className="relative w-40 h-40 mb-8 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle cx="50" cy="50" r="44" fill="none"
            stroke="#9333ea" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progressPct / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-black">{fmt(remaining)}</p>
          <p className="text-xs text-grey-100">{session.duration_minutes} min</p>
        </div>
      </div>

      {/* Beautiful instruction text with fade animation */}
      <div className="flex flex-col items-center text-center max-w-2xl min-h-[120px] mb-8">
        {isDone ? (
          <div className={`transition-all duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-green-400 mb-2">Session Complete</p>
            <p className="text-base text-grey-200">Take a moment to notice how you feel.</p>
          </div>
        ) : steps.length > 0 ? (
          <div className={`transition-all duration-1000 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <p className="text-[13px] text-grey-200 mb-3 font-semibold uppercase tracking-wide">
              Step {currentStepIdx + 1} of {steps.length}
            </p>
            <p className="text-3xl font-light leading-relaxed text-black mb-2 tracking-wide">
              {steps[currentStepIdx]}
            </p>
            <div className="flex gap-1.5 justify-center mt-3">
              {[...Array(steps.length)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentStepIdx ? 'bg-purple-400 w-6' : 'bg-white/20 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-grey-200 text-lg italic">Follow your breath and stay present.</div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        {!isDone && (
          <button onClick={toggle} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : elapsed === 0 ? 'Begin' : 'Resume'}
          </button>
        )}
        <button onClick={handleClose} className={`btn-secondary px-5 ${isDone ? 'flex-1' : ''}`}>
          {isDone ? 'Finish' : 'End'}
        </button>
      </div>
    </div>
  );
}

// ─── Breathing Player ─────────────────────────────────────────────────────────

function BreathingPlayer({ exercise, onClose, clientGender }) {
  const [elapsed,  setElapsed]  = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef  = useRef(null);
  const prevPhaseRef = useRef('');

  const music = useMusicPlayer();
  const chime = useChimeSound();

  let parsed;
  try { parsed = JSON.parse(exercise.content); } catch { parsed = {}; }
  const pattern     = parsed.pattern || { inhale: 4, hold_in: 0, exhale: 4, hold_out: 0 };
  const totalRounds = parsed.rounds   || 6;
  const cues        = parsed.cues     || [];

  const cycleDur  = (pattern.inhale||0)+(pattern.hold_in||0)+(pattern.exhale||0)+(pattern.hold_out||0);
  const totalDur  = cycleDur * totalRounds;
  const isDone    = elapsed >= totalDur;
  const round     = Math.min(Math.floor(elapsed / cycleDur) + 1, totalRounds);

  const getPhase = (t) => {
    const pos = t % cycleDur;
    const i = pattern.inhale  || 0;
    const h = pattern.hold_in || 0;
    const e = pattern.exhale  || 0;
    if (pos < i)         return { label: 'Breathe in',  rem: i - pos,          scale: 1.35 };
    if (pos < i + h)     return { label: 'Hold',        rem: i + h - pos,      scale: 1.35 };
    if (pos < i + h + e) return { label: 'Breathe out', rem: i + h + e - pos,  scale: 1.0  };
    return                      { label: 'Hold',        rem: cycleDur - pos,   scale: 1.0  };
  };

  const phase = isDone ? { label: '✓', rem: 0, scale: 1.0 } : getPhase(elapsed);

  // Timer
  useEffect(() => {
    if (isActive && !isDone) {
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isDone]);

  // Play chime when phase changes
  useEffect(() => {
    if (!isActive || isDone || phase.label === '✓') return;
    if (phase.label !== prevPhaseRef.current) {
      prevPhaseRef.current = phase.label;
      chime.playChime();
    }
  }, [phase.label, isActive, isDone]); // eslint-disable-line

  // Completion
  useEffect(() => {
    if (!isDone) return;
    music.stop();
    setTimeout(() => chime.playChime(), 300);
  }, [isDone]); // eslint-disable-line

  useEffect(() => () => { music.cleanup(); }, []); // eslint-disable-line

  const toggle = () => {
    if (isDone) return;
    const starting = !isActive;
    setIsActive(starting);
    if (starting) {
      music.play();
      chime.playChime();
      const cur = getPhase(elapsed);
      prevPhaseRef.current = cur.label;
    }
  };

  const handleClose = () => { music.stop(); setTimeout(music.cleanup, 2200); onClose(); };

  const circleSize = 140 + (phase.scale - 1) * 120;
  const patternLabel = [
    pattern.inhale   && `${pattern.inhale}s inhale`,
    pattern.hold_in  && `${pattern.hold_in}s hold`,
    pattern.exhale   && `${pattern.exhale}s exhale`,
    pattern.hold_out && `${pattern.hold_out}s hold`,
  ].filter(Boolean).join(' · ');

  return (
    <div className="fixed inset-0 z-50 bg-white/97 flex flex-col items-center px-5 pt-10 pb-5 safe-top safe-bottom overflow-y-auto">
      <button onClick={handleClose} className="absolute top-5 right-5 p-2 rounded-full bg-grey-100 hover:bg-white/20 transition-all">
        <X className="w-5 h-5 text-grey-200" />
      </button>

      <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Breathing Exercise</p>
      <h2 className="text-xl font-bold text-center mb-1">{exercise.title}</h2>
      <p className="text-xs text-grey-100 mb-3">
        {isDone ? 'Complete!' : `Round ${round} of ${totalRounds}`}
      </p>

      {/* ── Music selector ── */}
      <div className="w-full max-w-xs mb-4">
        <SectionLabel>Background Music</SectionLabel>
        <MusicSelector music={music} />
      </div>

      {/* Animated breathing circle */}
      <div className="flex items-center justify-center my-2">
        <div
          className="rounded-full bg-blue-500/15 border-2 border-blue-400/40 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out"
          style={{ width: `${circleSize}px`, height: `${circleSize}px` }}
        >
          <p className="text-xl font-bold text-blue-300">{phase.label}</p>
          {isActive && !isDone && phase.rem > 0 && (
            <p className="text-4xl font-black text-black mt-1">{phase.rem}</p>
          )}
        </div>
      </div>

      {isDone ? (
        <div className="text-center my-4">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-400">Session Complete!</p>
          <p className="text-sm text-grey-200 mt-1">Notice how you feel right now.</p>
        </div>
      ) : (
        <p className="text-xs text-grey-100 mt-2 mb-4">{patternLabel}</p>
      )}

      {/* Action buttons */}
      {!isDone && (
        <button onClick={toggle} className="btn-primary px-10 flex items-center gap-2 mb-2.5 w-full max-w-xs justify-center">
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Pause' : elapsed === 0 ? 'Start' : 'Resume'}
        </button>
      )}
      <button onClick={handleClose} className="btn-secondary px-8 w-full max-w-xs">
        {isDone ? 'Finish' : 'End Session'}
      </button>

      {cues.length > 0 && !isActive && elapsed === 0 && (
        <div className="mt-4 w-full max-w-xs space-y-1">
          {cues.map((cue, i) => (
            <p key={i} className="text-xs text-grey-200 text-center">{cue}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Expanded Detail ──────────────────────────────────────────────────────────

function ExpandedDetail({ item }) {
  let parsed;
  try { parsed = JSON.parse(item.content); } catch { parsed = null; }

  if (item.type === 'rest_day') {
    const exercises = parsed?.exercises || (Array.isArray(parsed) ? parsed : []);
    return (
      <div className="mt-3 pt-3 border-t border-grey-100 space-y-3">
        {exercises.map((ex, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-green-400 mt-0.5">{i + 1}</div>
            <div>
              <p className="text-sm font-semibold">{ex.name}</p>
              {ex.duration    && <p className="text-xs text-grey-200 mt-0.5">{ex.duration}</p>}
              {ex.instruction && <p className="text-xs text-grey-200 mt-1 leading-relaxed">{ex.instruction}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sections  = parsed?.sections   || [];
  const body      = parsed?.body        || (Array.isArray(parsed) ? parsed : []);
  const keyPoints = parsed?.key_points  || [];

  return (
    <div className="mt-3 pt-3 border-t border-grey-100 space-y-3">
      {sections.map((s, i) => (
        <div key={i}>
          {s.heading && <p className="text-sm font-semibold mb-1">{s.heading}</p>}
          <p className="text-xs text-grey-200 leading-relaxed">{s.body}</p>
        </div>
      ))}
      {body.map((para, i) => <p key={i} className="text-xs text-grey-200 leading-relaxed">{para}</p>)}
      {keyPoints.length > 0 && (
        <div className="mt-2 p-3 bg-grey-100 rounded-[8px]">
          <p className="text-xs font-semibold text-black mb-2">Key Takeaways</p>
          <ul className="space-y-1.5">
            {keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-grey-200">
                <span className="text-brazil-green mt-0.5 flex-shrink-0">›</span>{kp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Content Card ─────────────────────────────────────────────────────────────

function ContentCard({ item, tab, expanded, onToggleExpand, onStart }) {
  const typeInfo      = TYPES.find(t => t.key === tab);
  const Icon          = typeInfo?.icon || Brain;
  const isInteractive = tab === 'mindfulness' || tab === 'breathing';

  return (
    <div className="bg-white border-l-4 border-brazil-green rounded-lg p-5 shadow-sm shadow-grey-200/40">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${typeInfo?.bg} flex-shrink-0 mt-0.5`}>
          <Icon className={`w-5 h-5 ${typeInfo?.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-black text-base text-black leading-snug">{item.title}</p>
            {item.duration_minutes > 0 && (
              <span className="flex items-center gap-1 text-sm font-bold text-brazil-green flex-shrink-0">
                <Clock className="w-4 h-4" /> {item.duration_minutes}m
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-grey-200 leading-relaxed mb-3">{item.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {item.difficulty && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                item.difficulty === 'beginner'
                  ? 'bg-green-100 text-green-700'
                  : item.difficulty === 'intermediate'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
              </span>
            )}
            {item.subtype && item.subtype !== 'general' && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                item.subtype === 'pre-workout'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-grey-300 text-grey-200'
              } capitalize`}>
                {item.subtype.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {isInteractive ? (
          <button onClick={onStart} className="w-full bg-brazil-green text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Play className="w-4 h-4 fill-white" />
            {tab === 'breathing' ? 'Start Breathing Exercise' : 'Begin Session'}
          </button>
        ) : (
          <>
            <button onClick={onToggleExpand}
              className="w-full flex items-center justify-between text-xs font-medium text-grey-200 hover:text-black transition-colors py-2">
              <span>{expanded ? 'Hide details' : 'View details'}</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded && <ExpandedDetail item={item} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Pro Gate Banner ──────────────────────────────────────────────────────────

function ProGateBanner({ onUpgrade, typeKey }) {
  const typeInfo = TYPES.find(t => t.key === typeKey);
  return (
    <div className="card-dark border border-brazil-yellow/20 text-center py-8 px-4">
      <div className={`w-14 h-14 ${typeInfo?.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
        <Crown className="w-7 h-7 text-brazil-yellow" />
      </div>
      <p className="font-bold text-base mb-1">Unlock the Full Library</p>
      <p className="text-xs text-grey-200 leading-relaxed mb-5 max-w-xs mx-auto">
        Get unlimited access to all {typeInfo?.label?.toLowerCase()} sessions, guided exercises, and more with BrazilFit Pro.
      </p>
      <button onClick={onUpgrade} className="btn-primary flex items-center gap-2 mx-auto">
        <Crown className="w-4 h-4" /> Upgrade to Pro
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientWellness() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const isPro      = user?.isPro;

  const [tab,              setTab]              = useState('mindfulness');
  const [content,          setContent]          = useState([]);
  const [isLimited,        setIsLimited]        = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [expanded,         setExpanded]         = useState(null);
  const [activeSession,    setActiveSession]    = useState(null);
  const [breathingSession, setBreathingSession] = useState(null);

  useEffect(() => {
    api.get('/wellness/mind')
      .then(res => {
        if (res.data.isLimited) { setContent(res.data.preview); setIsLimited(true); }
        else                    { setContent(res.data);          setIsLimited(false); }
      })
      .catch(() => toast.error('Failed to load wellness content'))
      .finally(() => setLoading(false));
  }, []);

  const tabContent  = content.filter(c => c.type === tab);
  const sectionInfo = SECTION_INFO[tab];

  const handleStart = (item) => {
    if (item.type === 'breathing') setBreathingSession(item);
    else setActiveSession(item);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Hero image with green gradient overlay */}
      <div
        className="w-full h-48 mb-6 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/images/newcastle-113.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay 55% */}
        <div className="absolute inset-0 bg-black/55" />
        {/* Green gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(39, 174, 96, 0.08) 100%)'
          }}
        />
      </div>

      <div className="px-4 py-4">
        {/* Header */}
        <BackButton to="/client/home" />
        <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-3xl font-black text-black">Mind & Wellness</h1>
          <p className="text-grey-200 text-base font-bold">Mental performance & recovery</p>
        </div>
        {isPro ? (
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-black" style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
          }}><Crown className="w-4 h-4" /> Pro</span>
        ) : (
          <button onClick={() => navigate('/client/upgrade')}
            className="flex items-center gap-1 text-xs text-brazil-yellow border border-brazil-yellow/30 px-3 py-1.5 rounded-full hover:bg-brazil-yellow/10 transition-all">
            <Crown className="w-3 h-3" /> Upgrade
          </button>
        )}
      </div>

      {/* Type tabs - Premium category filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 mb-4">
        {TYPES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setTab(key); setExpanded(null); }}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              tab === key
                ? 'bg-brazil-green text-white shadow-lg shadow-brazil-green/40'
                : 'bg-white text-grey-200 border border-grey-100 hover:text-black'
            }`}>
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Section banner */}
      {sectionInfo && (
        <div className="flex items-center gap-3 px-4 py-3 bg-grey-100 rounded-[12px] mb-4">
          <span className="text-2xl flex-shrink-0">{sectionInfo.emoji}</span>
          <p className="text-xs text-grey-200 leading-relaxed">{sectionInfo.text}</p>
        </div>
      )}

      {/* Free preview hint */}
      {!isPro && isLimited && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-brazil-yellow/10 border border-brazil-yellow/20 rounded-[8px]">
          <Crown className="w-4 h-4 text-brazil-yellow flex-shrink-0" />
          <p className="text-xs text-brazil-yellow/90">
            Showing 1 preview per section.{' '}
            <button onClick={() => navigate('/client/upgrade')} className="underline font-semibold">Upgrade to Pro</button>
            {' '}for the full library.
          </p>
        </div>
      )}

      {/* Content list */}
      {tabContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-grey-100 text-sm">No content available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tabContent.map(item => (
            <ContentCard key={item.id} item={item} tab={tab}
              expanded={expanded === item.id}
              onToggleExpand={() => setExpanded(expanded === item.id ? null : item.id)}
              onStart={() => handleStart(item)} />
          ))}
          {isLimited && <ProGateBanner onUpgrade={() => navigate('/client/upgrade')} typeKey={tab} />}
        </div>
      )}
      </div>

      {/* Players */}
      {activeSession    && <MindfulnessPlayer session={activeSession}     onClose={() => setActiveSession(null)}     clientGender={user?.gender} />}
      {breathingSession && <BreathingPlayer   exercise={breathingSession} onClose={() => setBreathingSession(null)}  clientGender={user?.gender} />}
    </div>
  );
}
