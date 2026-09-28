import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/brochures/project/:projectId - Get all brochures for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const brochures = await db.find('project_brochures', 'project_id = $1', [parseInt(projectId)], 'display_order ASC, id ASC');
    res.json({ success: true, brochures: brochures || [], data: brochures || [] });
  } catch (err) {
    console.error('Brochure fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch brochures.' });
  }
});

// GET /api/brochures/:id - Get single brochure
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isNaN(id)) {
      const brochure = await db.findOne('project_brochures', 'id = $1', [parseInt(id)]);
      if (!brochure) {
        return res.status(404).json({ success: false, message: 'Brochure not found.' });
      }
      return res.json({ success: true, brochure, data: brochure });
    }
    
    res.status(400).json({ success: false, message: 'Invalid brochure ID.' });
  } catch (err) {
    console.error('Brochure fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch brochure.' });
  }
});

// GET /api/brochures - Query-based (by projectId or all brochures)
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (projectId) {
      const brochures = await db.find('project_brochures', 'project_id = $1', [parseInt(projectId)], 'display_order ASC, id ASC');
      return res.json({ success: true, data: brochures || [], brochures: brochures || [] });
    }

    // If no specific projectId, return all brochures joined/mapped with project info
    let brochures = await db.find('project_brochures', '1=1', [], 'created_at DESC, id DESC');
    if (!brochures) brochures = [];

    // Attach project name/slug if available
    try {
      const projects = await db.find('projects', '1=1', []);
      const projectMap = new Map((projects || []).map(p => [p.id, p]));
      brochures = brochures.map(b => {
        const p = projectMap.get(b.project_id);
        return {
          ...b,
          project_name: p ? (p.name || p.title) : undefined,
          project_slug: p ? p.slug : undefined
        };
      });
    } catch (attachErr) {
      console.warn('Could not attach project names to brochures:', attachErr.message);
    }

    res.json({ success: true, data: brochures, brochures: brochures });
  } catch (err) {
    console.error('Brochure fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch brochures.' });
  }
});

// POST /api/brochures - Create/upload a brochure (requires authentication)
router.post('/', authenticateToken, requirePermission('projects.edit'), async (req, res) => {
  try {
    const {
      project_id,
      file_type,
      file_url,
      thumbnail_url,
      title,
      description,
      file_size_mb,
      display_order
    } = req.body;

    if (!project_id || !file_url) {
      return res.status(400).json({ success: false, message: 'Project ID and file URL are required.' });
    }

    // Check project exists
    const project = await db.findOne('projects', 'id = $1', [parseInt(project_id)]);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Permission check
    const isPrivileged = ['super_admin', 'administrator', 'project_manager'].includes(req.user.role);
    if (!isPrivileged && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only add brochures to your own projects.' });
    }

    const detectFileTypeFromUrl = (url = '', explicitType) => {
      if (explicitType && ['pdf', 'image', 'document'].includes(explicitType)) {
        return explicitType;
      }
      const clean = url.toLowerCase().split('?')[0].split('#')[0];
      const ext = clean.split('.').pop() || '';
      if (ext === 'pdf' || clean.includes('.pdf')) return 'pdf';
      if (['png', 'jpg', 'jpeg', 'webp', 'jfif', 'gif', 'svg', 'bmp', 'avif', 'tiff', 'ico'].includes(ext)) return 'image';
      return 'document';
    };

    const detectedFileType = detectFileTypeFromUrl(file_url, file_type);
    const finalThumbnail = thumbnail_url || (detectedFileType === 'image' ? file_url : null);

    const newBrochure = await db.insert('project_brochures', {
      id: Date.now(),
      project_id: parseInt(project_id),
      file_type: detectedFileType,
      file_url,
      thumbnail_url: finalThumbnail,
      title: title || 'Project Brochure',
      description: description || '',
      file_size_mb: file_size_mb ? parseFloat(file_size_mb) : null,
      display_order: display_order !== undefined ? parseInt(display_order) : 0,
      content: '', // Legacy column for schema compatibility
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Uploaded Brochure', 'Brochures', `${title || 'Brochure'} (${project.name || project.title})`);

    res.status(201).json({
      success: true,
      message: 'Brochure created successfully.',
      brochure: newBrochure,
      data: newBrochure
    });
  } catch (err) {
    console.error('Brochure upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload brochure.', error: err.message });
  }
});

// PUT /api/brochures/:id - Update brochure metadata (requires authentication)
router.put('/:id', authenticateToken, requirePermission('projects.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      display_order,
      thumbnail_url,
      file_url,
      file_type,
      file_size_mb,
      project_id
    } = req.body;

    const brochure = await db.findOne('project_brochures', 'id = $1', [parseInt(id)]);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found.' });
    }

    // Check project ownership
    const project = await db.findOne('projects', 'id = $1', [brochure.project_id]);
    const isPrivileged = ['super_admin', 'administrator', 'project_manager'].includes(req.user.role);
    if (!isPrivileged && project && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit brochures for your own projects.' });
    }

    const detectFileTypeFromUrl = (url = '', explicitType) => {
      if (explicitType && ['pdf', 'image', 'document'].includes(explicitType)) {
        return explicitType;
      }
      const clean = url.toLowerCase().split('?')[0].split('#')[0];
      const ext = clean.split('.').pop() || '';
      if (ext === 'pdf' || clean.includes('.pdf')) return 'pdf';
      if (['png', 'jpg', 'jpeg', 'webp', 'jfif', 'gif', 'svg', 'bmp', 'avif', 'tiff', 'ico'].includes(ext)) return 'image';
      return 'document';
    };

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (display_order !== undefined) updates.display_order = parseInt(display_order);
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url || null;
    if (file_url !== undefined) {
      updates.file_url = file_url;
      if (file_type === undefined) {
        updates.file_type = detectFileTypeFromUrl(file_url);
      }
    }
    if (file_type !== undefined) {
      updates.file_type = file_type;
    }
    if (file_size_mb !== undefined) updates.file_size_mb = file_size_mb ? parseFloat(file_size_mb) : null;
    if (project_id !== undefined) updates.project_id = parseInt(project_id);
    updates.updated_at = new Date().toISOString();

    const updated = await db.update('project_brochures', updates, 'id = $1', [parseInt(id)]);

    await db.logActivity(req.user.name, req.user.role, 'Updated Brochure', 'Brochures', `${updated.title || 'Brochure'}`);

    res.json({
      success: true,
      message: 'Brochure updated successfully.',
      brochure: updated,
      data: updated
    });
  } catch (err) {
    console.error('Brochure update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update brochure.', error: err.message });
  }
});

// DELETE /api/brochures/:id - Delete brochure (requires authentication)
router.delete('/:id', authenticateToken, requirePermission('projects.edit'), async (req, res) => {
  try {
    const { id } = req.params;

    const brochure = await db.findOne('project_brochures', 'id = $1', [parseInt(id)]);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found.' });
    }

    // Check project ownership
    const project = await db.findOne('projects', 'id = $1', [brochure.project_id]);
    const isPrivileged = ['super_admin', 'administrator', 'project_manager'].includes(req.user.role);
    if (!isPrivileged && project && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete brochures from your own projects.' });
    }

    await db.delete('project_brochures', 'id = $1', [parseInt(id)]);

    await db.logActivity(req.user.name, req.user.role, 'Deleted Brochure', 'Brochures', `${brochure.title || 'Brochure ID ' + id}`);

    res.json({ success: true, message: 'Brochure deleted successfully.' });
  } catch (err) {
    console.error('Brochure delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete brochure.' });
  }
});

export default router;
