const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure ffmpeg binary is available
try {
  const ffmpegPath = require('ffmpeg-static');
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }
} catch (e) {
  console.warn('ffmpeg-static not found, relying on system ffmpeg');
}

const uploadDir = path.join(__dirname, '../../uploads');

/**
 * Process video file and create optimized versions
 * @param {string} inputPath - Full path to the input video file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Result with 1080p and 720p versions
 */
async function processVideo(inputPath, options = {}) {
  const { onProgress } = options;

  return new Promise(async (resolve, reject) => {
    try {
      // Get input video info
      ffmpeg.ffprobe(inputPath, async (err, metadata) => {
        if (err) {
          console.error('FFprobe error:', err);
          return reject(new Error('Failed to analyze video'));
        }

        const duration = metadata.format.duration || 0;
        const width = metadata.streams[0]?.width || 1920;
        const height = metadata.streams[0]?.height || 1080;

        const results = {
          duration,
          original: { width, height },
          versions: {},
          thumbnail: null
        };

        try {
          // Generate thumbnail from first frame
          const thumbnailPath = path.join(
            uploadDir,
            `thumb-${Date.now()}-${uuidv4()}.jpg`
          );

          await new Promise((thumbResolve, thumbReject) => {
            ffmpeg(inputPath)
              .screenshots({
                timestamps: ['1%'],
                filename: path.basename(thumbnailPath),
                folder: path.dirname(thumbnailPath),
                size: '320x180'
              })
              .on('error', thumbReject)
              .on('end', () => thumbResolve());
          });

          results.thumbnail = path.relative(uploadDir, thumbnailPath);
        } catch (err) {
          console.warn('Thumbnail generation failed:', err.message);
        }

        // Create 1080p version
        const v1080pPath = path.join(uploadDir, `${Date.now()}-1080p-${uuidv4()}.mp4`);
        await encodeVideo(inputPath, v1080pPath, '1080p', duration, onProgress);
        results.versions['1080p'] = {
          path: path.relative(uploadDir, v1080pPath),
          size: fs.statSync(v1080pPath).size
        };

        // Create 720p version
        const v720pPath = path.join(uploadDir, `${Date.now()}-720p-${uuidv4()}.mp4`);
        await encodeVideo(inputPath, v720pPath, '720p', duration, onProgress);
        results.versions['720p'] = {
          path: path.relative(uploadDir, v720pPath),
          size: fs.statSync(v720pPath).size
        };

        resolve(results);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Encode video to specific resolution using H.264 codec
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {string} resolution - '1080p' or '720p'
 * @param {number} duration - Video duration in seconds
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<void>}
 */
function encodeVideo(inputPath, outputPath, resolution, duration, onProgress) {
  return new Promise((resolve, reject) => {
    const resolutionMap = {
      '1080p': { scale: '1920:1080', bitrate: '5000k' },
      '720p': { scale: '1280:720', bitrate: '2500k' }
    };

    const config = resolutionMap[resolution] || resolutionMap['1080p'];

    let lastProgress = 0;

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',                    // H.264 codec
        '-preset medium',                  // Balance quality/speed (fast, medium, slow)
        '-crf 23',                         // Quality (0-51, lower=better, 23=default)
        `-vf scale=${config.scale}:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`,
        '-c:a aac',                        // Audio codec
        '-b:a 128k',                       // Audio bitrate
        '-movflags +faststart'             // Enable streaming
      ])
      .on('progress', (progress) => {
        if (duration > 0) {
          const percent = Math.round((progress.timemark.split(':').reduce((a, b) => 60 * a + +b) / duration) * 100);
          if (percent !== lastProgress) {
            lastProgress = percent;
            if (onProgress) onProgress(Math.min(percent, 100));
          }
        }
      })
      .on('error', (err) => {
        console.error(`FFmpeg error for ${resolution}:`, err);
        reject(new Error(`Failed to encode ${resolution} video: ${err.message}`));
      })
      .on('end', () => {
        resolve();
      })
      .save(outputPath);
  });
}

/**
 * Get video info (duration, resolution, etc)
 * @param {string} inputPath
 * @returns {Promise<Object>}
 */
function getVideoInfo(inputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const video = metadata.streams.find(s => s.codec_type === 'video') || {};
      const audio = metadata.streams.find(s => s.codec_type === 'audio') || {};

      resolve({
        duration: metadata.format.duration || 0,
        width: video.width,
        height: video.height,
        bitrate: video.bit_rate,
        codec: video.codec_name,
        fps: eval(video.r_frame_rate || '0'),
        hasAudio: !!audio.codec_name
      });
    });
  });
}

module.exports = {
  processVideo,
  encodeVideo,
  getVideoInfo
};
