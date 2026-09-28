import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Helper to hydrate a project with all its relationships
async function hydrateProject(project) {
  if (!project) return null;

  try {
    const category = await db.findOne('project_categories', 'id = $1', [project.category_id]);
    
    // Use ID ordering as fallback since display_order might not exist in all databases
    const features = await db.find('project_features', 'project_id = $1', [project.id], 'id ASC');
    const workflows = await db.find('project_workflows', 'project_id = $1', [project.id], 'step_number ASC');
    const results = await db.find('project_results', 'project_id = $1', [project.id], 'id ASC');
    const media = await db.find('project_media', 'project_id = $1', [project.id], 'id ASC');
    const links = await db.find('project_links', 'project_id = $1', [project.id], 'id ASC');
    const technologies = await db.find('project_technologies', 'project_id = $1', [project.id]);
    const custom_techs = await db.find('project_custom_technologies', 'project_id = $1', [project.id], 'id ASC');
    
    let brochures = [];
    try {
      brochures = await db.find('project_brochures', 'project_id = $1', [project.id], 'id ASC');
    } catch (brErr) {
      // Brochures table might not exist yet
      console.warn('Brochures table query failed:', brErr.message);
    }

    return {
      ...project,
      category,
      features,
      workflows,
      results,
      media,
      links,
      technologies,
      custom_technologies: custom_techs,
      brochures
    };
  } catch (err) {
    console.error('Error hydrating project:', err.message);
    // Return basic project data without relationships if hydration fails
    return {
      ...project,
      category: null,
      features: [],
      workflows: [],
      results: [],
      media: [],
      links: [],
      technologies: [],
      custom_technologies: [],
      brochures: []
    };
  }
}

