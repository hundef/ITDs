import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/testimonials - Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await db.find('testimonials', '', [], 'display_order ASC, created_at DESC');
    
    // Enrich with project details if linked
    const enriched = await Promise.all(testimonials.map(async t => {
      let project_name = null;
      let project_slug = null;
      
      if (t.project_id) {
        const project = await db.findOne('projects', 'id = $1', [t.project_id]);
        if (project) {
          project_name = project.name;
          project_slug = project.slug;
        }
      }
      
      return {
        ...t,
        project_name,
        project_slug
      };
    }));
    
    res.json({ success: true, testimonials: enriched });
  } catch (err) {
    console.error('Testimonials fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials.' });
  }
});

// POST /api/testimonials - Admin / Content Manager
router.post('/', authenticateToken, requirePermission('testimonials.manage'), async (req, res) => {
  try {
    // Support both field name conventions
    const author_name = req.body.client_name || req.body.author_name;
    const author_role = req.body.client_role || req.body.author_role;
    const author_company = req.body.client_company || req.body.author_company;
    const author_avatar = req.body.avatar || req.body.author_avatar;
    const { content, rating, project_id, is_featured, display_order } = req.body;
    
    if (!author_name || !content) return res.status(400).json({ success: false, message: 'Author name and content are required.' });

    const newTestimonial = await db.insert('testimonials', {
      id: Date.now(),
      project_id: project_id ? parseInt(project_id) : null,
      author_name,
      author_role: author_role || '',
      author_company: author_company || '',
      author_avatar: author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content,
      rating: rating ? parseInt(rating) : 5,
      is_featured: is_featured !== undefined ? (is_featured ? 1 : 0) : 1,
      display_order: display_order ? parseInt(display_order) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Added Testimonial', 'Testimonials', `From ${newTestimonial.author_name}`);
    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (err) {
    console.error('Testimonial create error:', err);
    res.status(500).json({ success: false, message: 'Failed to add testimonial.' });
  }
});

// PUT /api/testimonials/:id
router.put('/:id', authenticateToken, requirePermission('testimonials.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Support both field name conventions
    const author_name = req.body.client_name !== undefined ? req.body.client_name : (req.body.author_name !== undefined ? req.body.author_name : undefined);
    const author_role = req.body.client_role !== undefined ? req.body.client_role : (req.body.author_role !== undefined ? req.body.author_role : undefined);
    const author_company = req.body.client_company !== undefined ? req.body.client_company : (req.body.author_company !== undefined ? req.body.author_company : undefined);
    const author_avatar = req.body.avatar !== undefined ? req.body.avatar : (req.body.author_avatar !== undefined ? req.body.author_avatar : undefined);
    const { content, rating, project_id, is_featured, display_order } = req.body;

    const updates = {};
    if (author_name !== undefined) updates.author_name = author_name;
    if (author_role !== undefined) updates.author_role = author_role;
    if (author_company !== undefined) updates.author_company = author_company;
    if (author_avatar !== undefined) updates.author_avatar = author_avatar;
    if (content !== undefined) updates.content = content;
    if (rating !== undefined) updates.rating = parseInt(rating);
    if (project_id !== undefined) updates.project_id = project_id ? parseInt(project_id) : null;
    if (is_featured !== undefined) updates.is_featured = is_featured ? 1 : 0;
    if (display_order !== undefined) updates.display_order = parseInt(display_order);

    const updated = await db.update('testimonials', updates, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Testimonial not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Testimonial', 'Testimonials', `From ${updated.author_name}`);
    res.json({ success: true, testimonial: updated });
  } catch (err) {
    console.error('Testimonial update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update testimonial.' });
  }
});

// DELETE /api/testimonials/:id
router.delete('/:id', authenticateToken, requirePermission('testimonials.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('testimonials', 'id = $1', [id]);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    await db.delete('testimonials', 'id = $1', [id]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Testimonial', 'Testimonials', target.author_name || `ID ${id}`);
    
    res.json({ success: true, message: 'Testimonial removed.' });
  } catch (err) {
    console.error('Testimonial delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial.' });
  }
});

export default router;
