import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Helper to format service
async function formatService(svc) {
  let features = [];
  let methodology = [];

  try {
    if (svc.features_json) features = JSON.parse(svc.features_json);
  } catch (e) {
    features = [];
  }

  try {
    if (svc.methodology_json) methodology = JSON.parse(svc.methodology_json);
  } catch (e) {
    methodology = [];
  }

  // Find related projects (e.g. up to 3 projects)
  const projects = await db.find('projects', 'is_published = $1', [1], 'created_at DESC LIMIT 3');
  const relatedProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    cover_image: p.cover_image,
    status: p.status,
    short_description: p.short_description
  }));

  return {
    ...svc,
    features,
    methodology,
    relatedProjects
  };
}

// GET /api/services - Public
router.get('/', async (req, res) => {
  try {
    const services = await db.find('services', '', [], 'display_order ASC');
    const formatted = await Promise.all(services.map(formatService));
    res.json({ success: true, services: formatted });
  } catch (err) {
    console.error('Services fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// GET /api/services/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try slug first, then ID
    let svc = await db.findOne('services', 'slug = $1', [slug]);
    if (!svc) {
      const id = parseInt(slug);
      if (!isNaN(id)) {
        svc = await db.findOne('services', 'id = $1', [id]);
      }
    }
    
    if (!svc) return res.status(404).json({ success: false, message: 'Service not found.' });
    
    const formatted = await formatService(svc);
    res.json({ success: true, service: formatted });
  } catch (err) {
    console.error('Service fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch service.' });
  }
});

// POST /api/services - Admin / Content Manager
router.post('/', authenticateToken, requirePermission('services.manage'), async (req, res) => {
  try {
    const { name, slug, icon, short_description, full_description, features, methodology, display_order, is_active } = req.body;
    if (!name || !short_description) {
      return res.status(400).json({ success: false, message: 'Service name and short description are required.' });
    }

    const svcSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newService = await db.insert('services', {
      id: Date.now(),
      name,
      slug: svcSlug,
      icon: icon || 'Code2',
      short_description,
      full_description: full_description || short_description,
      features_json: Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]),
      methodology_json: Array.isArray(methodology) ? JSON.stringify(methodology) : JSON.stringify([]),
      display_order: display_order ? parseInt(display_order) : 10,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Created Service', 'Service', newService.name);
    const formatted = await formatService(newService);
    res.status(201).json({ success: true, service: formatted });
  } catch (err) {
    console.error('Service create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// PUT /api/services/:id
router.put('/:id', authenticateToken, requirePermission('services.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, icon, short_description, full_description, features, methodology, display_order, is_active } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (icon !== undefined) updates.icon = icon;
    if (short_description !== undefined) updates.short_description = short_description;
    if (full_description !== undefined) updates.full_description = full_description;
    if (features !== undefined) updates.features_json = Array.isArray(features) ? JSON.stringify(features) : features;
    if (methodology !== undefined) updates.methodology_json = Array.isArray(methodology) ? JSON.stringify(methodology) : methodology;
    if (display_order !== undefined) updates.display_order = parseInt(display_order);
    if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;

    const updated = await db.update('services', updates, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Service not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Service', 'Service', updated.name);
    const formatted = await formatService(updated);
    res.json({ success: true, service: formatted });
  } catch (err) {
    console.error('Service update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', authenticateToken, requirePermission('services.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('services', 'id = $1', [id]);
    
    if (!target) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    await db.delete('services', 'id = $1', [id]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Service', 'Service', target.name || `ID ${id}`);
    
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    console.error('Service delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

export default router;
