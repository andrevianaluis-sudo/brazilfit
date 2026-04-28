# BrazilFit Video Optimization System

## Overview

The BrazilFit video optimization system automatically processes uploaded videos into multiple quality versions optimized for different network conditions. This ensures smooth playback on all devices while minimizing data usage for mobile users.

## Features

### 1. **Automatic Video Processing**
- Converts all uploaded videos to MP4 H.264 codec (compatible with iOS, Android, web browsers)
- Creates two optimized versions:
  - **1080p**: High-quality version for WiFi users (5000kbps bitrate)
  - **720p**: Data-efficient version for mobile data users (2500kbps bitrate)
- Processes videos asynchronously without blocking uploads
- Generates thumbnail image from first frame automatically

### 2. **Adaptive Quality Selection**
- Detects client's network connection type using Network Information API
- Automatically serves appropriate version:
  - **WiFi (4G)**: Streams 1080p high-quality video
  - **Mobile Data (3G/2G)**: Streams 720p to conserve bandwidth
- Allows manual quality override via settings button
- Shows file size for each quality option

### 3. **Progressive Processing Status**
- Upload form shows real-time progress bar during file transfer
- Processing status displayed as:
  - 🔄 "Processing" - Video being compressed
  - ✅ "Ready" - Video versions completed
  - ❌ "Failed" - Processing error (rare)
- Media Manager shows processing status with badges

### 4. **Video Streaming Capabilities**
- Supports HTTP range requests for seeking without buffering entire file
- Smart streaming starts from appropriate quality
- Can switch quality mid-playback
- Includes audio codec optimization (AAC 128kbps)

## Technical Implementation

### Backend Architecture

#### New Tables (SQLite)
```sql
video_versions
├── id (Primary Key)
├── media_id (Foreign Key → pt_media)
├── resolution ('1080p' or '720p')
├── file_path
├── file_size
├── duration_seconds
├── codec ('h264')
└── created_at

pt_media (Enhanced with)
├── thumbnail_path
├── processing_status ('processing', 'completed', 'failed')
├── has_720p_version (boolean)
├── has_1080p_version (boolean)
└── duration_seconds
```

#### Video Processing Service (`/src/services/videoProcessor.js`)

**Main Functions:**

1. **`processVideo(inputPath, options)`**
   - Analyzes video metadata
   - Generates thumbnail from first frame
   - Encodes 1080p version (5000kbps)
   - Encodes 720p version (2500kbps)
   - Returns duration and file information
   - Async processing with progress callbacks

2. **`encodeVideo(inputPath, outputPath, resolution, duration, onProgress)`**
   - H.264 codec with libx264
   - CRF 23 quality (good balance between quality and file size)
   - Preset: medium (balanced speed/quality)
   - Auto-aspect ratio detection
   - AAC audio codec (128kbps)
   - +faststart flag for streaming optimization

3. **`getVideoInfo(inputPath)`**
   - Extracts video metadata
   - Returns: duration, width, height, bitrate, codec, fps, hasAudio

#### Enhanced Media Routes (`/src/routes/media.js`)

**New Endpoints:**

```
POST /api/media/upload
├── Returns immediately with processing status
├── Processes video asynchronously
├── Stores versions in video_versions table
└── Updates media record with completion status

GET /api/media/serve/:id?resolution=1080p
├── Auto-detects best resolution from query param
├── Supports HTTP range requests
├── Sets proper Cache-Control headers
└── Returns 206 Partial Content for range requests

GET /api/media/:id/versions
├── Lists all available video versions
├── Returns: resolution, file_size, duration_seconds
└── Used by frontend for quality selector

GET /api/media/:id/thumbnail
├── Serves auto-generated thumbnail image
└── Cached indefinitely (never changes)
```

### Frontend Implementation

#### Enhanced Media Manager (`/src/pages/pt/PTMediaManager.jsx`)

