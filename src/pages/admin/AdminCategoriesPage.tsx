import React, { useEffect, useState } from 'react';
import { ProjectCategory } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Layers, Plus, Edit, Trash2, Tag } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', color: '#6366f1' });
  const { success, error } = useToast();
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();

  const fetchCats = () => {
    api.categories.getAll().then(res => {
      if (res.categories) setCategories(res.categories);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '', color: '#6366f1' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: ProjectCategory) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color || '#6366f1' });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await api.categories.update(editingId, formData);
        success('Category updated successfully.');
      } else {
        await api.categories.create(formData);
        success('Category created successfully.');
      }
      setModalOpen(false);
      fetchCats();
    } catch (err: any) {
      error(err.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (await confirm(`Delete category "${name}"?`, { title: 'Delete Category', isDangerous: true })) {
      try {
        await api.categories.delete(id);
        success('Category deleted.');
        fetchCats();
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
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Project Categories Taxonomy</span>
          </h1>
          <p className="text-xs text-slate-500">Manage categories used to group projects across portfolio filters.</p>
        </div>
        {hasPermission('categories.manage') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                    borderColor: `${cat.color}40`
                  }}
                >
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {cat.project_count || 0} projects
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">/{cat.slug}</span>
              <div className="flex items-center gap-2">
                {hasPermission('categories.manage') && (
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('categories.manage') && (
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
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
        title={editingId ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated if empty"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-400">{formData.color}</span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            {editingId ? 'Update Category' : 'Create Category'}
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
