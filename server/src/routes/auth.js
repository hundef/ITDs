import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/db.js';
import { generateToken, authenticateToken, requirePermission } from '../middleware/auth.js';
import { seedDatabase } from '../db/seed.js';

const router = express.Router();

// Helper to sanitize user object for API responses
function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    title: u.title || 'Staff Member',
    department: u.department || 'Engineering',
    avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: u.status || 'active',
    custom_permissions: u.custom_permissions || [],
    two_factor_enabled: !!u.two_factor_enabled,
    failed_login_attempts: u.failed_login_attempts || 0,
    locked_until: u.locked_until || null,
    last_login_at: u.last_login_at || null,
    last_login_ip: u.last_login_ip || null,
    last_password_change: u.last_password_change || null,
    must_change_password: !!u.must_change_password,
    phone: u.phone || '',
    bio: u.bio || '',
    location: u.location || '',
    linkedin_url: u.linkedin_url || '',
    github_url: u.github_url || '',
    twitter_url: u.twitter_url || '',
    skills: Array.isArray(u.skills) ? u.skills : [],
    created_at: u.created_at,
    updated_at: u.updated_at
  };
}

// ==========================================
// 1. AUTHENTICATION & LOGIN
// ==========================================

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const policy = await db.getSecurityPolicy();
    const user = await db.findOne('users', 'LOWER(email) = LOWER($1)', [email]);

    if (!user) {
      await db.logSecurityEvent(null, 'Unknown User', email, 'LOGIN_FAILURE', 'warning', clientIp, userAgent, 'Login attempt for non-existent email address.');
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    // 1. Check if user is suspended
    if (user.status === 'suspended') {
      await db.logSecurityEvent(user.id, user.name, user.email, 'LOGIN_BLOCKED', 'alert', clientIp, userAgent, 'Blocked login attempt on suspended account.');
      return res.status(403).json({
        success: false,
        message: 'Account is currently suspended. Please contact a Super Admin.'
      });
    }

    // 2. Check if user is currently locked out
    if (user.status === 'locked' || (user.locked_until && new Date(user.locked_until) > new Date())) {
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const minutesLeft = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
        db.logSecurityEvent(user.id, user.name, user.email, 'LOGIN_BLOCKED', 'alert', clientIp, userAgent, `Login attempt while account is locked (${minutesLeft} mins remaining).`);
        return res.status(403).json({
          success: false,
          message: `Account is temporarily locked due to consecutive failed attempts. Try again in ${minutesLeft} minute(s) or contact an administrator.`
        });
      } else {
        // Lockout expired, reset
        await db.update('users', {
          status: 'active',
          failed_login_attempts: 0,
          locked_until: null
        }, 'id = $1', [user.id]);
      }
    }

    // 3. Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      const maxAttempts = policy.max_failed_attempts || 5;

      if (attempts >= maxAttempts) {
        const lockoutDuration = policy.lockout_duration_minutes || 15;
        const lockedUntil = new Date(Date.now() + lockoutDuration * 60000).toISOString();

        await db.update('users', {
          status: 'locked',
          failed_login_attempts: attempts,
          locked_until: lockedUntil
        }, 'id = $1', [user.id]);

        await db.logSecurityEvent(
          user.id,
          user.name,
          user.email,
          'ACCOUNT_LOCKED',
          'critical',
          clientIp,
          userAgent,
          `Account locked after ${attempts} consecutive failed password attempts. Locked for ${lockoutDuration} mins.`
        );

        return res.status(403).json({
          success: false,
          message: `Account locked after ${attempts} failed attempts. Cooldown: ${lockoutDuration} minutes.`
        });
      } else {
        await db.update('users', {
          failed_login_attempts: attempts
        }, 'id = $1', [user.id]);

        const attemptsLeft = maxAttempts - attempts;
        await db.logSecurityEvent(
          user.id,
          user.name,
          user.email,
          'LOGIN_FAILURE',
          'warning',
          clientIp,
          userAgent,
          `Failed password attempt (${attempts}/${maxAttempts}).`
        );

        return res.status(401).json({
          success: false,
          message: `Invalid credentials. ${attemptsLeft} attempt(s) remaining before security lockout.`
        });
      }
    }

    // 4. Successful login -> reset failed attempts and record metadata
    const updatedUser = await db.update('users', {
      status: 'active',
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      last_login_ip: clientIp
    }, 'id = $1', [user.id]);

    const token = generateToken(updatedUser);
    await db.logActivity(user.name, user.role, 'Logged In', 'Auth', `Authenticated from IP: ${clientIp}`);
    await db.logSecurityEvent(user.id, user.name, user.email, 'LOGIN_SUCCESS', 'info', clientIp, userAgent, `Successful authentication session created.`);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// POST /api/auth/demo-login (Quick 1-click role evaluation)
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'super_admin' } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Web Browser';

    const user = await db.findOne('users', 'role = $1 AND status != $2', [role, 'suspended']) || await db.findOne('users', '1=1', []);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Demo user not found for role: ' + role });
    }

    // For JSON fallback (no PostgreSQL), skip update to avoid corruption
    let updatedUser = user;
    try {
      updatedUser = await db.update('users', {
        last_login_at: new Date().toISOString(),
        last_login_ip: clientIp,
        failed_login_attempts: 0
      }, 'id = $1', [user.id]);
    } catch (err) {
      console.warn('⚠️  Could not update last login (JSON fallback), using original user data');
      updatedUser = user;
    }

    const token = generateToken(updatedUser);
    await db.logActivity(user.name, user.role, 'Demo Login', 'Auth', `Switched session to ${user.role}`);
    await db.logSecurityEvent(user.id, user.name, user.email, 'DEMO_LOGIN', 'info', clientIp, userAgent, `Demo evaluator switched session to role: ${user.role}`);

    res.json({
      success: true,
      message: `Logged in as ${user.name} (${user.role})`,
      token,
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
});

