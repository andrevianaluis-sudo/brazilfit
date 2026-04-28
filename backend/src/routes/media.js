const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { processVideo, getVideoInfo } = require('../services/videoProcessor');
const { authenticateToken, requirePT } = require('../middleware/auth');
const { getDb } = require('../db/database');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

// Helper: Check PT authorization
function isPT(req) {
  return req.user && req.user.role === 'pt';
}

// ── UPLOAD ENDPOINT WITH VIDEO OPTIMIZATION ────────────────────────────────

// POST /api/media/upload - Upload media file with video optimization
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!isPT(req)) {
    return res.status(403).json({ error: 'PT only' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { category, subCategory, description, altText } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'category required' });
  }

  const db = getDb();
  try {
    const originalPath = req.file.path;
    const fileName = req.file.filename;
    const isVideo = /video|mp4|mov|avi|webm/.test(req.file.mimetype);
    const isPhoto = /image/.test(req.file.mimetype);

    let optimizedPath = originalPath;
    let mimeType = req.file.mimetype;
    let metadata = {};
    let mediaId = null;

    // Create initial database entry with "processing" status for videos
    if (isVideo) {
      const result = db.prepare(`
        INSERT INTO pt_media (user_id, media_type, file_name, file_path, file_size, mime_type, category, sub_category, description, alt_text, processing_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        'video',
        fileName,
        originalPath.replace(uploadDir, '').slice(1),
        fs.statSync(originalPath).size,
        mimeType,
        category,
        subCategory || null,
        description || null,
        altText || null,
        'processing'
      );
      mediaId = result.lastInsertRowid;

      // Return immediate response with mediaId for progress tracking
      res.json({
        id: mediaId,
        file_name: fileName,
        media_type: 'video',
        status: 'processing',
        message: 'Video upload received. Processing optimized versions...'
      });

      // Process video asynchronously
      setImmediate(async () => {
        try {
          console.log(`[Video Processing] Starting for media ID: ${mediaId}`);

          // Process video (creates 1080p and 720p versions + thumbnail)
          const processResult = await processVideo(originalPath, {
            onProgress: (percent) => {
              console.log(`[Video Processing] ${mediaId}: ${percent}% complete`);
            }
          });

          // Store video versions in database
          const v1080p = processResult.versions['1080p'];
          const v720p = processResult.versions['720p'];

          if (v1080p) {
            db.prepare(`
              INSERT INTO video_versions (media_id, resolution, file_path, file_size, duration_seconds, codec)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(mediaId, '1080p', v1080p.path, v1080p.size, processResult.duration, 'h264');
          }

          if (v720p) {
            db.prepare(`
              INSERT INTO video_versions (media_id, resolution, file_path, file_size, duration_seconds, codec)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(mediaId, '720p', v720p.path, v720p.size, processResult.duration, 'h264');
          }

          // Update main media record with completion status
          db.prepare(`
            UPDATE pt_media
            SET
              duration_seconds = ?,
              thumbnail_path = ?,
              has_1080p_version = ?,
              has_720p_version = ?,
              processing_status = 'completed',
              updated_at = datetime('now')
            WHERE id = ?
          `).run(
            processResult.duration,
            processResult.thumbnail,
            v1080p ? 1 : 0,
            v720p ? 1 : 0,
            mediaId
          );

          // Delete original file to save space
          if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
          }

          console.log(`[Video Processing] Completed for media ID: ${mediaId}`);
        } catch (err) {
          console.error(`[Video Processing Error] Media ID ${mediaId}:`, err);
          // Mark as failed in database
          db.prepare(`
            UPDATE pt_media
            SET processing_status = 'failed'
            WHERE id = ?
          `).run(mediaId);
        }
      });

      return;
    }

    // Process images: convert to WebP
    if (isPhoto) {
      try {
        const image = sharp(originalPath);
        const imgMetadata = await image.metadata();
        metadata.width = imgMetadata.width;
        metadata.height = imgMetadata.height;

        // Convert to WebP and optimize
        const webpPath = originalPath.replace(/\.[^/.]+$/, '.webp');
        await image
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath);

        optimizedPath = webpPath;
        mimeType = 'image/webp';

        // Delete original
        if (fs.existsSync(originalPath) && originalPath !== webpPath) {
          fs.unlinkSync(originalPath);
        }
      } catch (err) {
        console.error('Image optimization error:', err);
        // Continue with original if optimization fails
      }
    }

    const fileSize = fs.statSync(optimizedPath).size;

    // Store media metadata in database
    const result = db.prepare(`
      INSERT INTO pt_media (user_id, media_type, file_name, file_path, file_size, mime_type, width, height, duration_seconds, category, sub_category, description, alt_text, processing_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      isVideo ? 'video' : 'photo',
      fileName,
      optimizedPath.replace(uploadDir, '').slice(1),
      fileSize,
      mimeType,
      metadata.width || null,
      metadata.height || null,
      null,
      category,
      subCategory || null,
      description || null,
      altText || null,
      'completed'
    );

    res.json({
      id: result.lastInsertRowid,
      file_name: fileName,
      media_type: isVideo ? 'video' : 'photo',
      file_size: fileSize,
      message: 'Media uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// ── MEDIA MANAGEMENT ENDPOINTS ──────────────────────────────────────────────

// GET /api/media/list - List all PT media
router.get('/list', authenticateToken, (req, res) => {
  if (!isPT(req)) {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const { type, category } = req.query;

  let query = 'SELECT * FROM pt_media WHERE user_id = ? AND deleted_at IS NULL';
  const params = [req.user.id];

  if (type) {
    query += ' AND media_type = ?';
    params.push(type);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  const media = db.prepare(query).all(...params);

  // Enrich video media with version info
  const enrichedMedia = media.map(m => {
    if (m.media_type === 'video') {
      const versions = db.prepare(`
        SELECT resolution, file_path, file_size
        FROM video_versions
        WHERE media_id = ?
      `).all(m.id);
      return { ...m, versions };
    }
    return m;
  });

  res.json({ media: enrichedMedia });
});

// GET /api/media/:id - Get single media details
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const media = db.prepare('SELECT * FROM pt_media WHERE id = ?').get(req.params.id);

  if (!media || media.deleted_at) {
    return res.status(404).json({ error: 'Media not found' });
  }

  // Check authorization for PT-only details
  if (!isPT(req) && media.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Include versions for videos
  let result = { media };
  if (media.media_type === 'video') {
    const versions = db.prepare(`
      SELECT resolution, file_path, file_size, duration_seconds
      FROM video_versions
      WHERE media_id = ?
    `).all(req.params.id);
    result.versions = versions;
  }

  res.json(result);
});

// PUT /api/media/:id - Update media metadata
router.put('/:id', authenticateToken, (req, res) => {
  if (!isPT(req)) {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const media = db.prepare('SELECT user_id FROM pt_media WHERE id = ?').get(req.params.id);

  if (!media || media.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Media not found' });
  }

  const { description, altText, subCategory } = req.body;

  try {
    db.prepare(`
      UPDATE pt_media
      SET description = ?, alt_text = ?, sub_category = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      description || null,
      altText || null,
      subCategory || null,
      req.params.id
    );

    res.json({ message: 'Media updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// DELETE /api/media/:id - Soft delete media
router.delete('/:id', authenticateToken, (req, res) => {
  if (!isPT(req)) {
    return res.status(403).json({ error: 'PT only' });
  }

  const db = getDb();
  const media = db.prepare('SELECT user_id FROM pt_media WHERE id = ?').get(req.params.id);

  if (!media || media.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Media not found' });
  }

  try {
    db.prepare('UPDATE pt_media SET deleted_at = datetime("now") WHERE id = ?').run(req.params.id);
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// ── ASSIGNMENT ENDPOINTS ────────────────────────────────────────────────────

// POST /api/media/assign - Assign media to feature
router.post('/assign', authenticateToken, (req, res) => {
  if (!isPT(req)) {
    return res.status(403).json({ error: 'PT only' });
  }

  const { mediaId, assignmentType } = req.body;
  if (!mediaId || !assignmentType) {
    return res.status(400).json({ error: 'mediaId and assignmentType required' });
  }

  const db = getDb();
  const media = db.prepare('SELECT user_id FROM pt_media WHERE id = ?').get(mediaId);

  if (!media || media.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Media not found' });
  }

  try {
    // Deactivate other assignments of same type
    db.prepare('UPDATE media_assignments SET is_active = 0 WHERE assignment_type = ?').run(assignmentType);

    // Create new assignment
    const result = db.prepare(`
      INSERT INTO media_assignments (media_id, assignment_type, is_active)
      VALUES (?, ?, 1)
    `).run(mediaId, assignmentType);

    res.json({ id: result.lastInsertRowid, message: 'Media assigned' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign media' });
  }
});

// GET /api/media/assignments - Get current assignments
router.get('/assignments/active', authenticateToken, (req, res) => {
  const db = getDb();
  const assignments = db.prepare(`
    SELECT ma.*, pm.file_path, pm.media_type, pm.width, pm.height
    FROM media_assignments ma
    JOIN pt_media pm ON pm.id = ma.media_id
    WHERE ma.is_active = 1
  `).all();

  res.json({ assignments });
});

// ── PUBLIC ENDPOINTS (for clients) ──────────────────────────────────────────

// GET /api/media/public/:category - Get currently active media for category
router.get('/public/:category', authenticateToken, (req, res) => {
  const db = getDb();
  const { category } = req.params;

  const media = db.prepare(`
    SELECT pm.* FROM pt_media pm
    JOIN media_assignments ma ON ma.media_id = pm.id
    WHERE ma.is_active = 1 AND ma.assignment_type LIKE ? AND pm.deleted_at IS NULL
  `).get(`${category}%`);

  if (!media) {
    return res.json({ media: null });
  }

  // Include versions for videos
  let result = { media };
  if (media.media_type === 'video') {
    const versions = db.prepare(`
      SELECT resolution, file_path, file_size
      FROM video_versions
      WHERE media_id = ?
    `).all(media.id);
    result.versions = versions;
  }

  res.json(result);
});

// GET /api/media/weekly/:type - Get this week's video (motivation, class)
router.get('/weekly/:type', authenticateToken, (req, res) => {
  const db = getDb();
  const now = new Date();
  const weekNumber = Math.ceil((now.getDate() - now.getDay() + 7) / 7);
  const year = now.getFullYear();

  const media = db.prepare(`
    SELECT pm.* FROM pt_media pm
    JOIN pt_weekly_media pwm ON pwm.media_id = pm.id
    WHERE pwm.content_type = ? AND pwm.week_number = ? AND pwm.year = ? AND pm.deleted_at IS NULL
  `).get(req.params.type, weekNumber, year);

  if (!media) {
    return res.json({ media: null });
  }

  // Include versions for videos
  let result = { media };
  if (media.media_type === 'video') {
    const versions = db.prepare(`
      SELECT resolution, file_path, file_size
      FROM video_versions
      WHERE media_id = ?
    `).all(media.id);
    result.versions = versions;
  }

  res.json(result);
});

// POST /api/media/:id/react - React to media (heart, etc)
router.post('/:id/react', authenticateToken, (req, res) => {
  const db = getDb();
  const { reactionType } = req.body;

  if (!reactionType) {
    return res.status(400).json({ error: 'reactionType required' });
  }

  const client = db.prepare('SELECT id FROM clients WHERE user_id = ?').get(req.user.id);
  if (!client) {
    return res.status(400).json({ error: 'Client not found' });
  }

  try {
    const existing = db.prepare(`
      SELECT id FROM media_reactions
      WHERE media_id = ? AND client_id = ? AND reaction_type = ?
    `).get(req.params.id, client.id, reactionType);

    if (existing) {
      // Remove reaction
      db.prepare(`
        DELETE FROM media_reactions
        WHERE media_id = ? AND client_id = ? AND reaction_type = ?
      `).run(req.params.id, client.id, reactionType);
      return res.json({ message: 'Reaction removed' });
    }

    // Add reaction
    db.prepare(`
      INSERT INTO media_reactions (media_id, client_id, reaction_type)
      VALUES (?, ?, ?)
    `).run(req.params.id, client.id, reactionType);

    res.json({ message: 'Reaction added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record reaction' });
  }
});

// GET /api/media/:id/reactions - Get reaction counts
router.get('/:id/reactions', authenticateToken, (req, res) => {
  const db = getDb();
  const reactions = db.prepare(`
    SELECT reaction_type, COUNT(*) as count
    FROM media_reactions
    WHERE media_id = ?
    GROUP BY reaction_type
  `).all(req.params.id);

  res.json({ reactions });
});

// ── FILE SERVING ENDPOINT WITH ADAPTIVE QUALITY ────────────────────────────

// GET /api/media/serve/:id - Serve media file (video quality auto-selects based on network)
router.get('/serve/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const media = db.prepare('SELECT * FROM pt_media WHERE id = ?').get(req.params.id);

  if (!media || media.deleted_at) {
    return res.status(404).json({ error: 'Media not found' });
  }

  // For videos, check if optimized versions exist
  if (media.media_type === 'video' && media.has_1080p_version) {
    // Detect network type from client header (if available)
    const preferredResolution = req.query.resolution || '1080p';

    const version = db.prepare(`
      SELECT * FROM video_versions
      WHERE media_id = ? AND resolution = ?
    `).get(req.params.id, preferredResolution);

    if (version) {
      const filePath = path.join(__dirname, '../../uploads', version.file_path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set appropriate headers
      res.set({
        'Cache-Control': 'public, max-age=31536000',
        'Content-Type': 'video/mp4',
        'Content-Length': version.file_size
      });

      // Support range requests for video streaming
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        res.status(206);
        res.set({
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1
        });

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.sendFile(filePath);
      }
      return;
    }
  }

  // Fallback: serve original file
  const filePath = path.join(__dirname, '../../uploads', media.file_path);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Set appropriate headers
  res.set({
    'Cache-Control': 'public, max-age=31536000',
    'Content-Type': media.mime_type,
    'Content-Length': media.file_size
  });

  if (media.media_type === 'video') {
    // Support range requests for videos
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.sendFile(filePath);
    }
  } else {
    // For images, use sendFile
    res.sendFile(filePath);
  }
});

// GET /api/media/:id/thumbnail - Get video thumbnail
router.get('/:id/thumbnail', authenticateToken, (req, res) => {
  const db = getDb();
  const media = db.prepare('SELECT thumbnail_path FROM pt_media WHERE id = ?').get(req.params.id);

  if (!media || !media.thumbnail_path) {
    return res.status(404).json({ error: 'Thumbnail not found' });
  }

  const filePath = path.join(__dirname, '../../uploads', media.thumbnail_path);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Thumbnail not found' });
  }

  res.set({ 'Cache-Control': 'public, max-age=31536000' });
  res.sendFile(filePath);
});

// GET /api/media/:id/versions - Get all available video versions
router.get('/:id/versions', authenticateToken, (req, res) => {
  const db = getDb();
  const versions = db.prepare(`
    SELECT resolution, file_size, duration_seconds
    FROM video_versions
    WHERE media_id = ?
    ORDER BY
      CASE resolution
        WHEN '1080p' THEN 1
        WHEN '720p' THEN 2
        ELSE 3
      END
  `).all(req.params.id);

  res.json({ versions });
});

module.exports = router;