**Features:**
- **Upload specifications guide** showing format/size requirements for each category
- **Real-time progress bar** during file transfer (0-90%)
- **Processing indicator** showing "Uploading..." then "Processing..." phases
- **Status polling** checks processing completion every 1 second
- **Auto-refresh** media list when processing completes
- **Video badges** showing available resolutions (1080p, 720p)
- **Failure handling** with user-friendly error messages

**Upload Flow:**
```
1. User selects file and uploads
2. Progress bar shows upload progress (simulated 0-90%)
3. Server responds immediately with mediaId and "processing" status
4. Frontend polls /api/media/:id for processing completion
5. When completed, media list refreshes
6. Thumbnail appears in grid
7. Resolution badges show available versions
```

#### Adaptive Video Player (`/src/components/CustomVideoPlayer.jsx`)

**Network Detection:**
- Uses `navigator.connection.effectiveType` API
- Maps: 4g → wifi, 3g/2g → mobile
- Displays network type indicator (📶 WiFi / 📱 Mobile Data)
- Updates dynamically if connection changes

**Quality Selection:**
- Auto-selects on load based on network type
- Manual override via quality settings menu
- Shows file size for each option
- Real-time quality switching supported

**Enhanced Controls:**
- Play/Pause with center button
- Volume/Mute
- Quality selector (dropdown)
- Fullscreen with fallback
- Progress seeking with range input
- Custom overlay design

#### Network Quality Hook (`/src/hooks/useNetworkQuality.js`)

```javascript
const quality = useNetworkQuality();
// Returns: 'wifi' or 'mobile'

const recommended = getRecommendedResolution(quality, versions);
// Auto-selects best resolution
```

## File Organization

```
backend/
├── src/
│   ├── services/
│   │   └── videoProcessor.js (FFmpeg wrapper)
│   └── routes/
│       └── media.js (enhanced with video processing)
├── uploads/
│   ├── *.mp4 (original files - deleted after processing)
│   ├── *-1080p-*.mp4 (high quality versions)
│   ├── *-720p-*.mp4 (mobile quality versions)
│   ├── thumb-*.jpg (auto-generated thumbnails)
│   └── *.webp (optimized photos)
└── package.json (includes ffmpeg-static)

frontend/
├── src/
│   ├── components/
│   │   └── CustomVideoPlayer.jsx (adaptive quality)
│   ├── pages/
│   │   └── pt/
│   │       └── PTMediaManager.jsx (enhanced UI)
│   └── hooks/
│       └── useNetworkQuality.js (network detection)
```

## Dependencies

### Backend
- **ffmpeg-static** (^5.2.0) - Provides FFmpeg binary
- **fluent-ffmpeg** (^2.1.3) - Node wrapper for FFmpeg
- **sharp** (^0.33.0) - Image optimization for WebP
- **multer** (^1.4.4) - File upload handling

### Frontend
- **React** - Component framework
- **lucide-react** - Icons
- **Network Information API** - Browser native (no deps needed)

## Video Encoding Details

### H.264 Codec Specifications

**Why H.264?**
- Supported on iOS, Android, Chrome, Firefox, Safari, Edge
- Excellent quality-to-file-size ratio
- Hardware acceleration on most devices
- Industry standard for streaming

**Encoding Parameters:**
```
Codec: libx264 (H.264)
Preset: medium (balance speed/quality)
CRF: 23 (quality level, 0-51, lower=better)
Bitrate: 
  - 1080p: 5000kbps (optimal for WiFi)
  - 720p: 2500kbps (optimal for mobile)
Audio: AAC 128kbps (standard for streaming)
Scaling: Maintain aspect ratio, pad to resolution
Streaming: +faststart flag (seek before download)
```

**Quality Expectations:**
- **1080p @ 5000kbps**: Near-lossless on full-size screens
- **720p @ 2500kbps**: Excellent quality on phone screens
- **File sizes**: ~30-40% of original for 1080p, ~15-20% for 720p

## Processing Times

Approximate processing time depends on video length and system specs:
- **1-minute video**: 30-60 seconds
- **5-minute video**: 2-3 minutes
- **10-minute video**: 4-6 minutes

(Times vary based on CPU, input codec, file format)

## Network Adapter Detection

