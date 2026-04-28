import { useEffect, useRef, useState, useCallback } from 'react';
import { Expand, Gauge, Loader } from 'lucide-react';

// Singleton YT API loader — handles multiple players on the same page
let ytApiPromise = null;
function loadYouTubeAPI() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
  return ytApiPromise;
}

/**
 * YouTubePlayer — high quality embedded player using the IFrame API.
 *
 * Props:
 *   videoId      — YouTube video ID
 *   autoplay     — boolean, defaults false
 *   showSlowMo   — boolean, show 0.5x slow-motion toggle
 *   className    — optional wrapper className
 *   onReady      — optional callback(player)
 */
export default function YouTubePlayer({ videoId, autoplay = false, showSlowMo = true, className = '', onReady }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [slowMo, setSlowMo] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const idRef = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    loadYouTubeAPI().then(() => setApiReady(true));
  }, []);

  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;
    setLoading(true);
    setSlowMo(false);

    // Destroy previous player if any
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }

    // Create a new div inside container for each instantiation (IFrame API needs a fresh element)
    const wrapper = containerRef.current;
    wrapper.innerHTML = '';
    const div = document.createElement('div');
    div.id = idRef.current + '-' + Date.now();
    wrapper.appendChild(div);

    playerRef.current = new window.YT.Player(div.id, {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3, // hide video annotations
        cc_load_policy: 0,
        fs: 1,             // allow fullscreen
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          setLoading(false);
          // Request highest available quality
          try {
            e.target.setPlaybackQuality('hd1080');
          } catch {}
          if (onReady) onReady(e.target);
        },
        onStateChange: () => {},
        onError: () => { setLoading(false); },
      },
    });

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [apiReady, videoId, autoplay]);

  const toggleSlowMo = useCallback(() => {
    if (!playerRef.current) return;
    const next = !slowMo;
    setSlowMo(next);
    try {
      playerRef.current.setPlaybackRate(next ? 0.5 : 1);
    } catch {}
  }, [slowMo]);

  const handleFullscreen = useCallback(() => {
    // Try to get the iframe inside the container and request fullscreen
    const iframe = containerRef.current?.querySelector('iframe');
    if (!iframe) return;
    const req = iframe.requestFullscreen || iframe.webkitRequestFullscreen || iframe.mozRequestFullScreen;
    if (req) req.call(iframe);
  }, []);

  return (
    <div className={`relative rounded-[8px] overflow-hidden bg-white ${className}`} style={{ aspectRatio: '16/9' }}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-grey-1000 z-10">
          <Loader className="w-8 h-8 text-brazil-green animate-spin" />
        </div>
      )}

      {/* YT player container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Controls overlay — bottom right */}
      {!loading && (
        <div className="absolute bottom-2 right-2 flex gap-1.5 z-20 pointer-events-none">
          {showSlowMo && (
            <button
              onClick={toggleSlowMo}
              className={`pointer-events-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold backdrop-blur-sm transition-all shadow-lg ${
                slowMo
                  ? 'bg-brazil-yellow text-black'
                  : 'bg-white/60 text-black hover:bg-grey-1000'
              }`}
              title={slowMo ? 'Normal speed' : 'Slow motion (0.5×)'}
            >
              <Gauge className="w-3 h-3" />
              {slowMo ? '0.5×' : '1×'}
            </button>
          )}
          <button
            onClick={handleFullscreen}
            className="pointer-events-auto flex items-center justify-center w-8 h-8 rounded-lg bg-white/60 hover:bg-grey-1000 text-black backdrop-blur-sm shadow-lg transition-all"
            title="Fullscreen"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * YouTubeThumbnail — lazy-loaded thumbnail that expands to the full player on click.
 * Uses high-res (maxresdefault) thumbnail.
 */
export function YouTubeThumbnail({ videoId, name, autoplayOnOpen = false, showSlowMo = true, className = '' }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!videoId) return null;

  // YouTube thumbnail quality cascade: maxresdefault (1280×720) → hqdefault (480×360)
  const thumbSrc = imgError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (open) {
    return (
      <div className={`relative rounded-[8px] overflow-hidden ${className}`}>
        <YouTubePlayer videoId={videoId} autoplay={autoplayOnOpen} showSlowMo={showSlowMo} />
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className={`relative w-full group rounded-[8px] overflow-hidden focus:outline-none ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      <img
        src={thumbSrc}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-brazil-green/90 group-hover:bg-brazil-green group-hover:scale-110 transition-all flex items-center justify-center shadow-2xl">
          <svg className="w-6 h-6 text-black fill-white ml-1" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      {/* Bottom label */}
      {name && (
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-left">
          <p className="text-xs text-grey-200 font-medium truncate drop-shadow">{name}</p>
          <p className="text-[10px] text-grey-200">Tap to watch demo</p>
        </div>
      )}
    </button>
  );
}
