import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories - Public
router.get('/', async (req, res) => {
  try {
    const categories = await db.find('project_categories', '', [], 'name ASC');
    
    // Annotate with project count
    const withCount = await Promise.all(categories.map(async cat => {
      const countResult = await db.query(
        'SELECT COUNT(*) as count FROM projects WHERE category_id = $1',
        [cat.id]
      );
      const count = countResult[0]?.count || 0;
      return { ...cat, project_count: parseInt(count) };
    }));
    
    res.json({ success: true, categories: withCount });
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// POST /api/categories - Admin / PM
router.post('/', authenticateToken, requirePermission('categories.manage'), async (req, res) => {
  try {
    const { name, slug, description, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newCat = await db.insert('project_categories', {
      id: Date.now(),
      name,
      slug: catSlug,
      description: description || '',
      color: color || '#6366f1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Created Category', 'Taxonomy', newCat.name);
    res.status(201).json({ success: true, category: newCat });
  } catch (err) {
    console.error('Category create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// PUT /api/categories/:id
router.put('/:id', authenticateToken, requirePermission('categories.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, description, color } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;

    const updated = await db.update('project_categories', updates, 'id = $1', [id]);

    if (!updated) return res.status(404).json({ success: false, message: 'Category not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Category', 'Taxonomy', updated.name);
    res.json({ success: true, category: updated });
  } catch (err) {
    console.error('Category update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authenticateToken, requirePermission('categories.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('project_categories', 'id = $1', [id]);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await db.delete('project_categories', 'id = $1', [id]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Category', 'Taxonomy', target.name || `ID ${id}`);
    
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('Category delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

export default router;
