import React, { useEffect, useState } from 'react';
import { TeamMember } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Users, Plus, Edit, Trash2, Mail, Linkedin, Github, Upload, Camera, RefreshCw, Eye, EyeOff, ShieldCheck, Users2 } from 'lucide-react';

export const AdminTeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<{ name: string; count: number }[]>([]);
  const [viewMode, setViewMode] = useState<'leaders' | 'professionals' | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [quickUploadingId, setQuickUploadingId] = useState<number | null>(null);
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    bio: '',
    avatar: '/avatars/avatar_default.jpg',
    email: '',
    linkedin_url: '',
    github_url: '',
    display_order: 1,
    is_leadership: false as boolean,
    is_visible: 1
  });
  const { success, error } = useToast();

  // Filter team based on view mode
  const filteredTeam = viewMode === 'leaders' 
    ? team.filter(m => m.is_leadership === 1 || m.is_leadership === true)
    : viewMode === 'professionals'
    ? team.filter(m => m.is_leadership === 0 || m.is_leadership === false)
    : team;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, avatar: res.url }));
        success('Avatar uploaded successfully!');
      } else {
        error(res.message || 'Failed to upload avatar.');
      }
    } catch (err: any) {
      error(err.message || 'Avatar upload failed.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleQuickAvatarUpload = async (memberId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuickUploadingId(memberId);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        await api.team.update(memberId, { avatar: res.url });
        setTeam(prev => prev.map(m => m.id === memberId ? { ...m, avatar: res.url } : m));
        success('Member photo updated successfully!');
      } else {
        error(res.message || 'Failed to upload photo.');
      }
    } catch (err: any) {
      error(err.message || 'Photo update failed.');
    } finally {
      setQuickUploadingId(null);
      e.target.value = '';
    }
  };

  const fetchTeam = () => {
    api.team.getAll().then(res => {
      if (res.team) setTeam(res.team);
    }).catch(err => console.error(err));
  };

  const fetchDepartments = () => {
    api.departments.getAll().then(res => {
      if (res.departments) setDepartments(res.departments);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTeam();
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: '',
      department: '',
      bio: '',
      avatar: '/avatars/avatar_default.jpg',
      email: '',
      linkedin_url: '',
      github_url: '',
      display_order: team.length + 1,
      is_leadership: false,
      is_visible: 1
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      role: m.role,
      department: m.department || '',
      bio: m.bio || '',
      avatar: m.avatar || '',
      email: m.email || '',
      linkedin_url: m.linkedin_url || '',
      github_url: m.github_url || '',
      display_order: m.display_order || 1,
      is_leadership: m.is_leadership === 1 || m.is_leadership === true,
      is_visible: typeof m.is_visible === 'number' ? m.is_visible : m.is_visible ? 1 : 0
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    try {
      const dataToSave = {
        ...formData
      };
      
      if (editingId) {
        await api.team.update(editingId, dataToSave);
        success('Team member updated successfully.');
      } else {
        await api.team.create(dataToSave);
        success('Team member created successfully.');
      }
      setModalOpen(false);
      fetchTeam();
    } catch (err) {
      console.error(err);
      error('Failed to save team member.');
    }
  };

  const handleDelete = async (id: number, memberName?: string) => {
    const member = team.find(m => m.id === id);
    const confirmed = await confirm(
      `Are you sure you want to permanently delete "${memberName || member?.name || 'this member'}"? This action cannot be undone.`,
      { title: 'Delete Team Member', isDangerous: true }
    );
    if (!confirmed) return;

    try {
      await api.team.delete(id);
      success('Team member deleted.');
      fetchTeam();
    } catch (err) {
      console.error(err);
      error('Failed to delete team member.');
    }
  };

  const handleToggleVisibility = async (id: number, currentVisible?: number | boolean, memberName?: string) => {
    const isVis = typeof currentVisible === 'number' ? currentVisible === 1 : !!currentVisible;
    const newStatus = isVis ? 0 : 1;
    try {
      await api.team.update(id, { is_visible: newStatus });
      success(`${memberName ? `${memberName} ` : 'Member '}${newStatus === 1 ? 'visible' : 'hidden'} on public page.`);
      fetchTeam();
    } catch (err) {
      console.error(err);
      error('Failed to update visibility.');
    }
  };

  const leadershipCount = team.filter(m => m.is_leadership === 1 || m.is_leadership === true).length;
  const professionalCount = team.filter(m => m.is_leadership === 0 || m.is_leadership === false).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Team & Leadership Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your executive leaders, engineering professionals, and public bios.
          </p>
        </div>

        {hasPermission('team.manage') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100 dark:bg-slate-850 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'all'
              ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Members ({team.length})
        </button>
        <button
          onClick={() => setViewMode('leaders')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'leaders'
              ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Leaders ({leadershipCount})
        </button>
        <button
          onClick={() => setViewMode('professionals')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'professionals'
              ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Professionals ({professionalCount})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-12">
        {/* Leadership Section */}
        {(viewMode === 'leaders' || viewMode === 'all') && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-8">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leaders</h2>
            </div>
            {leadershipCount > 0 ? (
              <MemberGrid 
                members={viewMode === 'leaders' ? filteredTeam : team.filter(m => m.is_leadership === 1 || m.is_leadership === true)} 
              />
            ) : (
              <div className="text-center py-12">
                <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No leadership members found.</p>
              </div>
            )}
          </div>
        )}

        {/* Professionals Section */}
        {(viewMode === 'professionals' || (viewMode === 'all' && professionalCount > 0)) && (
          <div>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Users2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Professionals</h2>
            </div>
            {professionalCount > 0 ? (
              <MemberGrid 
                members={viewMode === 'professionals' ? filteredTeam : team.filter(m => m.is_leadership === 0 || m.is_leadership === false)} 
              />
            ) : (
              <div className="text-center py-12">
                <Users2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No professionals found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Team Member' : 'Add Team Member'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Member Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Member Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                formData.is_leadership 
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500' 
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}>
                <input
                  type="radio"
                  name="memberType"
                  checked={formData.is_leadership}
                  onChange={() => setFormData({ ...formData, is_leadership: true })}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  👨‍💼 Leader
                </span>
              </label>
              
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                !formData.is_leadership 
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500' 
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}>
                <input
                  type="radio"
                  name="memberType"
                  checked={!formData.is_leadership}
                  onChange={() => setFormData({ ...formData, is_leadership: false })}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  👨‍💻 Professional
                </span>
              </label>
            </div>
          </div>

          {/* Common Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title *</label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="/avatars/... or https://... or /uploads/..."
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                />
                <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingAvatar ? 'Uploading...' : 'Upload'}</span>
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
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs group">
                  <img
                    src={formData.avatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                      className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Department field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="">Select a department...</option>
              {departments.map(dept => (
                <option key={dept.name} value={dept.name}>
                  {dept.name} ({dept.count} member{dept.count !== 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            {editingId ? 'Update Member' : 'Add Member'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        isDangerous={confirmState.isDangerous}
        confirmText={confirmState.isDangerous ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </div>
  );

  function MemberGrid({ members }: { members: TeamMember[] }) {
    if (members.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No team members found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {members.map(member => (
          <div
            key={member.id}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 mb-4 ring-2 ring-indigo-600 shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
              <img
                src={member.avatar}
                alt={member.name}
                onError={(e) => { e.currentTarget.src = '/avatars/avatar_default.jpg'; }}
                className="w-full h-full object-cover"
              />
              {/* Camera overlay on hover */}
              <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                {quickUploadingId === member.id ? (
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleQuickAvatarUpload(member.id, e)}
                  disabled={quickUploadingId === member.id}
                  className="hidden"
                />
              </label>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {member.name}
            </h3>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {member.role}
            </p>
            {member.department && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {member.department}
              </p>
            )}

            {/* Action Buttons */}
            {hasPermission('team.manage') && (
              <div className="flex items-center gap-1.5 mt-3">
                <label
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleQuickAvatarUpload(member.id, e)}
                    disabled={quickUploadingId === member.id}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={() => handleToggleVisibility(member.id, member.is_visible === 1 || member.is_visible === true, member.name)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={member.is_visible ? 'Hide from public' : 'Show on public'}
                >
                  {member.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Details"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
};
