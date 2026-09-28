import React, { useEffect, useState, useRef } from 'react';
import { Testimonial, Project } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Quote, Plus, Edit, Trash2, Star, Upload, X } from 'lucide-react';

export const AdminTestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    client_company: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: '',
    rating: 5,
    project_id: null as number | null,
    is_featured: true
  });
  const { success, error } = useToast();

  const fetchData = () => {
    Promise.all([
      api.testimonials.getAll(),
      api.projects.getAll({ limit: 100, published: 'all' })
    ]).then(([tRes, pRes]) => {
      if (tRes.testimonials) setTestimonials(tRes.testimonials);
      if (pRes.projects) setProjects(pRes.projects);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      client_name: '',
      client_role: '',
      client_company: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: '',
      rating: 5,
      project_id: null,
      is_featured: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData({
      client_name: t.author_name || t.client_name || '',
      client_role: t.author_role || t.client_role || '',
      client_company: t.author_company || t.client_company || '',
      avatar: t.author_avatar || t.avatar || '',
      content: t.content,
      rating: t.rating || 5,
      project_id: t.project_id || null,
      is_featured: t.is_featured === 1 || t.is_featured === true
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name.trim()) {
      error('Author name is required.');
      return;
    }
    
    if (!formData.content.trim()) {
      error('Review content is required.');
      return;
    }

    try {
      if (editingId) {
        await api.testimonials.update(editingId, formData);
        success('Testimonial updated.');
      } else {
        await api.testimonials.create(formData);
        success('Testimonial created.');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to save.');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!await confirm('Delete this testimonial?', { title: 'Delete Testimonial', isDangerous: true })) return;
    try {
      await api.testimonials.delete(id);
      success('Testimonial deleted.');
      fetchData();
    } catch (err: any) {
      error(err.message || 'Failed to delete.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'testimonials');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nexora_token')}`
        },
        body: formDataUpload
      });

      const data = await response.json();
      if (data.success && data.url) {
        setFormData({ ...formData, avatar: data.url });
        success('Image uploaded successfully');
      } else {
        error(data.message || 'Upload failed');
      }
    } catch (err: any) {
      error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Quote className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Client Testimonials Manager</span>
          </h1>
          <p className="text-xs text-slate-500">Manage client endorsements, ratings, and linked case study references.</p>
        </div>
        {hasPermission('testimonials.manage') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(t => (
          <div
            key={t.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                {t.project_name && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {t.project_name}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={t.avatar}
                  alt={t.client_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.client_name}</h4>
                  <p className="text-[11px] text-slate-400">{t.client_role} • {t.client_company}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              {hasPermission('testimonials.manage') && (
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {hasPermission('testimonials.manage') && (
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Client Name *</label>
              <input
                type="text"
                required
                placeholder="Full name of the person giving the testimonial"
                value={formData.client_name}
                onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">Required</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
              <input
                type="text"
                value={formData.client_role}
                onChange={e => setFormData({ ...formData, client_role: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={formData.client_company}
                onChange={e => setFormData({ ...formData, client_company: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Linked Project (Optional)</label>
              <select
                value={formData.project_id || ''}
                onChange={e => setFormData({ ...formData, project_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="">No linked project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Avatar Image</label>
            <div className="space-y-3">
              {formData.avatar && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Failed to load image:', formData.avatar);
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: '' })}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-[11px] text-slate-400">Max 5MB • JPG, PNG, WebP</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Review Content *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the testimonial content here..."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">Required • Include specific details about your experience</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rating (1-5 Stars)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: Math.max(1, Math.min(5, Number(e.target.value))) })}
                  className="w-20 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                />
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className={`p-1 transition-all ${i < formData.rating ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Featured</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border border-slate-300 text-indigo-600"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300">Display as featured testimonial</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            {editingId ? 'Update Testimonial' : 'Create Testimonial'}
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
};
