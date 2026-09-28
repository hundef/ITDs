import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'nexora_enterprise_jwt_secret_key_2026';

export const ROLE_DEFAULT_PERMISSIONS = {
  super_admin: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish',
    'categories.manage', 'technologies.manage', 'services.manage', 'team.manage', 'testimonials.manage',
    'blogs.manage', 'inquiries.manage', 'inquiries.delete', 'settings.manage', 'users.view', 'users.create',
    'users.edit', 'users.delete', 'users.manage_security', 'security.audit', 'security.policy', 'system.reset'
  ],
  administrator: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish',
    'categories.manage', 'technologies.manage', 'services.manage', 'team.manage', 'testimonials.manage',
    'blogs.manage', 'inquiries.manage', 'settings.manage', 'users.view', 'users.create', 'users.edit',
    'users.manage_security', 'security.audit'
  ],
  project_manager: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.publish',
    'categories.manage', 'technologies.manage', 'inquiries.manage'
  ],
  content_manager: [
    'projects.view', 'services.manage', 'team.manage', 'testimonials.manage', 'blogs.manage',
    'inquiries.manage', 'settings.manage'
  ],
  viewer: ['projects.view']
};

export function hasPermission(user, permissionKey) {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  // Check custom user permissions overrides
  if (Array.isArray(user.custom_permissions) && user.custom_permissions.includes(permissionKey)) {
    return true;
  }

  // Check default role permissions
  const rolePerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  return rolePerms.includes(permissionKey);
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      status: user.status || 'active'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired authentication session.' });
    }

    try {
      const user = await db.findOne('users', 'id = $1', [decoded.id]);
      if (!user) {
        return res.status(403).json({ success: false, message: 'User account not found.' });
      }

      // Security Status verification
      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Account is currently suspended. Please contact a Super Admin for assistance.'
        });
      }

      if (user.status === 'locked') {
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
          const remainingMinutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
          return res.status(403).json({
            success: false,
            message: `Account is temporarily locked due to security policy. Please try again in ${remainingMinutes} minute(s) or contact an administrator.`
          });
        } else if (user.locked_until) {
          // Auto-unlock expired lockout
          await db.update('users', {
            status: 'active',
            failed_login_attempts: 0,
            locked_until: null
          }, 'id = $1', [user.id]);
          user.status = 'active';
          user.failed_login_attempts = 0;
          user.locked_until = null;
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
  });
}

// Role-Based Access Control Helper
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Super Admin always has full access
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Administrator has access to all standard management
    if (req.user.role === 'administrator' && !allowedRoles.includes('super_admin_only')) {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
    });
  };
}

// Granular Permission Access Control Helper
export function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (hasPermission(req.user, permissionKey)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires permission: '${permissionKey}'.`
    });
  };
}
