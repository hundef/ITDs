import React, { useEffect, useState } from 'react';
import { Technology } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Cpu, Plus, Edit, Trash2, Code } from 'lucide-react';

export const AdminTechnologiesPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', category: 'Languages', icon: 'Code', color: '#6366f1' });
  const { success, error } = useToast();
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();

  const fetchTech = () => {
    api.technologies.getAll().then(res => {
      if (res.technologies) setTechnologies(res.technologies);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTech();
  }, []);

  const handleOpenAdd = () => {
    if (!hasPermission('categories.manage')) {
      error('You do not have permission to add technologies.');
      return;
    }
    setEditingId(null);
    setFormData({ name: '', slug: '', category: 'Frontend', icon: 'Code', color: '#6366f1' });
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Technology) => {
    if (!hasPermission('categories.manage')) {
      error('You do not have permission to edit technologies.');
      return;
    }
    setEditingId(t.id);
    setFormData({ name: t.name, slug: t.slug, category: t.category || 'General', icon: t.icon || 'Code', color: t.color || '#6366f1' });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await api.technologies.update(editingId, formData);
        success('Technology updated.');
      } else {
        await api.technologies.create(formData);
        success('Technology added to library.');
      }
      setModalOpen(false);
      fetchTech();
    } catch (err: any) {
      error(err.message || 'Failed to save technology.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!await confirm(`Delete technology "${name}"?`, { title: 'Delete Technology', isDangerous: true })) return;
    try {
      await api.technologies.delete(id);
      success('Technology deleted.');
      fetchTech();
    } catch (err: any) {
      error(err.message || 'Failed to delete.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Technologies Library</span>
          </h1>
          <p className="text-xs text-slate-500">Manage frameworks, databases, and languages available for project tagging.</p>
        </div>
        {hasPermission('categories.manage') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technology</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {technologies.map(t => (
          <div
            key={t.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color || '#6366f1' }} />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{t.name}</h4>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                {t.category}
              </span>
              <span>{t.project_count || 0} projects</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1">
              {hasPermission('categories.manage') && (
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              )}
              {hasPermission('categories.manage') && (
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Technology' : 'Add Technology'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Technology Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Type</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Languages">Languages</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="Cloud">Cloud</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Data">Data & Streaming</option>
              <option value="API">API</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Color Badge</label>
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
            {editingId ? 'Update Technology' : 'Add Technology'}
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
