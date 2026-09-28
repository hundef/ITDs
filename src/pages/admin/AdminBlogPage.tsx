import React, { useEffect, useState } from 'react';
import { BlogPost } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FileText, Plus, Edit, Trash2, Calendar, Clock, Eye, Upload } from 'lucide-react';

export const AdminBlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    summary: string;
    content: string;
    cover_image: string;
    tags: string[];
    read_time: string;
    published_at: string;
    is_published: boolean;
  }>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tags: ['Architecture', 'Cloud'],
    read_time: '5 min read',
    published_at: new Date().toISOString().split('T')[0],
    is_published: true
  });

  const { success, error } = useToast();
  const { confirm, confirmState, closeConfirm } = useConfirm();

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, cover_image: res.url }));
        success('Cover image uploaded successfully!');
      } else {
        error(res.message || 'Failed to upload cover image.');
      }
    } catch (err: any) {
      error(err.message || 'Cover image upload failed.');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const fetchBlogs = () => {
    api.blogs.getAll().then(res => {
      if (res.blogs) setBlogs(res.blogs);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      tags: ['AI & ML', 'Architecture'],
      read_time: '6 min read',
      published_at: new Date().toISOString().split('T')[0],
      is_published: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b: BlogPost) => {
    setEditingId(b.id);
    setFormData({
      title: b.title,
      slug: b.slug,
      summary: b.summary || '',
      content: b.content || '',
      cover_image: b.cover_image || '',
      tags: b.tags || ['Tech'],
      read_time: b.read_time || '5 min read',
      published_at: b.published_at || new Date().toISOString().split('T')[0],
      is_published: b.is_published === 1 || b.is_published === true
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    try {
      if (editingId) {
        await api.blogs.update(editingId, formData);
        success('Article updated successfully.');
      } else {
        await api.blogs.create(formData);
        success('Article published.');
      }
      setModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      error(err.message || 'Failed to save article.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (await confirm(`Delete article "${title}"?`, { title: 'Delete Article', isDangerous: true })) {
      try {
        await api.blogs.delete(id);
        success('Article removed.');
        fetchBlogs();
      } catch (err: any) {
        error(err.message || 'Failed to delete.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Blog & Insights Publisher</span>
          </h1>
          <p className="text-xs text-slate-500">Author and publish engineering perspectives and architecture whitepapers.</p>
        </div>
        {hasPermission('blogs.manage') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Write Article</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(b => (
          <div
            key={b.id}
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="h-44 w-full bg-slate-100 dark:bg-slate-800">
                <img src={b.cover_image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>{new Date(b.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>{b.read_time}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {b.summary}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">/{b.slug}</span>
              <div className="flex items-center gap-2 pt-3">
                {hasPermission('blogs.manage') && (
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('blogs.manage') && (
                  <button
                    onClick={() => handleDelete(b.id, b.title)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Article' : 'Write New Whitepaper / Blog'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Article Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cover Image URL or Upload Image</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /uploads/asset-...png"
                  value={formData.cover_image}
                  onChange={e => setFormData({ ...formData, cover_image: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                />
                <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.cover_image && (
                <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs group">
                  <img
                    src={formData.cover_image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1 shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Reading Time</label>
            <input
              type="text"
              value={formData.read_time}
              onChange={e => setFormData({ ...formData, read_time: e.target.value })}
              placeholder="e.g. 6 min read"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Summary / Executive Subtitle</label>
            <textarea
              rows={2}
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Article Content (Markdown formatted) *</label>
            <textarea
              rows={8}
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            {editingId ? 'Update Article' : 'Publish Article'}
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
