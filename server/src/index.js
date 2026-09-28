import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initializeDatabase } from './db/db.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import categoriesRoutes from './routes/categories.js';
import technologiesRoutes from './routes/technologies.js';
import servicesRoutes from './routes/services.js';
import teamRoutes from './routes/team.js';
import departmentsRoutes from './routes/departments.js';
import testimonialsRoutes from './routes/testimonials.js';
import blogsRoutes from './routes/blogs.js';
import inquiriesRoutes from './routes/inquiries.js';
import settingsRoutes from './routes/settings.js';
import statsRoutes from './routes/stats.js';
import uploadRoutes from './routes/upload.js';
import brochuresRoutes from './routes/brochures.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Correctly resolve to server/uploads directory
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Security Headers Middleware (Fixes "Not Secure" browser warnings when HTTPS is enabled)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!req.path.startsWith('/uploads')) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads & built SPA client serving
console.log(`📁 Setting up static middleware for: ${UPLOADS_DIR}`);
console.log(`📁 Uploads directory exists: ${fs.existsSync(UPLOADS_DIR)}`);
if (fs.existsSync(UPLOADS_DIR)) {
  console.log(`📁 Files in uploads: ${fs.readdirSync(UPLOADS_DIR).length}`);
}
app.use('/uploads', express.static(UPLOADS_DIR, { 
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Content-Disposition', 'inline');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.removeHeader('X-Frame-Options');
    if (filePath.toLowerCase().endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
    }
  }
}));

const DIST_DIR = path.resolve(__dirname, '../../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/technologies', technologiesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/brochures', brochuresRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    timestamp: new Date().toISOString(),
    service: 'Nexora Systems API Server'
  });
});

// Debug: Check if uploads directory exists
app.get('/api/uploads-debug', (req, res) => {
  const uploadsPath = path.resolve(__dirname, '../uploads');
  const exists = fs.existsSync(uploadsPath);
  const files = exists ? fs.readdirSync(uploadsPath).slice(0, 5) : [];
  res.json({
    uploadsPath,
    exists,
    fileCount: exists ? fs.readdirSync(uploadsPath).length : 0,
    sampleFiles: files
  });
});

// SPA Fallback Route for non-API frontend routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize database & start server
initializeDatabase().then(() => {
  // Check for SSL Certificate files for HTTPS
  const keyPath = process.env.SSL_KEY_PATH || path.resolve(__dirname, '../certs/key.pem');
  const certPath = process.env.SSL_CERT_PATH || path.resolve(__dirname, '../certs/cert.pem');

  let hasSSL = false;
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    try {
      const sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`🔒 HTTPS Secure Server running on https://0.0.0.0:${HTTPS_PORT}`);
      });
      hasSSL = true;
    } catch (err) {
      console.warn('⚠️ Found SSL certificates but failed to start HTTPS server:', err.message);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 REST API Server running on port ${PORT}`);
    console.log(`📡 HTTP URL:  http://localhost:${PORT}`);
    if (hasSSL) {
      console.log(`🔒 HTTPS URL: https://localhost:${HTTPS_PORT}`);
    } else {
      console.log(`ℹ️  Note on "Not Secure": Browsers show "Not Secure" on http:// URLs because traffic is unencrypted.`);
      console.log(`   To enable HTTPS SSL, place SSL key & cert in server/certs/key.pem & cert.pem or use a reverse proxy (Cloudflare/Nginx/Firebase Hosting).`);
    }
    console.log(`⚡ Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize PostgreSQL database:', err.message);
  console.error('Make sure PostgreSQL is running and accessible with the credentials in server/.env');
  process.exit(1);
});