// GET /api/projects - Public & Admin with filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      technology,
      year,
      featured,
      published,
      sort = 'priority',
      page = 1,
      limit = 50
    } = req.query;

    let whereClause = '1=1';
    let params = [];

    // Filter by published status
    if (published !== 'all' && published !== undefined) {
      const isPub = published === 'true' || published === '1' ? 1 : 0;
      whereClause += ' AND is_published = $' + (params.length + 1);
      params.push(isPub);
    } else if (published === undefined) {
      // Default: only show published projects
      whereClause += ' AND is_published = $' + (params.length + 1);
      params.push(1);
    }

    // Filter by status
    if (status && status !== 'all' && status !== 'All') {
      if (status.toLowerCase() === 'featured') {
        whereClause += ' AND is_featured = $' + (params.length + 1);
        params.push(1);
      } else {
        whereClause += ' AND LOWER(status) = LOWER($' + (params.length + 1) + ')';
        params.push(status);
      }
    }

    // Filter by Featured
    if (featured === 'true' || featured === '1') {
      whereClause += ' AND is_featured = $' + (params.length + 1);
      params.push(1);
    }

    // Filter by Category (slug or ID)
    if (category && category !== 'all' && category !== 'All') {
      const catId = parseInt(category);
      whereClause += ' AND (category_id = $' + (params.length + 1) + ' OR category_id IN (SELECT id FROM project_categories WHERE slug = $' + (params.length + 2) + '))';
      params.push(catId || null, category);
    }

    // Filter by Technology
    if (technology && technology !== 'all' && technology !== 'All') {
      whereClause += ` AND id IN (SELECT project_id FROM project_technologies WHERE technology_id IN (SELECT id FROM technologies WHERE name ILIKE $${params.length + 1} OR slug = $${params.length + 2}))`;
      params.push('%' + technology + '%', technology);
    }

    // Filter by Year
    if (year && year !== 'all' && year !== 'All') {
      whereClause += ` AND EXTRACT(YEAR FROM start_date) = $${params.length + 1}`;
      params.push(parseInt(year));
    }

    // Search by name or description
    if (search && search.trim() !== '') {
      whereClause += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`;
      params.push('%' + search + '%', '%' + search + '%');
    }

    // Get total count
    const countResult = await db.query(`SELECT COUNT(*) as count FROM projects WHERE ${whereClause}`, params);
    const total = countResult[0]?.count || 0;

    // Get projects with sorting and pagination
    let orderBy = 'priority DESC';
    if (sort === 'newest') orderBy = 'created_at DESC';
    else if (sort === 'oldest') orderBy = 'created_at ASC';
    else if (sort === 'featured') orderBy = 'is_featured DESC, priority DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const projects = await db.find(
      'projects',
      whereClause,
      params,
      orderBy,
      parseInt(limit),
      offset
    );

    // Hydrate projects
    const hydrated = await Promise.all(projects.map(p => hydrateProject(p)));

    res.json({
      success: true,
      projects: hydrated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Projects fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

// GET /api/projects/:id or :slug - Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    let project = null;
    
    // Try numeric ID only if it's a valid number
    if (!isNaN(projectId)) {
      project = await db.findOne('projects', 'id = $1', [projectId]);
    }
    
    // Fall back to slug lookup
    if (!project) {
      project = await db.findOne('projects', 'slug = $1', [id]);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const hydrated = await hydrateProject(project);
    res.json({ success: true, project: hydrated });
  } catch (err) {
    console.error('Project fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch project.' });
  }
});

// POST /api/projects - Create new project (requires projects.create permission)
router.post('/', authenticateToken, requirePermission('projects.create'), async (req, res) => {
  try {
    const {
      name, slug, description, short_description, full_description, cover_image,
      category_id, start_date, completion_date, status, is_featured, is_published, priority,
      client_name, purpose, what_it_does, problems_solved,
      title_overview, title_solution, title_problems, title_features,
      custom_technologies, features, results, media, links, brochures
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    const cleanShortDesc = (short_description && short_description.trim()) || description || name;
    const cleanCoverImage = (cover_image && cover_image.trim()) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80';

    // Generate unique slug
    let baseSlug = (slug || name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    if (!baseSlug) baseSlug = `project-${Date.now()}`;

    // Check if slug already exists
    const existingSlug = await db.findOne('projects', 'slug = $1', [baseSlug]);
    if (existingSlug) {
      baseSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const projectId = Date.now();
    const parsedCategoryId = category_id && !isNaN(Number(category_id)) ? Number(category_id) : null;

    console.log('Creating project with:', { name, cover_image: cleanCoverImage, slug: baseSlug });

    const newProject = await db.insert('projects', {
      id: projectId,
      name: name.trim(),
      slug: baseSlug,
      description: description || cleanShortDesc,
      short_description: cleanShortDesc,
      full_description: full_description || '',
      cover_image: cleanCoverImage,
      category_id: parsedCategoryId,
      client_name: client_name || '',
      purpose: purpose || '',
      what_it_does: what_it_does || '',
      problems_solved: problems_solved || '',
      title_overview: title_overview || 'What is this Project?',
      title_solution: title_solution || 'What This Project Does',
      title_problems: title_problems || 'What Problem Does It Solve?',
      title_features: title_features || 'Key Features & Capabilities',
      created_by: req.user.id,
      start_date: start_date || null,
      completion_date: completion_date || null,
      status: status || 'Ongoing',
      is_featured: is_featured ? 1 : 0,
      is_published: is_published !== undefined ? (is_published ? 1 : 0) : 1,
      priority: priority || 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    let entityCounter = 1;
    const nextSubId = () => projectId + 1000 + (entityCounter++);

    // Handle custom technologies
    if (custom_technologies && Array.isArray(custom_technologies)) {
      for (let i = 0; i < custom_technologies.length; i++) {
        const tech = custom_technologies[i];
        if (tech && tech.name) {
          await db.insert('project_custom_technologies', {
            id: nextSubId(),
            project_id: projectId,
            name: tech.name,
            category: tech.category || 'Technology',
            color: tech.color || '#6366f1',
            display_order: i
          }).catch(e => console.warn('Custom tech insert error:', e.message));
        }
      }
    }

    // Handle features
    if (features && Array.isArray(features)) {
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        if (feature && feature.title) {
          await db.insert('project_features', {
            id: nextSubId(),
            project_id: projectId,
            title: feature.title,
            description: feature.description || '',
            icon: feature.icon || 'CheckCircle',
            display_order: i
          }).catch(e => console.warn('Feature insert error:', e.message));
        }
      }
    }

    // Handle results
    if (results && Array.isArray(results)) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result && (result.metric_label || result.metric_value)) {
          await db.insert('project_results', {
            id: nextSubId(),
            project_id: projectId,
            metric_label: result.metric_label || '',
            metric_value: result.metric_value || '',
            description: result.description || '',
            display_order: i
          }).catch(e => console.warn('Result insert error:', e.message));
        }
      }
    }

    // Handle media
    if (media && Array.isArray(media)) {
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        if (m && m.url) {
          await db.insert('project_media', {
            id: nextSubId(),
            project_id: projectId,
            media_type: m.media_type || 'image',
            url: m.url,
            caption: m.caption || '',
            display_order: i
          }).catch(e => console.warn('Media insert error:', e.message));
        }
      }
    }

    // Handle links
    if (links && Array.isArray(links)) {
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link && link.url) {
          await db.insert('project_links', {
            id: nextSubId(),
            project_id: projectId,
            link_type: link.link_type || 'website',
            url: link.url,
            label: link.label || link.link_type,
            display_order: i
          }).catch(e => console.warn('Link insert error:', e.message));
        }
      }
    }

    // Handle brochures
    if (brochures && Array.isArray(brochures)) {
      for (let i = 0; i < brochures.length; i++) {
        const brochure = brochures[i];
        if (brochure && brochure.file_url) {
          await db.insert('project_brochures', {
            id: nextSubId(),
            project_id: projectId,
            file_type: brochure.file_type || 'pdf',
            file_url: brochure.file_url,
            thumbnail_url: brochure.thumbnail_url || null,
            title: brochure.title || 'Project Brochure',
            description: brochure.description || '',
            file_size_mb: brochure.file_size_mb || null,
            display_order: i,
            content: '' // Legacy column
          }).catch(e => console.warn('Brochure insert error:', e.message));
        }
      }
    }

    await db.logActivity(req.user.name, req.user.role, 'Created Project', 'Projects', name);
    console.log('Project created successfully:', projectId);
    res.json({ success: true, message: 'Project created successfully.', project: newProject });
  } catch (err) {
    console.error('Project create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create project.', error: err.message });
  }
});

// PUT /api/projects/:id - Edit project (requires projects.edit permission or ownership)
router.put('/:id', authenticateToken, requirePermission('projects.edit'), async (req, res) => {
  try {
    console.log('\n========== PUT /api/projects/:id ==========');
    console.log('Incoming request body size:', JSON.stringify(req.body).length, 'bytes');
    console.log('Request body top-level keys:', Object.keys(req.body));
    
    const projectId = parseInt(req.params.id);
    const project = await db.findOne('projects', 'id = $1', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check ownership: allow if super_admin, project_manager, or project owner
    if (req.user.role !== 'super_admin' && req.user.role !== 'project_manager' && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own projects.' });
    }

    const {
      name, slug, description, short_description, full_description, cover_image,
      category_id, start_date, completion_date, status, is_featured, is_published, priority,
      client_name, purpose, what_it_does, problems_solved,
      title_overview, title_solution, title_problems, title_features,
      custom_technologies, features, results, media, links, brochures
    } = req.body;

    console.log('=== PROJECT UPDATE REQUEST ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Cover Image:', { 
      exists: 'cover_image' in req.body,
      value: req.body.cover_image,
      type: typeof req.body.cover_image,
      isEmpty: req.body.cover_image === '' || req.body.cover_image === null
    });
    console.log('Media field:', { 
      exists: 'media' in req.body,
      value: req.body.media,
      type: Array.isArray(req.body.media) ? 'array' : typeof req.body.media,
      length: Array.isArray(req.body.media) ? req.body.media.length : 'n/a'
    });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (short_description !== undefined) updates.short_description = short_description;
    if (full_description !== undefined) updates.full_description = full_description;
    if (cover_image !== undefined) updates.cover_image = cover_image;
    if (category_id !== undefined) updates.category_id = category_id;
    if (start_date !== undefined) updates.start_date = start_date || null;
    if (completion_date !== undefined) updates.completion_date = completion_date || null;
    if (status !== undefined) updates.status = status;
    if (is_featured !== undefined) updates.is_featured = is_featured ? 1 : 0;
    if (is_published !== undefined) updates.is_published = is_published ? 1 : 0;
    if (priority !== undefined) updates.priority = priority;
    if (client_name !== undefined) updates.client_name = client_name;
    if (purpose !== undefined) updates.purpose = purpose;
    if (what_it_does !== undefined) updates.what_it_does = what_it_does;
    if (problems_solved !== undefined) updates.problems_solved = problems_solved;
    if (title_overview !== undefined) updates.title_overview = title_overview;
    if (title_solution !== undefined) updates.title_solution = title_solution;
    if (title_problems !== undefined) updates.title_problems = title_problems;
    if (title_features !== undefined) updates.title_features = title_features;
    updates.updated_at = new Date().toISOString();

    console.log('Updating project:', { projectId, updates });

    const updated = await db.update('projects', updates, 'id = $1', [projectId]);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Handle custom technologies - delete old ones and insert new ones
    if (custom_technologies !== undefined && Array.isArray(custom_technologies)) {
      await db.delete('project_custom_technologies', 'project_id = $1', [projectId]);
      for (let i = 0; i < custom_technologies.length; i++) {
        const tech = custom_technologies[i];
        if (tech.name) {
          await db.insert('project_custom_technologies', {
            id: Date.now() + i,
            project_id: projectId,
            name: tech.name,
            category: tech.category || 'Technology',
            color: tech.color || '#6366f1',
            display_order: i
          });
        }
      }
    }

    // Handle features
    if (features !== undefined && Array.isArray(features)) {
      await db.delete('project_features', 'project_id = $1', [projectId]);
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        if (feature.title) {
          await db.insert('project_features', {
            id: Date.now() + i,
            project_id: projectId,
            title: feature.title,
            description: feature.description || '',
            icon: feature.icon || 'CheckCircle',
            display_order: i
          });
        }
      }
    }

    // Handle results
    if (results !== undefined && Array.isArray(results)) {
      await db.delete('project_results', 'project_id = $1', [projectId]);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.metric_label || result.metric_value) {
          await db.insert('project_results', {
            id: Date.now() + i,
            project_id: projectId,
            metric_label: result.metric_label || '',
            metric_value: result.metric_value || '',
            description: result.description || '',
            display_order: i
          });
        }
      }
    }

    // Handle media - ALWAYS delete and re-insert if media field exists
    console.log('\n>>> MEDIA DELETION & RE-INSERT HANDLER <<<');
    console.log('Media in request body:', { exists: 'media' in req.body, value: req.body.media });
    
    if ('media' in req.body) {
      const mediaArray = req.body.media;
      console.log('Media field found. Type:', Array.isArray(mediaArray) ? 'array' : typeof mediaArray, 'Length:', mediaArray?.length);
      
      // ALWAYS delete existing media for this project
      console.log('→ Deleting ALL existing media for project', projectId);
      const deletedCount = await db.delete('project_media', 'project_id = $1', [projectId]);
      console.log('✓ Deleted', deletedCount ? 'records' : '0 records', 'from project_media');
      
      // Only re-insert if media is actually an array with items
      if (Array.isArray(mediaArray) && mediaArray.length > 0) {
        console.log('→ Re-inserting', mediaArray.length, 'media items');
        for (let i = 0; i < mediaArray.length; i++) {
          const m = mediaArray[i];
          if (m.url) {
            await db.insert('project_media', {
              id: Date.now() + i,
              project_id: projectId,
              media_type: m.media_type || 'image',
              url: m.url,
              caption: m.caption || '',
              display_order: i
            });
            console.log(`  ✓ [${i}] Inserted: ${m.url}`);
          } else {
            console.log(`  ✗ [${i}] Skipped (no URL)`);
          }
        }
        console.log('✓ Re-insert complete');
      } else {
        console.log('✓ No media to re-insert (empty array or null)');
      }
    } else {
      console.log('⚠️ Media field NOT in request - old media will be preserved');
    }
    console.log('>>> END MEDIA HANDLER <<<\n');

    // Handle links
    if (links !== undefined && Array.isArray(links)) {
      await db.delete('project_links', 'project_id = $1', [projectId]);
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.url) {
          await db.insert('project_links', {
            id: Date.now() + i,
            project_id: projectId,
            link_type: link.link_type || 'website',
            url: link.url,
            label: link.label || link.link_type,
            display_order: i
          });
        }
      }
    }

    // Handle brochures
    if (brochures !== undefined && Array.isArray(brochures)) {
      await db.delete('project_brochures', 'project_id = $1', [projectId]);
      for (let i = 0; i < brochures.length; i++) {
        const brochure = brochures[i];
        if (brochure.file_url) {
          await db.insert('project_brochures', {
            id: Date.now() + i,
            project_id: projectId,
            file_type: brochure.file_type || 'pdf',
            file_url: brochure.file_url,
            thumbnail_url: brochure.thumbnail_url || null,
            title: brochure.title || 'Project Brochure',
            description: brochure.description || '',
            file_size_mb: brochure.file_size_mb || null,
            display_order: i,
            content: '' // Legacy column - must be provided but empty
          });
        }
      }
    }

    await db.logActivity(req.user.name, req.user.role, 'Updated Project', 'Projects', updated.name);
    console.log('Project updated successfully:', projectId);
    res.json({ success: true, message: 'Project updated successfully.', project: updated });
  } catch (err) {
    console.error('Project update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update project.', error: err.message });
  }
});

// DELETE /api/projects/:id - Delete project (requires projects.delete permission or ownership)
router.delete('/:id', authenticateToken, requirePermission('projects.delete'), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await db.findOne('projects', 'id = $1', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check ownership: allow if super_admin, project_manager, or project owner
    if (req.user.role !== 'super_admin' && req.user.role !== 'project_manager' && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own projects.' });
    }

    await db.delete('projects', 'id = $1', [projectId]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Project', 'Projects', project.name);
    
    // Log critical deletion event to security logs
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'API';
    await db.logSecurityEvent(
      req.user.id,
      req.user.name,
      req.user.email,
      'PROJECT_DELETED',
      'info',
      clientIp,
      userAgent,
      `Project "${project.name}" (ID: ${projectId}) deleted by ${req.user.role} ${req.user.name}`
    );

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('Project delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

// PATCH /api/projects/:id/status - Change project status (requires projects.edit permission)
router.patch('/:id/status', authenticateToken, requirePermission('projects.edit'), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await db.findOne('projects', 'id = $1', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check ownership: allow if super_admin, project_manager, or project owner
    if (req.user.role !== 'super_admin' && req.user.role !== 'project_manager' && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only change status of your own projects.' });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const updated = await db.update('projects', { status }, 'id = $1', [projectId]);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await db.logActivity(req.user.name, req.user.role, 'Updated Project Status', 'Projects', updated.name);
    res.json({ success: true, project: updated });
  } catch (err) {
    console.error('Project status update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update project status.' });
  }
});

// PATCH /api/projects/:id/feature - Toggle featured status (requires projects.edit permission)
router.patch('/:id/feature', authenticateToken, requirePermission('projects.edit'), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await db.findOne('projects', 'id = $1', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check ownership: allow if super_admin, project_manager, or project owner
    if (req.user.role !== 'super_admin' && req.user.role !== 'project_manager' && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only feature your own projects.' });
    }

    const newIsFeatured = project.is_featured === 1 ? 0 : 1;
    const updated = await db.update('projects', { is_featured: newIsFeatured }, 'id = $1', [projectId]);

    await db.logActivity(req.user.name, req.user.role, newIsFeatured ? 'Featured Project' : 'Unfeatured Project', 'Projects', updated.name);
    res.json({ success: true, is_featured: newIsFeatured, project: updated });
  } catch (err) {
    console.error('Project feature toggle error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle featured status.' });
  }
});

// PATCH /api/projects/:id/publish - Toggle publish status (requires projects.publish permission)
router.patch('/:id/publish', authenticateToken, requirePermission('projects.publish'), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await db.findOne('projects', 'id = $1', [projectId]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check ownership: allow if super_admin, project_manager, or project owner
    if (req.user.role !== 'super_admin' && req.user.role !== 'project_manager' && project.created_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only publish your own projects.' });
    }

    const newIsPublished = project.is_published === 1 ? 0 : 1;
    const updated = await db.update('projects', { is_published: newIsPublished }, 'id = $1', [projectId]);

    await db.logActivity(req.user.name, req.user.role, newIsPublished ? 'Published Project' : 'Unpublished Project', 'Projects', updated.name);
    res.json({ success: true, is_published: newIsPublished, project: updated });
  } catch (err) {
    console.error('Project publish toggle error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle publish status.' });
  }
});

export default router;
