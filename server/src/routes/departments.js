import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/departments - Get all departments with member counts
router.get('/', async (req, res) => {
  try {
    // Get all departments from the departments table
    const departments = await db.find('departments', '', [], 'display_order ASC, name ASC');
    
    // Get team member counts for each department
    const team = await db.find('team_members', '', [], 'display_order ASC, name ASC');
    const deptCounts = {};
    team.forEach((m) => {
      if (m.department) {
        deptCounts[m.department] = (deptCounts[m.department] || 0) + 1;
      }
    });
    
    // Enrich departments with member counts
    const deptList = departments.map(d => ({
      name: d.name,
      count: deptCounts[d.name] || 0
    }));
    
    res.json({ success: true, departments: deptList });
  } catch (err) {
    console.error('Departments fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
});

// POST /api/departments - Admin / Team Manager
router.post('/', authenticateToken, requirePermission('team.manage'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Department name is required.' });

    // Check if department already exists
    const existing = await db.findOne('departments', 'name = $1', [name]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists.' });
    }

    // Create new department
    const newDept = await db.insert('departments', {
      id: Date.now(),
      name: name.trim(),
      description: description || '',
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Created Department', 'Departments', name);
    res.status(201).json({ success: true, department: { name: newDept.name, count: 0 } });
  } catch (err) {
    console.error('Department create error:', err);
    res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
});

// PUT /api/departments/:oldName - Admin / Team Manager
router.put('/:oldName', authenticateToken, requirePermission('team.manage'), async (req, res) => {
  try {
    const oldName = decodeURIComponent(req.params.oldName);
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Department name is required.' });

    // Update the department record
    const updated = await db.update('departments', 
      { 
        name: name.trim(), 
        description: description || '',
        updated_at: new Date().toISOString()
      }, 
      'name = $1', 
      [oldName]
    );
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Update all team members with the old department name to the new one
    const team = await db.find('team_members', 'department = $1', [oldName]);
    for (const member of team) {
      await db.update('team_members', { department: name.trim() }, 'id = $1', [member.id]);
    }

    await db.logActivity(req.user.name, req.user.role, 'Renamed Department', 'Departments', `${oldName} → ${name}`);
    res.json({ success: true, department: { name: name.trim(), count: team.length } });
  } catch (err) {
    console.error('Department update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
});

// DELETE /api/departments/:name - Admin / Team Manager
router.delete('/:name', authenticateToken, requirePermission('team.manage'), async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);

    // Delete the department record
    const deleted = await db.delete('departments', 'name = $1', [name]);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Clear the department field for all members in this department
    const team = await db.find('team_members', 'department = $1', [name]);
    for (const member of team) {
      await db.update('team_members', { department: '' }, 'id = $1', [member.id]);
    }

    await db.logActivity(req.user.name, req.user.role, 'Deleted Department', 'Departments', name);
    res.json({ success: true, message: 'Department removed and members updated.' });
  } catch (err) {
    console.error('Department delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
});

export default router;
