import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'asset-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});

const router = express.Router();

// POST /api/upload - Authenticated upload
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  try {
    console.log('Upload request received', {
      file: req.file ? { name: req.file.filename, size: req.file.size, originalName: req.file.originalname } : 'none',
      user: req.user?.id || 'unknown'
    });

    if (!req.file) {
      console.log('Upload failed: No file provided');
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Upload successful:', fileUrl, 'Size:', req.file.size);
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload file.', error: err.message });
  }
});

export default router;
