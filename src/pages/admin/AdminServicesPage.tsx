import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Service } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Code2,
  Globe,
  Sparkles,
  Smartphone,
  Layout,
  Shield,
  Save,
  Layers,
  Sparkle
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { hasPermission } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();

  // Section Header state
  const [sectionTitle, setSectionTitle] = useState(settings.services_section_title || 'Specialized Engineering Services');
  const [sectionDesc, setSectionDesc] = useState(settings.services_section_desc || 'Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI.');
  const [isSavingHeader, setIsSavingHeader] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    icon: string;
    short_description: string;
    full_description: string;
    features: string[];
    display_order: number;
    is_active: boolean;
  }>({
    name: '',
    slug: '',
    icon: 'Code2',
    short_description: '',
    full_description: '',
    features: [''],
    display_order: 1,
    is_active: true
  });

  const { success, error } = useToast();

  useEffect(() => {
    if (settings.services_section_title) setSectionTitle(settings.services_section_title);
    if (settings.services_section_desc) setSectionDesc(settings.services_section_desc);
  }, [settings]);

  const fetchServices = () => {
    api.services.getAll().then(res => {
      if (res.services) setServices(res.services);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveSectionHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHeader(true);
    try {
      await updateSettings({
        services_section_title: sectionTitle,
        services_section_desc: sectionDesc
      });
      success('Services section headline and intro description saved!');
      await refreshSettings();
    } catch (err: any) {
      error('Failed to update services section headline.');
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'Code2',
      short_description: '',
      full_description: '',
      features: ['Custom API Architecture', 'Cloud Deployment'],
      display_order: services.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingId(svc.id);
    setFormData({
      name: svc.name,
      slug: svc.slug,
      icon: svc.icon || 'Code2',
      short_description: svc.short_description || '',
      full_description: svc.full_description || '',
      features: svc.features || [],
      display_order: svc.display_order || 1,
      is_active: svc.is_active === 1 || svc.is_active === true
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.short_description) return;

    try {
      if (editingId) {
        await api.services.update(editingId, formData);
        success('Service updated successfully.');
      } else {
        await api.services.create(formData);
        success('Service created successfully.');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      error(err.message || 'Failed to save service.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!await confirm(`Delete service "${name}"?`, { title: 'Delete Service', isDangerous: true })) return;
    try {
      await api.services.delete(id);
      success('Service deleted.');
      fetchServices();
    } catch (err: any) {
      error(err.message || 'Failed to delete.');
    }
  };

  const handleFeatureChange = (idx: number, val: string) => {
    const updated = [...formData.features];
    updated[idx] = val;
    setFormData({ ...formData, features: updated });
  };

  const addFeatureInput = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeatureInput = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Company Services Manager</span>
          </h1>
          <p className="text-xs text-slate-500">Configure public service offerings, section headlines, descriptions, and deliverables.</p>
        </div>
        {hasPermission('services.manage') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        )}
      </div>

      {/* Services Section Headline Editor Card */}
      <form onSubmit={handleSaveSectionHeader} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Public Services Page Headline & Description</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the main heading and intro text shown on the public Services page.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSavingHeader}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all self-start sm:self-auto shrink-0 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingHeader ? 'Saving...' : 'Save Section Title'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Services Page Main Title *
            </label>
            <input
              type="text"
              required
              value={sectionTitle}
              onChange={e => setSectionTitle(e.target.value)}
              placeholder="e.g. Specialized Engineering Services"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Services Section Intro Description
            </label>
            <input
              type="text"
              value={sectionDesc}
              onChange={e => setSectionDesc(e.target.value)}
              placeholder="Comprehensive, end-to-end technology solutions tailored for enterprises..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(svc => (
          <div
            key={svc.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">{svc.name}</h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Priority {svc.display_order}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{svc.short_description}</p>
              {svc.features && (
                <div className="space-y-1 pt-2">
                  {svc.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">/{svc.slug}</span>
              <div className="flex items-center gap-2">
                {hasPermission('services.manage') && (
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {hasPermission('services.manage') && (
                  <button
                    onClick={() => handleDelete(svc.id, svc.name)}
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
        title={editingId ? 'Edit Service' : 'Add Service'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Short Description *</label>
            <textarea
              rows={2}
              required
              value={formData.short_description}
              onChange={e => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Detailed Description</label>
            <textarea
              rows={3}
              value={formData.full_description}
              onChange={e => setFormData({ ...formData, full_description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Deliverable Features</label>
              <button
                type="button"
                onClick={addFeatureInput}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                + Add Bullet
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={e => handleFeatureChange(idx, e.target.value)}
                    placeholder="e.g. Microservices & API Gateway"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeatureInput(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            {editingId ? 'Update Service' : 'Create Service'}
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
