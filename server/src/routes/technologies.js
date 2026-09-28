import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/technologies - Public
router.get('/', async (req, res) => {
  try {
    const technologies = await db.find('technologies', '', [], 'name ASC');
    
    // Annotate with usage count
    const withCount = await Promise.all(technologies.map(async tech => {
      const count = await db.count('project_technologies', 'technology_id = $1', [tech.id]);
      return { ...tech, project_count: count };
    }));
    
    res.json({ success: true, technologies: withCount });
  } catch (err) {
    console.error('Technologies fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch technologies.' });
  }
});

// POST /api/technologies - Admin / PM
router.post('/', authenticateToken, requirePermission('technologies.manage'), async (req, res) => {
  try {
    const { name, slug, category, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Technology name is required.' });

    const techSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newTech = await db.insert('technologies', {
      id: Date.now(),
      name,
      slug: techSlug,
      category: category || 'General',
      icon: icon || 'Code',
      color: color || '#3b82f6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Created Technology', 'Taxonomy', newTech.name);
    res.status(201).json({ success: true, technology: newTech });
  } catch (err) {
    console.error('Technology create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create technology.' });
  }
});

// PUT /api/technologies/:id
router.put('/:id', authenticateToken, requirePermission('technologies.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, category, icon, color } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (category !== undefined) updates.category = category;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;

    const updated = await db.update('technologies', updates, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Technology not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Technology', 'Taxonomy', updated.name);
    res.json({ success: true, technology: updated });
  } catch (err) {
    console.error('Technology update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update technology.' });
  }
});

// DELETE /api/technologies/:id
router.delete('/:id', authenticateToken, requirePermission('technologies.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('technologies', 'id = $1', [id]);
    
    if (!target) {
      return res.status(404).json({ success: false, message: 'Technology not found.' });
    }

    // Remove from project_technologies junction table first
    await db.delete('project_technologies', 'technology_id = $1', [id]);
    await db.delete('technologies', 'id = $1', [id]);

    await db.logActivity(req.user.name, req.user.role, 'Deleted Technology', 'Taxonomy', target.name || `ID ${id}`);
    res.json({ success: true, message: 'Technology deleted.' });
  } catch (err) {
    console.error('Technology delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete technology.' });
  }
});

export default router;
