import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

// Detect network connection type
function getNetworkQuality() {
  if (navigator.connection) {
    const conn = navigator.connection;
    const effectiveType = conn.effectiveType;

    // 4g, 3g, 2g, or slow-4g
    switch (effectiveType) {
      case '4g':
        return 'wifi'; // Assume 4g is wifi-like
      case '3g':
        return 'mobile';
      default:
        return 'mobile';
    }
  }

  // Fallback: assume high quality
  return 'wifi';
}

export default function CustomVideoPlayer({
  videoUrl,
  mediaId,
  posterUrl,
  isPlaceholder = false,
  title = 'Video',
  onClose = null
}) {
  const [isPlaying, setIsPlaying] = useState(!isPlaceholder);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [networkType, setNetworkType] = useState('wifi');
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Detect network type and available qualities on mount
  useEffect(() => {
    if (!isPlaceholder && mediaId) {
      const type = getNetworkQuality();
      setNetworkType(type);

      // Fetch available video versions
      fetch(`/api/media/${mediaId}/versions`)
        .then(res => res.ok ? res.json() : { versions: [] })
        .then(data => {
          const qualities = data.versions || [];
          setAvailableQualities(qualities);

          // Auto-select quality based on network
          if (qualities.length > 0) {
            const preferredResolution = type === 'wifi' ? '1080p' : '720p';
            const hasPreferred = qualities.find(q => q.resolution === preferredResolution);
            const quality = hasPreferred ? preferredResolution : qualities[0].resolution;
            setSelectedQuality(quality);
          }
        })
        .catch(err => console.error('Error fetching video versions:', err));
    }
  }, [isPlaceholder, mediaId]);

  // Get the actual video URL based on selected quality
  const getVideoUrl = () => {
    if (selectedQuality && mediaId) {
      return `${videoUrl}?resolution=${selectedQuality}`;
    }
    return videoUrl;
  };

  if (isPlaceholder) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden"
      >
        <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-6xl"></div>
          <p className="text-black text-xl font-semibold">{title}</p>
          <p className="text-grey-200 text-center px-4">Video coming soon  check back soon</p>
          <button
            disabled
            className="mt-4 bg-emerald-600 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2 opacity-50 cursor-not-allowed"
          >
            <Play size={20} />
            Play
          </button>
        </div>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        containerRef.current.requestFullscreen().catch(() => {
          // Fallback for browsers that don't support fullscreen
          containerRef.current.style.width = '100vw';
          containerRef.current.style.height = '100vh';
          setIsFullscreen(true);
        });
        setIsFullscreen(true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-white rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      <div className="relative aspect-video bg-white group">
        <video
          ref={videoRef}
          src={getVideoUrl()}
          poster={posterUrl}
          className="w-full h-full object-contain"
          onEnded={() => setIsPlaying(false)}
          controls={false}
        />

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
          {/* Top bar - title and network info */}
          <div className="p-4 flex items-center justify-between">
            <p className="text-black font-semibold">{title}</p>
            <div className="flex items-center gap-2 text-xs text-black">
              {networkType === 'wifi' ? ' WiFi' : ' Mobile Data'}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="p-4 space-y-3">
            {/* Progress bar */}
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = (e.target.value / 100) * videoRef.current.duration;
                }
              }}
              className="w-full h-1 bg-gray-600 rounded cursor-pointer accent-emerald-600"
            />

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="text-black hover:text-emerald-400 transition"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                  onClick={handleMute}
                  className="text-black hover:text-emerald-400 transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>

                {/* Quality selector */}
                {availableQualities.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="text-black hover:text-emerald-400 transition flex items-center gap-1 text-xs font-semibold"
                      title="Video quality"
                    >
                      <Settings size={20} />
                      {selectedQuality}
                    </button>

                    {showQualityMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden z-50">
                        {availableQualities.map(quality => (
                          <button
                            key={quality.resolution}
                            onClick={() => {
                              setSelectedQuality(quality.resolution);
                              setShowQualityMenu(false);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm transition ${
                              selectedQuality === quality.resolution
                                ? 'bg-emerald-600 text-white'
                                : 'text-black hover:bg-gray-100'
                            }`}
                          >
                            {quality.resolution}
                            <span className="text-xs text-grey-200 ml-2">
                              ({(quality.file_size / 1024 / 1024).toFixed(0)}MB)
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleFullscreen}
                className="text-black hover:text-emerald-400 transition"
                title="Fullscreen"
              >
                <Maximize size={24} />
              </button>
            </div>

            {/* Network info */}
            {availableQualities.length > 0 && (
              <div className="text-xs text-grey-200">
                {networkType === 'mobile' && selectedQuality === '720p' && ' Data-friendly quality selected'}
                {networkType === 'wifi' && selectedQuality === '1080p' && ' High quality available'}
              </div>
            )}
          </div>
        </div>

        {/* Center play button when paused */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-emerald-600 rounded-full p-6 hover:bg-emerald-500 transition">
              <Play size={48} className="text-black fill-white" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

