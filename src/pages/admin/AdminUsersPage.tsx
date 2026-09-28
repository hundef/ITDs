import React, { useEffect, useState, useMemo } from 'react';
import { User, UserRole, UserStatus, SecurityLog, SecurityPolicy, SecurityStats, PermissionDefinition } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { RoleBadge } from '../../components/common/Badge';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Edit,
  Trash2,
  RotateCcw,
  Sparkles,
  Mail,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Sliders,
  Eye,
  EyeOff,
  Copy,
  Download,
  RefreshCw,
  Clock,
  Laptop,
  Activity,
  CheckCircle2,
  Key,
  Smartphone,
  SlidersHorizontal,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Building,
  Hash,
  Upload,
  Camera,
  Loader2
} from 'lucide-react';

const PERMISSION_SCOPES: PermissionDefinition[] = [
  { id: 'projects.view', name: 'View Projects', category: 'Projects', description: 'Access internal project listings and drafts.' },
  { id: 'projects.create', name: 'Create Projects', category: 'Projects', description: 'Create new project showcase records.' },
  { id: 'projects.edit', name: 'Edit Projects', category: 'Projects', description: 'Modify project details, media, and features.' },
  { id: 'projects.publish', name: 'Publish Projects', category: 'Projects', description: 'Toggle live visibility on the public website.' },
  { id: 'projects.delete', name: 'Delete Projects', category: 'Projects', description: 'Permanently remove projects from database.' },
  { id: 'categories.manage', name: 'Manage Categories & Tech', category: 'Taxonomy', description: 'Create and edit categories and technology stack tags.' },
  { id: 'services.manage', name: 'Manage Services & Offerings', category: 'Content', description: 'Create and edit service catalog offerings.' },
  { id: 'team.manage', name: 'Manage Team Roster', category: 'Content', description: 'Add, update, or remove leadership team profiles.' },
  { id: 'testimonials.manage', name: 'Manage Client Endorsements', category: 'Content', description: 'Approve and feature client testimonials.' },
  { id: 'blogs.manage', name: 'Publish Insights & Blogs', category: 'Content', description: 'Draft, publish, and delete technical articles.' },
  { id: 'inquiries.manage', name: 'Manage Contact Inquiries', category: 'Inquiries', description: 'Review, update status, and add internal notes to leads.' },
  { id: 'inquiries.delete', name: 'Delete Inquiries', category: 'Inquiries', description: 'Permanently remove customer inquiry records.' },
  { id: 'settings.manage', name: 'Modify Website Settings', category: 'Administration', description: 'Update company brand, contacts, values, and SEO meta.' },
  { id: 'users.view', name: 'View User Directory', category: 'IAM & Security', description: 'Browse staff user accounts and roles.' },
  { id: 'users.create', name: 'Create Staff Users', category: 'IAM & Security', description: 'Provision new employee credentials.' },
  { id: 'users.edit', name: 'Edit Staff Accounts', category: 'IAM & Security', description: 'Update profile information and security settings.' },
  { id: 'users.manage_security', name: 'Security Moderation', category: 'IAM & Security', description: 'Suspend accounts, unlock lockouts, and reset passwords.' },
  { id: 'users.delete', name: 'Delete Accounts', category: 'IAM & Security', description: 'Permanently delete staff user accounts.' },
  { id: 'security.audit', name: 'Access Security Audit Trail', category: 'IAM & Security', description: 'Inspect real-time authentication logs and security events.' },
  { id: 'security.policy', name: 'Configure Security Policies', category: 'IAM & Security', description: 'Modify brute-force thresholds, lockout timers, and 2FA.' },
  { id: 'system.reset', name: 'Database Maintenance & Reset', category: 'System', description: 'Execute full sample database re-seeding and purge.' }
];

