import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/common/Toast';
import { api } from '../../services/api';
import { RoleBadge } from '../../components/common/Badge';
import {
  User as UserIcon,
  Mail,
  Lock,
  Camera,
  Save,
  ShieldCheck,
  Moon,
  Sun,
  KeyRound,
  CheckCircle2,
  Briefcase,
  Smartphone,
  Copy,
  Check,
  Building,
  Activity,
  Calendar,
  Globe,
  Upload,
  Trash2,
  RefreshCw,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  Plus,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  Layers,
  BadgeCheck,
  Clock,
  Shield,
  HelpCircle
} from 'lucide-react';

const DEPARTMENTS = [
  'Engineering & Architecture',
  'Cloud & DevOps Infrastructure',
  'Product Management & UX',
  'AI & Data Science',
  'Cybersecurity & IAM',
  'Executive Leadership',
  'Quality Assurance & SRE',
  'Client Solutions & Support'
];

const PRESET_AVATARS = [
  { name: 'Sarah (Lead Engineer)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { name: 'Alex (Tech Architect)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { name: 'Elena (Design Lead)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { name: 'Marcus (DevOps Eng)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { name: 'Chloe (Product Lead)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
  { name: 'David (Cybersecurity)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
  { name: 'Maya (AI Researcher)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { name: 'James (VP Engineering)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' }
];

const SUGGESTED_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Docker',
  'Kubernetes', 'Cloud Architecture', 'GraphQL', 'PostgreSQL',
  'CI/CD Pipelines', 'System Design', 'Cybersecurity', 'UI/UX Design'
];

function calculatePasswordStrength(pass: string): { score: number; label: string; color: string; checks: { length: boolean; upper: boolean; number: boolean; special: boolean } } {
  const checks = {
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[^A-Za-z0-9]/.test(pass)
  };

  if (!pass) return { score: 0, label: 'None', color: 'bg-slate-300 dark:bg-slate-700 text-slate-400', checks };
  
  let score = 0;
  if (checks.length) score += 25;
  if (pass.length >= 12) score += 15;
  if (checks.upper) score += 20;
  if (checks.number) score += 20;
  if (checks.special) score += 20;

  if (score < 40) return { score: Math.min(score, 35), label: 'Weak', color: 'bg-rose-500 text-rose-500', checks };
  if (score < 70) return { score, label: 'Fair', color: 'bg-amber-500 text-amber-500', checks };
  if (score < 90) return { score, label: 'Strong', color: 'bg-indigo-500 text-indigo-500', checks };
  return { score: 100, label: 'Exceptional', color: 'bg-emerald-500 text-emerald-500', checks };
}

export const AdminProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab View
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: user?.title || '',
    department: user?.department || 'Engineering & Architecture',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    twitter_url: user?.twitter_url || '',
    skills: user?.skills || ['React', 'TypeScript', 'Cloud Architecture'],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Skills input helper
  const [skillInput, setSkillInput] = useState('');

  // Password visibility
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!user?.two_factor_enabled);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Sync state with authenticated user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        title: user.title || 'Staff Member',
        department: user.department || 'Engineering & Architecture',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        twitter_url: user.twitter_url || '',
        skills: user.skills && user.skills.length > 0 ? user.skills : ['React', 'TypeScript', 'Cloud Architecture']
      }));
      setTwoFactorEnabled(!!user.two_factor_enabled);
    }
  }, [user]);

  // File Upload Logic with validation
  const processFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      error('File size exceeds the 15 MB limit.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, avatar: res.url }));
        // Instant backend user update so changes reflect immediately across all layouts
        if (user) {
          await api.users.update(user.id, { avatar: res.url });
          updateUser({ avatar: res.url });
        }
        success('Profile photo uploaded and updated successfully!');
      } else {
        error(res.message || 'Failed to upload photo.');
      }
    } catch (err: any) {
      error(err.message || 'Photo upload failed. Please verify API server is online.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFileUpload(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFileUpload(file);
  };

  // Preset avatar selector
  const handleSelectPreset = async (presetUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: presetUrl }));
    if (user) {
      try {
        await api.users.update(user.id, { avatar: presetUrl });
        updateUser({ avatar: presetUrl });
        success('Preset avatar selected and saved!');
      } catch (err: any) {
        error('Failed to save preset avatar.');
      }
    }
  };

  // Remove avatar / Reset to default
  const handleRemoveAvatar = async () => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (user) {
      try {
        await api.users.update(user.id, { avatar: defaultAvatar });
        updateUser({ avatar: defaultAvatar });
        info('Custom photo removed. Reverted to default avatar.');
      } catch (err: any) {
        error('Failed to reset photo.');
      }
    }
  };

  // Skills tag manager
  const handleAddSkill = (skillToAdd?: string) => {
    const skill = (skillToAdd || skillInput).trim();
    if (!skill) return;
    if (formData.skills.includes(skill)) {
      info(`Skill "${skill}" is already added.`);
      setSkillInput('');
      return;
    }
    setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Save profile form handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      error('Full name and email address are required fields.');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        error('New passwords do not match. Please verify confirmation.');
        return;
      }
      if (formData.newPassword.length < 8) {
        error('Password must be at least 8 characters long based on enterprise security policy.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        title: formData.title.trim(),
        department: formData.department,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
        linkedin_url: formData.linkedin_url.trim(),
        github_url: formData.github_url.trim(),
        twitter_url: formData.twitter_url.trim(),
        skills: formData.skills,
        role: user.role
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
        if (formData.currentPassword) {
          payload.currentPassword = formData.currentPassword;
        }
      }

      const res = await api.users.update(user.id, payload);
      if (res.success && res.user) {
        updateUser(res.user);
        success('Staff profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        error(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // 2FA Toggle
  const handleToggle2FA = async () => {
    if (!user) return;
    try {
      const res = await api.users.toggle2FA(user.id);
      if (res.success) {
        setTwoFactorEnabled(res.two_factor_enabled);
        if (res.two_factor_enabled) {
          setRecoveryCodes(res.recoveryCodes || []);
          success('Two-Factor Authentication activated! Store your backup codes safely.');
        } else {
          setRecoveryCodes([]);
          success('Two-Factor Authentication deactivated.');
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to update 2FA configuration.');
    }
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    success('Backup recovery codes copied to clipboard.');
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);
  const currentAvatarSrc = formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 border border-indigo-700/30 p-6 sm:p-8 text-white shadow-xl">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={currentAvatarSrc}
                alt={formData.name || 'Staff User'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white/40 shadow-2xl group-hover:scale-105 transition-transform"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 cursor-pointer"
                title="Change Photo"
              >
                {isUploadingAvatar ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                <span>{isUploadingAvatar ? 'Saving...' : 'Change'}</span>
              </button>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-md" title="Active Account">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate font-sans">
                  {formData.name || user?.name || 'Staff Member'}
                </h1>
                {user && <RoleBadge role={user.role} />}
                {twoFactorEnabled && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
                    <Smartphone className="w-3 h-3" />
                    <span>2FA Protected</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 font-medium">
                {formData.title || 'Staff Member'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-indigo-200/80 font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-300" />
                  {formData.email || user?.email}
                </span>
                {formData.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    {formData.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Quick Controls */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white shadow-sm transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-200" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-5 border-t border-white/15 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile & Photo Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'security'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'activity'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Account Details & IAM</span>
          </button>
        </div>
      </div>

      {/* Main Profile Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Edit Form (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              
              {/* Photo Upload & Studio Card */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                      <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>Profile Photo & Avatar Studio</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload your employee photo, choose from enterprise presets, or drag and drop.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresetGallery(prev => !prev)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showPresetGallery ? 'Hide Presets' : 'Choose Preset'}</span>
                  </button>
                </div>

                {/* Drag & Drop Photo Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 transition-all flex flex-col sm:flex-row items-center gap-6 ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850/60 hover:border-indigo-400'
                  }`}
                >
                  <div className="relative group shrink-0">
                    <img
                      src={currentAvatarSrc}
                      alt={formData.name}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-bold">
                        <RefreshCw className="w-6 h-6 animate-spin mb-1 text-indigo-400" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dragActive ? 'Drop your image now' : 'Upload your staff portrait'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Supports PNG, JPG, WEBP, SVG, or GIF up to 15MB. Recommended resolution 400x400.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Choose File from Device'}</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />

                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold border border-rose-200 dark:border-rose-800/80 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Gallery Accordion */}
                {showPresetGallery && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Or select a curated professional avatar preset:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`group relative rounded-2xl overflow-hidden border-2 transition-all p-0.5 aspect-square ${
                            formData.avatar === preset.url
                              ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-105'
                              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                          }`}
                          title={preset.name}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          {formData.avatar === preset.url && (
                            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Core Identity & Organization Details */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Identity & Organizational Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Johnathan Doe"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Staff Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Job Title / Professional Designation
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Principal Systems Architect"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Direct Phone / Extension
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Office Location / Timezone
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="San Francisco, CA (UTC-7)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography & Skills Management */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Biography & Expertise Tags</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Share your professional background, technical specializations, and competencies.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Professional Bio
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formData.bio.length} / 500 characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Briefly describe your responsibilities, technical leadership, and engineering passions..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Skills & Specialties Tag Manager */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Skills & Technical Competencies
                  </label>

                  {/* Add skill input bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter (e.g. Next.js, Kubernetes)..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tag</span>
                    </button>
                  </div>

                  {/* Active tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs group"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-indigo-400 hover:text-rose-500 transition-colors"
                          title="Remove tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {formData.skills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No skills added yet. Add some above or click suggestions below.</span>
                    )}
                  </div>

                  {/* Suggested pills */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                      Suggested Quick-Add:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 8).map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddSkill(s)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social & External Profiles */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                    <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Social & Professional Links</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connect your professional public accounts (visible to team members).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.linkedin_url}
                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="linkedin.com/in/username"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      GitHub Handle
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.github_url}
                        onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                        placeholder="github.com/username"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Twitter / X Handle
                    </label>
                    <div className="relative">
                      <Twitter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.twitter_url}
                        onChange={e => setFormData({ ...formData, twitter_url: e.target.value })}
                        placeholder="twitter.com/username"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes Floating Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Last profile update synced automatically.
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Staff Card Preview (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Live Staff Card Preview</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              {/* Card preview representation */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group">
                {/* Decorative header gradient */}
                <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 relative p-4 flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-md text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    Staff Pass #{(user?.id || 1).toString().padStart(4, '0')}
                  </span>
                  {user && <RoleBadge role={user.role} />}
                </div>

                <div className="px-6 pb-6 pt-0 relative space-y-4">
                  {/* Floating avatar */}
                  <div className="-mt-12 flex items-end justify-between">
                    <div className="relative">
                      <img
                        src={currentAvatarSrc}
                        alt={formData.name}
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800"
                      />
                      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Active">
                        <Check className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                      {formData.name || 'Staff Member'}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {formData.title || 'Staff Designation'}
                    </p>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    "{formData.bio || 'Enterprise engineer building scalable platforms and next-gen applications.'}"
                  </p>

                  {/* Skills tags preview */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specializations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.slice(0, 5).map((sk, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                          {sk}
                        </span>
                      ))}
                      {formData.skills.length > 5 && (
                        <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          +{formData.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact pills */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono truncate">
                        <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security & Password Tab */}
      {activeTab === 'security' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            {/* Change Password Card */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                  <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Update Account Password</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ensure your account uses a robust, high-entropy password to protect enterprise assets.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password (Verification)
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      placeholder="Enter current password..."
                      value={formData.currentPassword}
                      onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {formData.newPassword && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Security Entropy:</span>
                          <span className={`font-bold ${passwordStrength.color}`}>{passwordStrength.label} ({passwordStrength.score}%)</span>
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password checklist */}
              {formData.newPassword && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Security Policy Checklist:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1.5 ${passwordStrength.checks.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Minimum 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.checks.upper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Contains uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.checks.number ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Contains numbers</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.checks.special ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Special symbol</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !formData.newPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </div>
          </form>

          {/* Two-Factor Authentication (2FA) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                  <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Two-Factor Authentication (2FA)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enforce an additional secondary verification challenge to safeguard against unauthorized credential exposure.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  twoFactorEnabled
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                }`}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Activate 2FA'}
              </button>
            </div>

            {recoveryCodes.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Backup Recovery Codes (Keep in a secure vault)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCodes}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white shadow-xs"
                  >
                    {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCodes ? 'Copied' : 'Copy Codes'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {recoveryCodes.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-center font-bold text-xs tracking-wider text-indigo-600 dark:text-indigo-400">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity & IAM Metadata Tab */}
      {activeTab === 'activity' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Identity, RBAC Role & Session Metadata</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Internal system attributes assigned by enterprise super administrators.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Account ID</span>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  UID-{(user?.id || 1).toString().padStart(6, '0')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned RBAC Role</span>
                <div className="pt-0.5">
                  {user && <RoleBadge role={user.role} />}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Authentication Timestamp</span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Active in current session'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client IP Address</span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {user?.last_login_ip || '127.0.0.1 (Localhost)'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Creation Date</span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Original Enterprise Provisioning'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Compliant & Active</span>
                </span>
              </div>
            </div>

            {user?.custom_permissions && user.custom_permissions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Active Granular Permission Scopes ({user.custom_permissions.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {user.custom_permissions.map((perm, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
