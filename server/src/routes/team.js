import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/team - Public (list all members)
router.get('/', async (req, res) => {
  try {
    const team = await db.find('team_members', '', [], 'display_order ASC, name ASC');
    res.json({ success: true, team });
  } catch (err) {
    console.error('Team fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch team members.' });
  }
});

// GET /api/team/list - Get departments list
router.get('/list', async (req, res) => {
  try {
    const team = await db.find('team_members', '', [], 'display_order ASC');
    
    // Extract unique departments and count members
    const deptMap = {};
    team.forEach((member) => {
      if (member.department && member.department.trim()) {
        deptMap[member.department] = (deptMap[member.department] || 0) + 1;
      }
    });
    
    const departments = Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({ success: true, departments, count: departments.length });
  } catch (err) {
    console.error('Departments fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
});

// POST /api/team - Admin / Content Manager
router.post('/', authenticateToken, requirePermission('team.manage'), async (req, res) => {
  try {
    const { name, role, department, title, bio, avatar, email, phone, linkedin_url, github_url, twitter_url, display_order, is_active, is_leadership, is_visible } = req.body;
    if (!name || !role) return res.status(400).json({ success: false, message: 'Name and role are required.' });

    const newMember = await db.insert('team_members', {
      id: Date.now(),
      name,
      role,
      department: department || '',
      title: title || role,
      bio: bio || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      email: email || '',
      phone: phone || '',
      linkedin_url: linkedin_url || '',
      github_url: github_url || '',
      twitter_url: twitter_url || '',
      display_order: display_order ? parseInt(display_order) : 10,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
      is_leadership: is_leadership ? 1 : 0,
      is_visible: is_visible !== undefined ? (is_visible ? 1 : 0) : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Added Team Member', 'Team', newMember.name);
    res.status(201).json({ success: true, teamMember: newMember });
  } catch (err) {
    console.error('Team create error:', err);
    res.status(500).json({ success: false, message: 'Failed to add team member.' });
  }
});

// PUT /api/team/:id
router.put('/:id', authenticateToken, requirePermission('team.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, role, department, title, bio, avatar, email, phone, linkedin_url, github_url, twitter_url, display_order, is_active, is_leadership, is_visible } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (title !== undefined) updates.title = title;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
    if (github_url !== undefined) updates.github_url = github_url;
    if (twitter_url !== undefined) updates.twitter_url = twitter_url;
    if (display_order !== undefined) updates.display_order = parseInt(display_order);
    if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;
    if (is_leadership !== undefined) updates.is_leadership = is_leadership ? 1 : 0;
    if (is_visible !== undefined) updates.is_visible = is_visible ? 1 : 0;

    const updated = await db.update('team_members', updates, 'id = $1', [id]);
    if (!updated) return res.status(404).json({ success: false, message: 'Team member not found.' });

    await db.logActivity(req.user.name, req.user.role, 'Updated Team Member', 'Team', updated.name);
    res.json({ success: true, teamMember: updated });
  } catch (err) {
    console.error('Team update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update team member.' });
  }
});

// DELETE /api/team/:id
router.delete('/:id', authenticateToken, requirePermission('team.manage'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const target = await db.findOne('team_members', 'id = $1', [id]);

    if (!target) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }

    await db.delete('team_members', 'id = $1', [id]);
    await db.logActivity(req.user.name, req.user.role, 'Deleted Team Member', 'Team', target.name || `ID ${id}`);
    
    res.json({ success: true, message: 'Team member removed.' });
  } catch (err) {
    console.error('Team delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete team member.' });
  }
});

export default router;