// Helper to evaluate password entropy
function calculatePasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: 'None', color: 'bg-slate-300 dark:bg-slate-700' };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-rose-500 text-rose-500' };
  if (score === 3) return { score: 50, label: 'Fair', color: 'bg-amber-500 text-amber-500' };
  if (score === 4) return { score: 75, label: 'Strong', color: 'bg-indigo-500 text-indigo-500' };
  return { score: 100, label: 'Exceptional', color: 'bg-emerald-500 text-emerald-500' };
}

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser, hasPermission, refreshUser } = useAuth();
  const { success, error } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'audit' | 'policy'>('users');

  // Core Data
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [policy, setPolicy] = useState<SecurityPolicy>({
    max_failed_attempts: 5,
    lockout_duration_minutes: 15,
    session_timeout_hours: 168,
    require_2fa_for_admins: false,
    password_min_length: 8,
    password_require_special: true,
    password_require_number: true,
    password_expiry_days: 90
  });

  // User Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [twoFactorFilter, setTwoFactorFilter] = useState<string>('all');

  // Audit Logs Filtering
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('all');
  const [logEventTypeFilter, setLogEventTypeFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalTab, setUserModalTab] = useState<'identity' | 'permissions' | 'security'>('identity');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'project_manager' as UserRole,
    title: 'Senior Systems Architect',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active' as UserStatus,
    custom_permissions: [] as string[],
    two_factor_enabled: false,
    must_change_password: false
  });

  // Temporary Password Modal state
  const [tempPassModalOpen, setTempPassModalOpen] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<{ userName: string; tempPass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // 2FA Setup Modal
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorTarget, setTwoFactorTarget] = useState<{ user: User; codes: string[] } | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, avatar: res.url }));
        success('Avatar photo uploaded successfully!');
      } else {
        error(res.message || 'Failed to upload photo.');
      }
    } catch (err: any) {
      error(err.message || 'Avatar upload failed.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Fetch Users & Stats
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, statsRes, policyRes, logsRes, teamRes] = await Promise.all([
        api.users.getAll(),
        api.security.getStats().catch(() => ({ success: false, stats: null })),
        api.security.getPolicy().catch(() => ({ success: false, policy: null })),
        api.security.getLogs().catch(() => ({ success: false, logs: [] })),
        api.team.getAll().catch(() => ({ success: false, team: [] }))
      ]);

      if (usersRes.users) setUsers(usersRes.users);
      if (statsRes.stats) setStats(statsRes.stats);
      if (policyRes.policy) setPolicy(policyRes.policy);
      if (logsRes.logs) setSecurityLogs(logsRes.logs);
      
      // Extract unique departments from team members
      if (teamRes.team && Array.isArray(teamRes.team)) {
        const depts = Array.from(new Set(teamRes.team.map(m => m.department).filter(Boolean))) as string[];
        setDepartments(depts.sort());
      }
    } catch (err) {
      console.error('Failed to load user security data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.title && u.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
      const matches2FA =
        twoFactorFilter === 'all' ||
        (twoFactorFilter === 'enabled' && u.two_factor_enabled) ||
        (twoFactorFilter === 'disabled' && !u.two_factor_enabled);

      return matchesSearch && matchesRole && matchesStatus && matches2FA;
    });
  }, [users, searchQuery, roleFilter, statusFilter, twoFactorFilter]);

  // Filtered Security Logs List
  const filteredLogs = useMemo(() => {
    return securityLogs.filter(l => {
      const matchesSeverity = logSeverityFilter === 'all' || l.severity === logSeverityFilter;
      const matchesType = logEventTypeFilter === 'all' || l.event_type === logEventTypeFilter;
      const matchesSearch =
        !logSearchQuery ||
        l.user_name.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.user_email.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.event_type.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.ip_address.includes(logSearchQuery);

      return matchesSeverity && matchesType && matchesSearch;
    });
  }, [securityLogs, logSeverityFilter, logEventTypeFilter, logSearchQuery]);

  // Open Modal to Add User
  const handleOpenAdd = async () => {
    setEditingId(null);
    setUserModalTab('identity');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'project_manager',
      title: 'Senior Systems Architect',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      custom_permissions: [],
      two_factor_enabled: false,
      must_change_password: false
    });
    
    setUserModalOpen(true);
  };

  // Open Modal to Edit User
  const handleOpenEdit = async (u: User) => {
    setEditingId(u.id);
    setUserModalTab('identity');
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      title: u.title || 'Staff Member',
      department: u.department || 'Engineering',
      avatar: u.avatar || '',
      status: u.status || 'active',
      custom_permissions: u.custom_permissions || [],
      two_factor_enabled: !!u.two_factor_enabled,
      must_change_password: !!u.must_change_password
    });
    
    setUserModalOpen(true);
  };

  // Save User (Create or Update) - Identity & Role Changes
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require name and email if we're actually trying to save user profile
    // (not just saving permissions from the permissions tab)
    if (userModalTab === 'identity' && (!formData.name || !formData.email)) {
      error('Name and email are required.');
      return;
    }

    setIsSavingUser(true);
    try {
      if (editingId) {
        // Check if we're only updating permissions (user didn't modify profile)
        const originalUser = users.find(u => u.id === editingId);
        const profileChanged = 
          formData.name !== originalUser?.name ||
          formData.email !== originalUser?.email ||
          formData.role !== originalUser?.role ||
          formData.title !== originalUser?.title ||
          formData.department !== originalUser?.department ||
          formData.avatar !== originalUser?.avatar ||
          formData.status !== originalUser?.status ||
          (formData.password && formData.password.trim() !== ''); // Password counts as change if not empty

        // Only send profile update if something changed
        if (profileChanged) {
          const dataToSave: any = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            title: formData.title,
            department: formData.department,
            avatar: formData.avatar,
            status: formData.status,
            two_factor_enabled: formData.two_factor_enabled,
            must_change_password: formData.must_change_password
          };
          
          // Include password if it was changed (not empty)
          if (formData.password && formData.password.trim()) {
            dataToSave.password = formData.password;
          }
          
          await api.users.update(editingId, dataToSave);
          success('User profile updated successfully.');
        }
        
        // If permissions were modified, save them separately via PATCH endpoint
        const originalPerms = originalUser?.custom_permissions || [];
        if (JSON.stringify(formData.custom_permissions) !== JSON.stringify(originalPerms)) {
          await handleSavePermissions(editingId, formData.custom_permissions);
        }
        
        // Only show success if something was updated
        if (!profileChanged && JSON.stringify(formData.custom_permissions) === JSON.stringify(originalPerms)) {
          error('No changes were made.');
          return;
        }
        
        // Refresh current user session if editing self
        if (editingId === currentUser?.id) {
          await refreshUser();
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          error('Name, email, and password are required for new accounts.');
          return;
        }
        await api.users.create(formData);
        success('New staff user account provisioned successfully.');
      }
      setUserModalOpen(false);
      await fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save user account.');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Save Permissions Only (via dedicated PATCH endpoint)
  const handleSavePermissions = async (userId: number, permissions: string[]) => {
    try {
      const res = await api.users.updatePermissions(userId, permissions);
      if (res.success) {
        success('Custom permissions updated successfully.');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, custom_permissions: permissions } : u));
        
        // Refresh current user if updating self
        if (userId === currentUser?.id) {
          await refreshUser();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to update permissions.');
    }
  };

  // Toggle Account Status (Active <-> Suspended, or Unlock)
  const handleToggleStatus = async (user: User, newStatus: UserStatus) => {
    if (user.id === currentUser?.id && newStatus !== 'active') {
      error('You cannot suspend or lock your own active session.');
      return;
    }

    const actionText = newStatus === 'suspended' ? 'suspend' : (newStatus === 'locked' ? 'lock' : 'activate');
    const isDangerous = newStatus !== 'active';
    
    setConfirmDialog({
      isOpen: true,
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Account?`,
      message: `Are you sure you want to ${actionText} the account for "${user.name}"?`,
      isDangerous,
      onConfirm: async () => {
        try {
          const res = await api.users.toggleStatus(user.id, newStatus);
          if (res.success) {
            success(`Account for ${user.name} is now ${newStatus.toUpperCase()}.`);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            fetchData();
          }
        } catch (err: any) {
          error(err.message || 'Failed to change status.');
        }
      }
    });
  };

  // Generate Temporary Password
  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Generate a secure temporary password for "${user.name}"? The user will be required to choose a new password upon their next login.`)) {
      return;
    }

    try {
      const res = await api.users.resetPassword(user.id);
      if (res.success) {
        setTempPasswordData({
          userName: user.name,
          tempPass: res.temporaryPassword
        });
        setCopiedPass(false);
        setTempPassModalOpen(true);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to reset password.');
    }
  };

  // Toggle 2FA on User
  const handleToggle2FA = async (user: User) => {
    try {
      const res = await api.users.toggle2FA(user.id);
      if (res.success) {
        if (res.two_factor_enabled) {
          setTwoFactorTarget({ user, codes: res.recoveryCodes || [] });
          setTwoFactorModalOpen(true);
        } else {
          success(`2FA disabled for ${user.name}.`);
        }
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle 2FA.');
    }
  };

  // Delete User
  const handleDeleteUser = async (id: number, name: string) => {
    if (id === currentUser?.id) {
      error('You cannot delete your own active account.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Permanent Action',
      message: `Are you sure you want to delete staff account "${name}"? This action cannot be undone.`,
      isDangerous: true,
      onConfirm: async () => {
        try {
          await api.users.delete(id);
          success(`User account "${name}" removed.`);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          fetchData();
        } catch (err: any) {
          error(err.message || 'Failed to delete user.');
        }
      }
    });
  };

  // Save Global Security Policy
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('security.policy')) {
      error('Only users with security.policy permission can update platform security policies.');
      return;
    }

    setIsSavingPolicy(true);
    try {
      const res = await api.security.updatePolicy(policy);
      if (res.success) {
        success('Platform security policy updated successfully.');
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update security policy.');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Export Audit Logs to JSON
  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(securityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `security_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Security audit trail exported to JSON.');
  };

  // Reset Database
  const handleResetDatabase = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Database',
      message: 'Reset and re-seed the entire sample database? All sample projects, users, security policies, and activity logs will be reinitialized.',
      isDangerous: true,
      onConfirm: async () => {
        setIsResetting(true);
        try {
          const res = await api.users.resetDb();
          if (res.success) {
            success('Database reset and re-seeded successfully.');
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            fetchData();
          }
        } catch (err: any) {
          error(err.message || 'Failed to reset database.');
        } finally {
          setIsResetting(false);
        }
      }
    });
  };

  // Copy Temporary Password
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
    success('Copied temporary password to clipboard.');
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
                <span>Identity & Access Management (IAM)</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Zero-Trust Security
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage staff credentials, Role-Based Access Control (RBAC), brute-force lockout, and audit trails.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasPermission('system.reset') && (
            <button
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-300 dark:border-amber-800 transition-colors shadow-2xs"
              title="Reset sample enterprise data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting DB...' : 'Reset & Re-Seed'}</span>
            </button>
          )}

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="Refresh Security Status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        </div>
      </div>

      {/* Security Health KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Staff Users</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">
                {stats?.totalUsers ?? users.length}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold">
                {stats?.activeUsers ?? users.filter(u => u.status === 'active' || !u.status).length} Active
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2FA Enforced</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">
                {stats ? `${stats.twoFactorPercentage}%` : `${Math.round((users.filter(u => u.two_factor_enabled).length / (users.length || 1)) * 100)}%`}
              </span>
              <span className="text-[10px] text-slate-400">
                {users.filter(u => u.two_factor_enabled).length} users
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suspended</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">
                {users.filter(u => u.status === 'suspended').length}
              </span>
              <span className="text-[10px] text-amber-500 font-bold">Restricted</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Locked Accounts</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">
                {users.filter(u => u.status === 'locked').length}
              </span>
              <span className="text-[10px] text-rose-500 font-bold">Brute-Force</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Security Alerts (24h)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">
                {stats?.recentAlerts ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & IAM</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {filteredUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'permissions'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>RBAC Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {filteredLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'policy'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Hardening Policies</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USER ACCOUNTS DIRECTORY & MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, email, title, or department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="administrator">Administrator</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="content_manager">Content Manager</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Accounts</option>
                  <option value="suspended">Suspended</option>
                  <option value="locked">Locked Out</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <select
                  value={twoFactorFilter}
                  onChange={e => setTwoFactorFilter(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All 2FA States</option>
                  <option value="enabled">2FA Protected</option>
                  <option value="disabled">2FA Disabled</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Accounts Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-4 px-6">User & Identity</th>
                    <th className="py-4 px-4">Role & Department</th>
                    <th className="py-4 px-4">Account Status</th>
                    <th className="py-4 px-4">Security & 2FA</th>
                    <th className="py-4 px-4">Last Activity</th>
                    <th className="py-4 px-6 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No staff user accounts matching the specified filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const userStatus = u.status || 'active';
                      const isSelf = u.id === currentUser?.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                          {/* User & Identity */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="relative">
                                <img
                                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={u.name}
                                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                {userStatus === 'active' && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Active" />
                                )}
                                {userStatus === 'suspended' && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900" title="Suspended" />
                                )}
                                {userStatus === 'locked' && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" title="Locked" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                    {u.name}
                                  </span>
                                  {isSelf && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-mono">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role & Department */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <RoleBadge role={u.role} />
                            </div>
                          </td>

                          {/* Account Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {userStatus === 'active' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </span>
                            )}
                            {userStatus === 'suspended' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Suspended</span>
                              </span>
                            )}
                            {userStatus === 'locked' && (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Locked Out</span>
                                </span>
                                {u.failed_login_attempts ? (
                                  <span className="text-[10px] text-rose-500 block font-mono">
                                    {u.failed_login_attempts} failed attempts
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </td>

                          {/* Security & 2FA */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {u.two_factor_enabled ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                    <Smartphone className="w-3 h-3" />
                                    <span>2FA Active</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    <Shield className="w-3 h-3 text-slate-400" />
                                    <span>2FA Off</span>
                                  </span>
                                )}
                              </div>
                              {u.custom_permissions && u.custom_permissions.length > 0 && (
                                <span className="text-[10px] text-indigo-500 font-semibold block">
                                  +{u.custom_permissions.length} custom permissions
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Last Activity */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {u.last_login_at ? (
                              <div className="space-y-0.5">
                                <span>{new Date(u.last_login_at).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-400 block">{u.last_login_ip || 'IP hidden'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Never logged in</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Password Reset Key */}
                              <button
                                onClick={() => handleResetPassword(u)}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                                title="Generate One-Time Temporary Password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Toggle 2FA */}
                              <button
                                onClick={() => handleToggle2FA(u)}
                                className={`p-2 rounded-xl transition-colors ${
                                  u.two_factor_enabled
                                    ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                    : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title={u.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
                              >
                                <Smartphone className="w-4 h-4" />
                              </button>

                              {/* Unlock / Activate / Suspend Switch */}
                              {userStatus === 'locked' ? (
                                <button
                                  onClick={() => handleToggleStatus(u, 'active')}
                                  className="p-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl transition-colors"
                                  title="Unlock Account"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              ) : userStatus === 'active' ? (
                                !isSelf && (
                                  <button
                                    onClick={() => handleToggleStatus(u, 'suspended')}
                                    className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-xl transition-colors"
                                    title="Suspend User Access"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(u, 'active')}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                                  title="Reactivate Account"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              {/* Edit Profile */}
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                title="Edit Profile & Permissions"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Delete Account (Super Admin only, not self) */}
                              {hasPermission('users.delete') && !isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                                  title="Permanently Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRANULAR PERMISSIONS MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                <span>Role-Based Access Control (RBAC) Permissions Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Overview of functional permissions granted to default system roles. Super Administrators hold root privileges across all scopes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Functional Permission Scope</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Super Admin</th>
                    <th className="py-3 px-3 text-center">Administrator</th>
                    <th className="py-3 px-3 text-center">Project Manager</th>
                    <th className="py-3 px-3 text-center">Content Manager</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {PERMISSION_SCOPES.map(scope => {
                    const isSuper = true;
                    const isAdminAllowed = !['security.policy', 'system.reset', 'inquiries.delete', 'users.delete'].includes(scope.id);
                    const isPMAllowed = ['projects.view', 'projects.create', 'projects.edit', 'projects.publish', 'categories.manage', 'technologies.manage', 'inquiries.manage'].includes(scope.id);
                    const isContentAllowed = ['services.manage', 'team.manage', 'testimonials.manage', 'blogs.manage', 'inquiries.manage', 'settings.manage'].includes(scope.id);

                    return (
                      <tr key={scope.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block font-mono text-[11px]">{scope.id}</span>
                            <span className="text-[11px] text-slate-400">{scope.description}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-semibold">{scope.category}</td>
                        <td className="py-3 px-3 text-center">
                          <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isAdminAllowed ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isPMAllowed ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isContentAllowed ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REAL-TIME SECURITY AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by user, event type, IP, or details..."
                value={logSearchQuery}
                onChange={e => setLogSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={logSeverityFilter}
                  onChange={e => setLogSeverityFilter(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <select
                  value={logEventTypeFilter}
                  onChange={e => setLogEventTypeFilter(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Event Types</option>
                  <option value="LOGIN_SUCCESS">Login Success</option>
                  <option value="LOGIN_FAILURE">Login Failure</option>
                  <option value="ACCOUNT_LOCKED">Account Locked</option>
                  <option value="USER_SUSPENDED">User Suspended</option>
                  <option value="PASSWORD_CHANGED">Password Changed</option>
                  <option value="PASSWORD_RESET_FORCED">Password Reset</option>
                  <option value="2FA_TOGGLED">2FA Toggled</option>
                  <option value="USER_CREATED">User Created</option>
                </select>
              </div>

              <button
                onClick={handleExportLogs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Event Type</th>
                    <th className="py-3.5 px-4">User Identity</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-6">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No security audit logs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => {
                      const severityColors: Record<string, string> = {
                        critical: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
                        alert: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                        warning: 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
                        info: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                      };

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-6 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${severityColors[log.severity] || severityColors.info}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                            {log.event_type}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900 dark:text-white block">{log.user_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{log.user_email}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                            {log.ip_address}
                          </td>
                          <td className="py-3 px-6 text-slate-600 dark:text-slate-300">
                            {log.details}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECURITY POLICY & HARDENING */}
      {/* ========================================================================= */}
      {activeTab === 'policy' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSavePolicy} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  <span>Platform Security & Hardening Policy</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforce zero-trust brute-force prevention, password entropy thresholds, and authentication policies.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Engine Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Failed Attempts */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Brute-Force Lockout Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={policy.max_failed_attempts}
                    onChange={e => setPolicy({ ...policy, max_failed_attempts: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">failed attempts</span>
                </div>
                <p className="text-[11px] text-slate-400">Account locks automatically when this limit is reached.</p>
              </div>

              {/* Lockout Duration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lockout Cooldown Duration
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={policy.lockout_duration_minutes}
                    onChange={e => setPolicy({ ...policy, lockout_duration_minutes: parseInt(e.target.value) || 15 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">minutes</span>
                </div>
                <p className="text-[11px] text-slate-400">Temporary lockout duration before automatic unlock.</p>
              </div>

              {/* Minimum Password Length */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Minimum Password Length
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="8"
                    max="32"
                    value={policy.password_min_length}
                    onChange={e => setPolicy({ ...policy, password_min_length: parseInt(e.target.value) || 8 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">characters</span>
                </div>
                <p className="text-[11px] text-slate-400">Enforced during password changes and user creation.</p>
              </div>

              {/* Session Lifetime */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  JWT Session Lifetime
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={policy.session_timeout_hours}
                    onChange={e => setPolicy({ ...policy, session_timeout_hours: parseInt(e.target.value) || 168 })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 whitespace-nowrap">hours</span>
                </div>
                <p className="text-[11px] text-slate-400">Duration before staff are required to re-authenticate.</p>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.password_require_special}
                  onChange={e => setPolicy({ ...policy, password_require_special: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Require Special Characters & Symbols
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Passwords must contain at least one symbol (!@#$%^&*).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.password_require_number}
                  onChange={e => setPolicy({ ...policy, password_require_number: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Require Numerical Digits
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Passwords must contain at least one numeric character (0-9).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.require_2fa_for_admins}
                  onChange={e => setPolicy({ ...policy, require_2fa_for_admins: e.target.checked })}
                  className="w-4 h-4 mt-0.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    Mandatory 2FA for Administrator Roles
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Require Two-Factor Authentication for Super Admins and Administrators.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSavingPolicy || !hasPermission('security.policy')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSavingPolicy ? 'Enforcing Policy...' : 'Save & Enforce Policies'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVISION OR EDIT USER WITH IAM TABS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingId ? 'Edit Staff User Security Profile' : 'Provision New Staff User Account'}
      >
        <div className="space-y-5">
          {/* Sub-tabs in Modal */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setUserModalTab('identity')}
              className={`text-xs font-bold pb-2 px-1 border-b-2 transition-all ${
                userModalTab === 'identity'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              1. Credentials & Identity
            </button>
            <button
              type="button"
              onClick={() => setUserModalTab('permissions')}
              className={`text-xs font-bold pb-2 px-1 border-b-2 transition-all ${
                userModalTab === 'permissions'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              2. Role & Granular Permissions
            </button>
            <button
              type="button"
              onClick={() => setUserModalTab('security')}
              className={`text-xs font-bold pb-2 px-1 border-b-2 transition-all ${
                userModalTab === 'security'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              3. Security & Status
            </button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-4">
            {/* Modal Tab 1: Identity */}
            {userModalTab === 'identity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name * {editingId && currentUser?.role !== 'super_admin' && <span className="text-rose-500 text-[10px]">(Super Admin only)</span>}
                    </label>
                    <input
                      type="text"
                      required={!editingId}
                      disabled={editingId ? currentUser?.role !== 'super_admin' : false}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Staff Email Address * {editingId && currentUser?.role !== 'super_admin' && <span className="text-rose-500 text-[10px]">(Super Admin only)</span>}
                    </label>
                    <input
                      type="email"
                      required={!editingId}
                      disabled={editingId ? currentUser?.role !== 'super_admin' : false}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. j.doe@company.gov.et"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Title / Designation {editingId && currentUser?.role !== 'super_admin' && <span className="text-rose-500 text-[10px]">(Super Admin only)</span>}
                    </label>
                    <input
                      type="text"
                      disabled={editingId ? currentUser?.role !== 'super_admin' : false}
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Senior Security Architect"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department {editingId && currentUser?.role !== 'super_admin' && <span className="text-rose-500 text-[10px]">(Super Admin only)</span>}
                    </label>
                    <input
                      type="text"
                      disabled={editingId ? currentUser?.role !== 'super_admin' : false}
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Engineering, Operations"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password Input with Entropy Calculation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {editingId ? 'Update Password (Leave blank to keep unchanged)' : 'Initial Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    placeholder={editingId ? '••••••••' : 'Enter secure password (min 8 chars)'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />

                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Password Entropy Score:</span>
                        <span className={`font-bold ${passwordStrength.color}`}>{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Avatar Image (URL or Upload Image)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://... or /uploads/..."
                        value={formData.avatar}
                        onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {formData.avatar && (
                      <div className="flex items-center gap-3">
                        <img
                          src={formData.avatar}
                          alt="Avatar preview"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                          className="text-xs text-rose-500 hover:text-rose-600 hover:underline"
                        >
                          Clear Avatar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Tab 2: Roles & Granular Custom Permissions */}
            {userModalTab === 'permissions' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Role (Base Authorization)
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="super_admin">Super Administrator (Full Root Access)</option>
                    <option value="administrator">Administrator (Operations & Staff IAM)</option>
                    <option value="project_manager">Project Manager (Projects & Deliverables)</option>
                    <option value="content_manager">Content Manager (Services, Blog & CMS)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Custom Granular Permission Overrides
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Grant specific additional permissions beyond the default role template:
                  </p>

                  <div className="max-h-56 overflow-y-auto space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    {PERMISSION_SCOPES.map(scope => {
                      const isChecked = formData.custom_permissions.includes(scope.id);

                      return (
                        <label
                          key={scope.id}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFormData({
                                  ...formData,
                                  custom_permissions: formData.custom_permissions.filter(p => p !== scope.id)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  custom_permissions: [...formData.custom_permissions, scope.id]
                                });
                              }
                            }}
                            className="w-3.5 h-3.5 mt-0.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block font-mono">
                              {scope.id}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{scope.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Tab 3: Security & Status */}
            {userModalTab === 'security' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status Lifecycle
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="active">Active (Normal Access)</option>
                    <option value="suspended">Suspended (Login Blocked)</option>
                    <option value="locked">Locked (Security Lockout)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.two_factor_enabled}
                      onChange={e => setFormData({ ...formData, two_factor_enabled: e.target.checked })}
                      className="w-4 h-4 mt-0.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Enable Two-Factor Authentication (2FA)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Require TOTP verification code on login.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.must_change_password}
                      onChange={e => setFormData({ ...formData, must_change_password: e.target.checked })}
                      className="w-4 h-4 mt-0.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Require Password Change on Next Login
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Forces the user to create a new password immediately upon successful sign-in.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSavingUser}
                className="px-6 py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                {isSavingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSavingUser
                    ? (editingId ? 'Saving Changes...' : 'Provisioning User...')
                    : (editingId ? 'Save Profile Changes' : 'Provision User Account')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ONE-TIME TEMPORARY PASSWORD GENERATED */}
      {/* ========================================================================= */}
      <Modal
        isOpen={tempPassModalOpen}
        onClose={() => setTempPassModalOpen(false)}
        title="Temporary Security Password Generated"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <span className="font-bold block">One-Time Temporary Password Created</span>
              <p>
                A high-entropy password was generated for <strong>{tempPasswordData?.userName}</strong>. The user will be required to change this password on their next login session.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="font-mono text-base font-extrabold text-indigo-400 tracking-wider">
              {tempPasswordData?.tempPass}
            </span>
            <button
              onClick={() => copyToClipboard(tempPasswordData?.tempPass || '')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPass ? 'Copied!' : 'Copy Key'}</span>
            </button>
          </div>

          <button
            onClick={() => setTempPassModalOpen(false)}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            Done & Dismiss
          </button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: 2FA RECOVERY CODES & TOTP KEYS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title="Two-Factor Authentication (2FA) Activated"
      >
        <div className="space-y-5 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-emerald-800 dark:text-emerald-200 space-y-1">
              <span className="font-bold block">2FA Enforced for {twoFactorTarget?.user.name}</span>
              <p>Save these one-time recovery backup codes in a secure vault. Each code can be used once in place of an authenticator app code.</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Backup Recovery Codes</span>
            <div className="grid grid-cols-2 gap-2">
              {twoFactorTarget?.codes.map((code, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-center font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (twoFactorTarget) {
                copyToClipboard(twoFactorTarget.codes.join('\n'));
              }
            }}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy All Recovery Codes</span>
          </button>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous={confirmDialog.isDangerous}
        confirmText={confirmDialog.isDangerous ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