The system uses the Network Information API which provides:
- Current effective connection type (4g, 3g, 2g, slow-4g)
- Effective bandwidth estimate (kb/s)
- Round-trip time estimate (ms)
- Downlink speed estimate
- Change events when connection type changes

**Browser Support:**
- Chrome/Edge: Full support
- Firefox: Limited support (effectiveType only)
- Safari: Limited support
- Fallback: Assumes high-quality (wifi) if API unavailable

## Error Handling

**Processing Failures:**
1. Video fails encoding → marked as 'failed' in database
2. User sees red badge in media manager
3. Can re-upload without issues

**Network Issues:**
1. Upload interrupted → resumable (depends on server)
2. Processing timeout → server retries automatically
3. Version unavailable → falls back to next best quality

**File Issues:**
1. Corrupted video → detailed error message
2. Unsupported format → rejected at upload
3. Missing thumbnail → uses fallback icon

## Performance Metrics

### Bandwidth Savings
- **Mobile users**: 40-50% smaller files (720p vs 1080p)
- **Network efficiency**: Automatic adaptation = happy users

### Storage Requirements
Per video:
- 1080p version: ~200MB (for 10-min 4K source)
- 720p version: ~100MB (half the size)
- Thumbnail: ~5KB
- **Total**: ~305MB per video

## Security Considerations

1. **File validation**
   - Whitelist: MP4, MOV, AVI, WebM only
   - Max size: 500MB
   - MIME type verification

2. **Access control**
   - Only PTs can upload
   - Only authenticated clients can download
   - Soft delete (never truly deleted)

3. **File serving**
   - 1-year cache headers
   - Range request support (prevents full-file caching)
   - Content-Type enforcement

## Future Enhancements

Potential improvements for future versions:
1. **HEVC/H.265** codec for even smaller 4K files
2. **HLS streaming** for true adaptive bitrate
3. **WebP video** for additional compression
4. **Thumbnail generation** at multiple timestamps
5. **Subtitle support** (SRT, VTT files)
6. **Video trimming** UI in media manager
7. **Batch processing** for multiple videos
8. **Video analytics** (view counts, seek patterns)

## Troubleshooting

### Video won't process
- Check server logs: `backend/brazilfit.db` → check `pt_media.processing_status`
- Verify FFmpeg installation: `ffmpeg -version`
- Check disk space: Need 2x video file size for processing

### Wrong quality served
- Check Network Information API availability
- Verify `video_versions` table has both resolutions
- Check browser's network throttling settings

### Thumbnail missing
- Re-upload video
- Check `pt_media.thumbnail_path` is not NULL
- Verify thumbnail file exists in uploads folder

### Progress bar stuck
- Check server processing logs
- Poll endpoint returning latest status
- May take several minutes for large videos

## API Examples

### Upload a video
```bash
curl -X POST http://localhost:3005/api/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@exercise.mp4" \
  -F "category=exercise_demo" \
  -F "description=Squat demonstration"
```

Response:
```json
{
  "id": 42,
  "file_name": "1708456789-abc123.mp4",
  "media_type": "video",
  "status": "processing",
  "message": "Video upload received. Processing optimized versions..."
}
```

### Check processing status
```bash
curl http://localhost:3005/api/media/42 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get available versions
```bash
curl http://localhost:3005/api/media/42/versions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "versions": [
    { "resolution": "1080p", "file_size": 209715200, "duration_seconds": 180 },
    { "resolution": "720p", "file_size": 104857600, "duration_seconds": 180 }
  ]
}
```

### Serve specific quality
```bash
curl http://localhost:3005/api/media/serve/42?resolution=720p \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output video-720p.mp4
```

## Monitoring and Logging

The system logs processing progress to console:
```
[Video Processing] Starting for media ID: 42
[Video Processing] 42: 25% complete
[Video Processing] 42: 50% complete
[Video Processing] 42: 100% complete
[Video Processing] Completed for media ID: 42
```

Check Node logs for any processing errors:
```
[Video Processing Error] Media ID 42: ENOENT: no such file...
```
