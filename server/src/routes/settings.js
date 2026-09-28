import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings - Public
router.get('/', async (req, res) => {
  const settings = await db.getAllSettings();
  let core_values = [];
  let insights = [];
  
  try {
    if (settings.core_values_json) {
      core_values = JSON.parse(settings.core_values_json);
    }
  } catch (e) {
    core_values = [];
  }
  
  try {
    if (settings.insights_json) {
      insights = JSON.parse(settings.insights_json);
    }
  } catch (e) {
    insights = [];
  }

  res.json({
    success: true,
    settings: {
      ...settings,
      core_values,
      insights
    }
  });
});

// PUT /api/settings - Admin / Content Manager
router.put('/', authenticateToken, requirePermission('settings.manage'), async (req, res) => {
  try {
    const incoming = req.body;
    if (incoming.core_values && Array.isArray(incoming.core_values)) {
      incoming.core_values_json = JSON.stringify(incoming.core_values);
      delete incoming.core_values;
    }
    
    if (incoming.insights && Array.isArray(incoming.insights)) {
      incoming.insights_json = JSON.stringify(incoming.insights);
      delete incoming.insights;
    }

    const updated = await db.setMultipleSettings(incoming);
    await db.logActivity(req.user.name, req.user.role, 'Updated Website Settings', 'Settings', 'Updated company CMS settings');

    let core_values = [];
    let insights = [];
    
    try {
      if (updated.core_values_json) {
        core_values = JSON.parse(updated.core_values_json);
      }
    } catch (e) {
      core_values = [];
    }
    
    try {
      if (updated.insights_json) {
        insights = JSON.parse(updated.insights_json);
      }
    } catch (e) {
      insights = [];
    }

    res.json({
      success: true,
      message: 'Website settings updated successfully.',
      settings: {
        ...updated,
        core_values,
        insights
      }
    });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update website settings.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