// ==========================================
// 2. USER MANAGEMENT & RBAC ENDPOINTS
// ==========================================

// GET /api/auth/users (Admin / Super Admin)
router.get('/users', authenticateToken, requirePermission('users.view'), async (req, res) => {
  try {
    const users = (await db.find('users')).map(sanitizeUser);
    res.json({ success: true, users });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// POST /api/auth/users (Create User)
router.post('/users', authenticateToken, requirePermission('users.create'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      title,
      department,
      avatar,
      phone,
      bio,
      location,
      linkedin_url,
      github_url,
      twitter_url,
      skills,
      custom_permissions,
      two_factor_enabled,
      must_change_password
    } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const policy = await db.getSecurityPolicy();
    if (password.length < (policy.password_min_length || 8)) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${policy.password_min_length || 8} characters long based on security policy.`
      });
    }

    const existing = await db.findOne('users', 'LOWER(email) = LOWER($1)', [email]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = Math.floor(Date.now() * 1000 + Math.random() * 1000); // Generate unique BIGINT ID
    const newUser = await db.insert('users', {
      id: userId,
      name,
      email,
      password_hash,
      role,
      title: title || 'Staff Member',
      department: department || 'Engineering',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: phone || '',
      bio: bio || '',
      location: location || '',
      linkedin_url: linkedin_url || '',
      github_url: github_url || '',
      twitter_url: twitter_url || '',
      skills: Array.isArray(skills) ? skills : [],
      status: 'active',
      custom_permissions: Array.isArray(custom_permissions) ? custom_permissions : [],
      two_factor_enabled: !!two_factor_enabled,
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: null,
      last_login_ip: null,
      last_password_change: new Date().toISOString(),
      must_change_password: !!must_change_password,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await db.logActivity(req.user.name, req.user.role, 'Created User', 'User', `${newUser.name} (${newUser.role})`);
    await db.logSecurityEvent(
      req.user.id,
      req.user.name,
      req.user.email,
      'USER_CREATED',
      'info',
      clientIp,
      'Web Browser',
      `Admin created new user account: ${newUser.name} <${newUser.email}> with role ${newUser.role}.`
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, message: err?.message || 'Failed to create user.' });
  }
});

// PUT /api/auth/users/:id (Update User / Staff Profile)
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    // Users can edit their own profile, but only admins can edit other users
    const isSelf = parseInt(req.user.id) === userId;
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'administrator';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own profile.' });
    }

    const {
      name,
      email,
      role,
      title,
      department,
      avatar,
      phone,
      bio,
      location,
      linkedin_url,
      github_url,
      twitter_url,
      skills,
      currentPassword,
      password,
      custom_permissions,
      status,
      two_factor_enabled
    } = req.body;

    const targetUser = await db.findOne('users', 'id = $1', [userId]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If changing email, check uniqueness if changed
    if (email && email.toLowerCase() !== targetUser.email.toLowerCase()) {
      const existingEmail = await db.findOne('users', 'LOWER(email) = LOWER($1) AND id != $2', [email, userId]);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'This email address is already taken by another account.' });
      }
    }

    const updates = {
      name: req.user.role === 'super_admin' ? name : undefined,
      email: req.user.role === 'super_admin' ? email : undefined,
      title: req.user.role === 'super_admin' ? title : undefined,
      department: req.user.role === 'super_admin' ? department : undefined,
      avatar,
      phone,
      bio,
      location,
      linkedin_url,
      github_url,
      twitter_url,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills : []) : undefined
    };

    // Only admin can change role, status, or custom_permissions
    if (isAdmin) {
      if (role) updates.role = role;
      if (status) updates.status = status;
    }
    
    // Custom permissions can be updated by admins only via the dedicated PATCH endpoint
    // Do NOT include custom_permissions in PUT endpoint to force use of proper permission validation

    if (two_factor_enabled !== undefined) {
      updates.two_factor_enabled = !!two_factor_enabled;
    }

    if (password) {
      // If user is editing their own password, optionally check current password if provided
      if (isSelf && currentPassword) {
        const validCurrent = await bcrypt.compare(currentPassword, targetUser.password_hash);
        if (!validCurrent) {
          return res.status(400).json({ success: false, message: 'Current password entered is incorrect.' });
        }
      }

      const policy = await db.getSecurityPolicy();
      if (password.length < (policy.password_min_length || 8)) {
        return res.status(400).json({
          success: false,
          message: `Password must be at least ${policy.password_min_length || 8} characters.`
        });
      }
      updates.password_hash = await bcrypt.hash(password, 10);
      updates.last_password_change = new Date().toISOString();
      updates.must_change_password = false;

      db.logSecurityEvent(
        userId,
        targetUser.name,
        targetUser.email,
        'PASSWORD_CHANGED',
        'info',
        clientIp,
        'Web Browser',
        `Password updated by ${req.user.name}.`
      );
    }

    // Clean undefined
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const updated = await db.update('users', updates, 'id = $1', [userId]);

    await db.logActivity(req.user.name, req.user.role, 'Updated User', 'User', `${updated.name}`);
    await db.logSecurityEvent(
      req.user.id,
      req.user.name,
      req.user.email,
      'USER_UPDATED',
      'info',
      clientIp,
      'Web Browser',
      `Updated user profile & security details for ${updated.name} (ID: ${userId}).`
    );

    res.json({
      success: true,
      message: 'User profile updated successfully.',
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// PATCH /api/auth/users/:id/status (Toggle status: active | suspended | locked)
router.patch('/users/:id/status', authenticateToken, requirePermission('users.edit'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    if (!['active', 'suspended', 'locked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Choose: active, suspended, or locked.' });
    }

    if (userId === req.user.id && status !== 'active') {
      return res.status(400).json({ success: false, message: 'You cannot suspend or lock your own active account.' });
    }

    const updates = { status };
    if (status === 'active') {
      updates.failed_login_attempts = 0;
      updates.locked_until = null;
    }

    const updated = await db.update('users', updates, 'id = $1', [userId]);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const eventType = status === 'active' ? 'ACCOUNT_UNLOCKED' : (status === 'suspended' ? 'USER_SUSPENDED' : 'ACCOUNT_LOCKED');
    const severity = status === 'suspended' ? 'critical' : (status === 'locked' ? 'warning' : 'info');

    await db.logSecurityEvent(
      userId,
      updated.name,
      updated.email,
      eventType,
      severity,
      clientIp,
      'Web Browser',
      `Admin ${req.user.name} changed user status to [${status.toUpperCase()}].`
    );

    res.json({
      success: true,
      message: `User status changed to ${status}.`,
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Status toggle error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
});

// POST /api/auth/users/:id/reset-password (Generate random temporary password)
router.post('/users/:id/reset-password', authenticateToken, requirePermission('users.manage_security'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    const user = await db.findOne('users', 'id = $1', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Generate secure temporary password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let tempPassword = '';
    const randomBytes = crypto.randomBytes(12);
    for (let i = 0; i < 12; i++) {
      tempPassword += chars[randomBytes[i] % chars.length];
    }

    const password_hash = await bcrypt.hash(tempPassword, 10);
    const updated = await db.update('users', {
      password_hash,
      must_change_password: true,
      failed_login_attempts: 0,
      locked_until: null,
      status: user.status === 'locked' ? 'active' : user.status,
      last_password_change: new Date().toISOString()
    }, 'id = $1', [userId]);

    await db.logSecurityEvent(
      userId,
      user.name,
      user.email,
      'PASSWORD_RESET_FORCED',
      'warning',
      clientIp,
      'Web Browser',
      `Admin ${req.user.name} generated temporary password and required change on next login.`
    );

    res.json({
      success: true,
      message: 'Temporary password generated successfully.',
      temporaryPassword: tempPassword,
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// PATCH /api/auth/users/:id/permissions (Update Granular Permissions)
router.patch('/users/:id/permissions', authenticateToken, requirePermission('users.manage_security'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { permissions } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'Permissions must be an array of string scopes.' });
    }

    const updated = await db.update('users', {
      custom_permissions: permissions
    }, 'id = $1', [userId]);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await db.logSecurityEvent(
      userId,
      updated.name,
      updated.email,
      'PERMISSIONS_UPDATED',
      'warning',
      clientIp,
      'Web Browser',
      `Super Admin ${req.user.name} updated custom granular permissions (${permissions.length} active permissions).`
    );

    res.json({
      success: true,
      message: 'Granular permissions updated successfully.',
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Update permissions error:', err);
    res.status(500).json({ success: false, message: 'Failed to update permissions.' });
  }
});

// PATCH /api/auth/users/:id/2fa (Toggle 2FA)
router.patch('/users/:id/2fa', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    const isSelf = req.user.id === userId;
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isSelf && !isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const targetUser = await db.findOne('users', 'id = $1', [userId]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const new2FAState = !targetUser.two_factor_enabled;
    const recoveryCodes = new2FAState ? [
      crypto.randomBytes(4).toString('hex').toUpperCase(),
      crypto.randomBytes(4).toString('hex').toUpperCase(),
      crypto.randomBytes(4).toString('hex').toUpperCase(),
      crypto.randomBytes(4).toString('hex').toUpperCase()
    ] : [];

    const updated = await db.update('users', {
      two_factor_enabled: new2FAState,
      two_factor_secret: new2FAState ? crypto.randomBytes(16).toString('hex') : null,
      two_factor_recovery_codes: recoveryCodes
    }, 'id = $1', [userId]);

    await db.logSecurityEvent(
      userId,
      targetUser.name,
      targetUser.email,
      '2FA_TOGGLED',
      'info',
      clientIp,
      'Web Browser',
      `Two-Factor Authentication (2FA) was ${new2FAState ? 'ENABLED' : 'DISABLED'}.`
    );

    res.json({
      success: true,
      message: `2FA ${new2FAState ? 'enabled' : 'disabled'} successfully.`,
      two_factor_enabled: new2FAState,
      recoveryCodes: new2FAState ? recoveryCodes : [],
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('2FA toggle error:', err);
    res.status(500).json({ success: false, message: 'Failed to update 2FA.' });
  }
});

// DELETE /api/auth/users/:id (Delete user)
router.delete('/users/:id', authenticateToken, requirePermission('users.delete'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account.' });
    }

    const target = await db.findOne('users', 'id = $1', [userId]);
    const deleted = await db.delete('users', 'id = $1', [userId]);

    if (deleted) {
      await db.logActivity(req.user.name, req.user.role, 'Deleted User', 'User', target?.name || `ID ${userId}`);
      await db.logSecurityEvent(
        userId,
        target?.name || 'Deleted Account',
        target?.email || 'unknown',
        'USER_DELETED',
        'critical',
        clientIp,
        'Web Browser',
        `Super Admin ${req.user.name} permanently deleted staff user ${target?.name}.`
      );
      res.json({ success: true, message: 'User account removed.' });
    } else {
      res.status(404).json({ success: false, message: 'User not found.' });
    }
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// ==========================================
// 3. SECURITY AUDIT LOGS & POLICIES
// ==========================================

// GET /api/auth/activity-logs (Activity/Audit Trail for all user actions)
router.get('/activity-logs', authenticateToken, requirePermission('security.audit'), async (req, res) => {
  try {
    const { action, target_type, user_name, search, limit = 200 } = req.query;

    let logs = await db.find('activity_logs');

    if (action && action !== 'all') {
      logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }

    if (target_type && target_type !== 'all') {
      logs = logs.filter(l => l.target_type === target_type);
    }

    if (user_name && user_name !== 'all') {
      logs = logs.filter(l => l.user_name.toLowerCase().includes(user_name.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.user_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target_type.toLowerCase().includes(q) ||
        l.target_name.toLowerCase().includes(q) ||
        (l.details && l.details.toLowerCase().includes(q))
      );
    }

    // Sort descending by timestamp
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Limit results
    const safeLimit = Math.min(parseInt(limit) || 200, 1000);
    logs = logs.slice(0, safeLimit);

    res.json({ success: true, logs, total: logs.length });
  } catch (err) {
    console.error('Activity logs retrieval error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve activity logs.' });
  }
});

// GET /api/auth/security-logs (Audit Trail)
router.get('/security-logs', authenticateToken, requirePermission('security.audit'), async (req, res) => {
  try {
    const { severity, event_type, user_id, search, limit = 100 } = req.query;

    let logs = await db.find('security_logs');

    if (severity && severity !== 'all') {
      logs = logs.filter(l => l.severity.toLowerCase() === severity.toLowerCase());
    }

    if (event_type && event_type !== 'all') {
      logs = logs.filter(l => l.event_type.toLowerCase() === event_type.toLowerCase());
    }

    if (user_id) {
      logs = logs.filter(l => l.user_id === parseInt(user_id));
    }

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.user_name.toLowerCase().includes(q) ||
        l.user_email.toLowerCase().includes(q) ||
        l.event_type.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.ip_address.includes(q)
      );
    }

    // Sort descending by timestamp
    const sorted = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paginated = sorted.slice(0, parseInt(limit));

    res.json({
      success: true,
      total: logs.length,
      logs: paginated
    });
  } catch (err) {
    console.error('Security logs error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve security logs.' });
  }
});

// GET /api/auth/security-stats (KPI Metrics for Security Overview)
router.get('/security-stats', authenticateToken, requirePermission('security.audit'), async (req, res) => {
  try {
    const users = await db.find('users');
    const logs = await db.find('security_logs');

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active' || !u.status).length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;
    const lockedUsers = users.filter(u => u.status === 'locked').length;
    const twoFactorCount = users.filter(u => u.two_factor_enabled).length;
    const twoFactorPercentage = totalUsers > 0 ? Math.round((twoFactorCount / totalUsers) * 100) : 0;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const failedLogins24h = logs.filter(l =>
      (l.event_type === 'LOGIN_FAILURE' || l.event_type === 'ACCOUNT_LOCKED') &&
      new Date(l.created_at) >= oneDayAgo
    ).length;

    const recentAlerts = logs.filter(l =>
      (l.severity === 'critical' || l.severity === 'alert') &&
      new Date(l.created_at) >= oneDayAgo
    ).length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        lockedUsers,
        twoFactorCount,
        twoFactorPercentage,
        failedLogins24h,
        recentAlerts
      }
    });
  } catch (err) {
    console.error('Security stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve security stats.' });
  }
});

// GET /api/auth/security-policy (Get Policy)
router.get('/security-policy', authenticateToken, requirePermission('security.policy'), async (req, res) => {
  try {
    const policy = await db.getSecurityPolicy();
    res.json({ success: true, policy });
  } catch (err) {
    console.error('Get security policy error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve security policy.' });
  }
});

// PUT /api/auth/security-policy (Update Policy)
router.put('/security-policy', authenticateToken, requirePermission('security.policy'), async (req, res) => {
  try {
    const updates = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';

    // Update security policy in database
    const policy = await db.update('security_policy', updates, 'id = $1', [1]);

    await db.logActivity(req.user.name, req.user.role, 'Updated Security Policy', 'Security', 'Hardened enterprise security policy settings');
    await db.logSecurityEvent(
      req.user.id,
      req.user.name,
      req.user.email,
      'SECURITY_POLICY_UPDATED',
      'critical',
      clientIp,
      'Web Browser',
      `Super Admin ${req.user.name} modified global security rules (Max failed attempts: ${policy?.max_failed_attempts || updates.max_failed_attempts}, Lockout cooldown: ${policy?.lockout_duration_minutes || updates.lockout_duration_minutes}m).`
    );

    res.json({
      success: true,
      message: 'Security policy settings updated successfully.',
      policy
    });
  } catch (err) {
    console.error('Security policy update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update security policy.' });
  }
});

// POST /api/auth/reset-db (Super Admin only - reset & seed)
router.post('/reset-db', authenticateToken, requirePermission('system.reset'), async (req, res) => {
  try {
    await seedDatabase(true);
    await db.logActivity(req.user.name, req.user.role, 'Reset Database', 'System', 'Re-seeded full sample dataset');
    res.json({ success: true, message: 'Database reset and re-seeded successfully.' });
  } catch (err) {
    console.error('Reset DB error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset database.' });
  }
});

export default router;
