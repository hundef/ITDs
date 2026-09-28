import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

function formatBlog(blog) {
  let tags = [];
  try {
    if (blog.tags_json) tags = JSON.parse(blog.tags_json);
  } catch (e) {
    tags = [];
  }
  return {
    ...blog,
    tags
  };
}

// GET /api/blogs - Public
router.get('/', async (req, res) => {
  try {
    const blogs = await db.find('blog_posts', '', [], 'COALESCE(published_at, created_at) DESC');
    res.json({ success: true, blogs: blogs.map(formatBlog) });
  } catch (err) {
    console.error('Blogs fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blog posts.' });
  }
});

// GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try to find by slug first, then by ID
    let blog = await db.findOne('blog_posts', 'slug = $1', [slug]);
    if (!blog) {
      const id = parseInt(slug);
      if (!isNaN(id)) {
        blog = await db.findOne('blog_posts', 'id = $1', [id]);
      }
    }
    
    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found.' });

    // Get recent posts excluding current one
    const recent = await db.find('blog_posts', 'id != $1', [blog.id], 'COALESCE(published_at, created_at) DESC LIMIT 3');

    res.json({ success: true, blog: formatBlog(blog), recent: recent.map(formatBlog) });
  } catch (err) {
    console.error('Blog fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blog post.' });
  }
});

// POST /api/blogs - Admin / Content Manager
router.post('/', authenticateToken, requirePermission('blogs.manage'), async (req, res) => {
  try {
    const { title, slug, summary, content, cover_image, tags, read_time, is_published, published_at } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required.' });

    const blogSlug = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newBlog = await db.insert('blog_posts', {
      id: Date.now(),
      title,
      slug: blogSlug,
      summary: summary || '',
      content,
      cover_image: cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      tags_json: Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]),
      read_time: read_time || '5 min read',
      is_published: is_published !== undefined ? (is_published ? 1 : 0) : 1,
      published_at: published_at || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Published Article', 'Blog', newBlog.title);
    res.status(201).json({ success: true, blog: formatBlog(newBlog) });
  } catch (err) {
    console.error('Blog create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create blog post.' });
  }
});

// PUT /api/blogs/:id
router.put('/:id', authenticateToken, requirePermission('blogs.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, slug, summary, content, cover_image, tags, read_time, is_published, published_at } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (summary !== undefined) updates.summary = summary;
    if (content !== undefined) updates.content = content;
    if (cover_image !== undefined) updates.cover_image = cover_image;
    if (tags !== undefined) updates.tags_json = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    if (read_time !== undefined) updates.read_time = read_time;
    if (is_published !== undefined) updates.is_published = is_published ? 1 : 0;
    if (published_at !== undefined) updates.published_at = published_at;

    const updated = await db.update('blog_posts', updates, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Article not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Article', 'Blog', updated.title);
    res.json({ success: true, blog: formatBlog(updated) });
  } catch (err) {
    console.error('Blog update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update blog post.' });
  }
});

// DELETE /api/blogs/:id
router.delete('/:id', authenticateToken, requirePermission('blogs.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('blog_posts', 'id = $1', [id]);
    
    if (!target) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    await db.delete('blog_posts', 'id = $1', [id]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Article', 'Blog', target.title || `ID ${id}`);
    
    res.json({ success: true, message: 'Article removed.' });
  } catch (err) {
    console.error('Blog delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete blog post.' });
  }
});

export default router;
