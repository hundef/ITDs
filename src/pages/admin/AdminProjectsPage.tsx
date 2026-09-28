import React, { useEffect, useState } from 'react';
import { Project, ProjectStatus, ProjectLink } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  FolderKanban,
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  Link as LinkIcon,
  Plus,
  Save,
  Sliders,
  Globe,
  Github,
  FileText
} from 'lucide-react';

interface AdminProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminProjectsPage: React.FC<AdminProjectsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { success, error } = useToast();
  const { hasPermission, user } = useAuth();
  const { confirm, confirmState, closeConfirm } = useConfirm();

  // Quick Edit Modal State
  const [quickEditProject, setQuickEditProject] = useState<Project | null>(null);
  const [quickForm, setQuickForm] = useState<{
    short_description: string;
    links: ProjectLink[];
    start_date: string;
    completion_date: string;
  }>({
    short_description: '',
    links: [],
    start_date: '',
    completion_date: ''
  });
  const [isSavingQuick, setIsSavingQuick] = useState(false);

  const fetchProjects = () => {
    setIsLoading(true);
    api.projects.getAll({ search, status: statusFilter, limit: 100, published: 'all' }).then(res => {
      if (res.projects) {
        // Show all projects - permissions control edit/delete/publish actions, not visibility
        setProjects(res.projects);
      }
    }).catch(err => {
      console.error(err);
      error('Failed to load projects list.');
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, user?.id]);

  const handleOpenQuickEdit = (proj: Project) => {
    setQuickEditProject(proj);
    setQuickForm({
      short_description: proj.short_description || '',
      links: proj.links ? proj.links.map(l => ({ ...l })) : [],
      start_date: proj.start_date || '',
      completion_date: proj.completion_date || ''
    });
  };

  const handleSaveQuickEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickEditProject) return;

    setIsSavingQuick(true);
    try {
      const res = await api.projects.update(quickEditProject.id, {
        short_description: quickForm.short_description,
        links: quickForm.links,
        start_date: quickForm.start_date || null,
        completion_date: quickForm.completion_date || null
      });

      if (res.success && res.project) {
        setProjects(prev => prev.map(p => p.id === quickEditProject.id ? res.project : p));
        success(`Updated summary, links & dates for "${quickEditProject.name}"!`);
        setQuickEditProject(null);
      } else {
        error(res.message || 'Failed to update project.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update project summary, links, and dates.');
    } finally {
      setIsSavingQuick(false);
    }
  };

  const handleAddQuickLink = (linkType: ProjectLink['link_type'], label: string, url: string = 'https://') => {
    setQuickForm(prev => ({
      ...prev,
      links: [...prev.links, { link_type: linkType, label, url }]
    }));
  };

  const handleUpdateQuickLink = (index: number, field: keyof ProjectLink, val: any) => {
    setQuickForm(prev => {
      const copy = [...prev.links];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, links: copy };
    });
  };

  const handleRemoveQuickLink = (index: number) => {
    setQuickForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleStatusChange = async (id: number, newStatus: ProjectStatus) => {
    try {
      const res = await api.projects.updateStatus(id, newStatus);
      if (res.success) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        success(`Status updated to ${newStatus}`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const res = await api.projects.toggleFeatured(id);
      if (res.success) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, is_featured: res.is_featured } : p));
        success(res.is_featured ? 'Project marked as Featured!' : 'Removed from Featured');
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle featured');
    }
  };

  const handleTogglePublish = async (id: number) => {
    if (togglingId === id) return;
    setTogglingId(id);
    try {
      const res = await api.projects.togglePublish(id);
      if (res.success) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, is_published: res.is_published } : p));
        success(res.is_published ? 'Project Published to Public Site!' : 'Project Unpublished (Hidden)');
      }
    } catch (err: any) {
      error(err.message || 'Failed to toggle publish status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!await confirm(`Are you sure you want to permanently delete "${name}" and all its features, workflows, and screenshots?`, { title: 'Delete Project', isDangerous: true })) {
      return;
    }

    try {
      const res = await api.projects.delete(id);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        success('Project deleted successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Project Portfolio Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create, edit, publish, feature, and configure deep project case studies, summaries, dates, and external interactive links.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('/admin/projects/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Project</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Upcoming">Upcoming</option>
            <option value="On Hold">On Hold</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">Project Overview</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-center">Published</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading project catalog...
                  </td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map(project => {
                  const isFeatured = project.is_featured === 1 || project.is_featured === true;
                  const isPublished = project.is_published === 1 || project.is_published === true;
                  const isOwner = user?.id === project.created_by || user?.role === 'super_admin' || user?.role === 'project_manager';
                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      {/* Project Overview */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.cover_image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {project.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {project.short_description}
                            </p>
                            {project.links && project.links.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {project.links.length} Link{project.links.length > 1 ? 's' : ''}:
                                </span>
                                {project.links.map((l, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {l.label || l.link_type}
                                  </span>
                                ))}
                              </div>
                            )}
                            {project.brochures && project.brochures.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {project.brochures.length} Doc{project.brochures.length > 1 ? 's' : ''}:
                                </span>
                                {project.brochures.map((b, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                    <FileText className="w-2.5 h-2.5" />
                                    <span className="truncate max-w-[120px]">{b.title || 'Document'}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {project.category ? (
                          <CategoryBadge name={project.category.name} color={project.category.color} />
                        ) : (
                          <span className="text-slate-400 text-xs">Uncategorized</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={project.status}
                          onChange={e => handleStatusChange(project.id, e.target.value as ProjectStatus)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Upcoming">Upcoming</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {hasPermission('projects.edit') ? (
                          <button
                            onClick={() => handleToggleFeatured(project.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isFeatured
                                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                            }`}
                            title={isFeatured ? 'Featured (Click to unfeature)' : 'Not featured (Click to feature)'}
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        ) : (
                          <div
                            className="p-1.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 cursor-not-allowed"
                            title="Permission required to feature projects"
                          >
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Published Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {hasPermission('projects.publish') ? (
                          <button
                            onClick={() => handleTogglePublish(project.id)}
                            disabled={togglingId === project.id}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                              isPublished
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                            }`}
                            title={isPublished ? 'Published on website (Click to hide)' : 'Hidden draft (Click to publish)'}
                          >
                            {togglingId === project.id
                              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                              : isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />
                            }
                          </button>
                        ) : (
                          <div
                            className="p-1.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 cursor-not-allowed"
                            title="Permission required to publish projects"
                          >
                            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasPermission('projects.edit') && (
                            <button
                              onClick={() => handleOpenQuickEdit(project)}
                              className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                              title="Quick Edit Summary, Dates & Links"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate(`/projects/${project.slug}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Preview on Public Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          {hasPermission('projects.edit') ? (
                            <button
                              onClick={() => onNavigate(`/admin/projects/edit/${project.id}`)}
                              className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Full Edit (Narrative, Features, Tech Stack)"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          ) : (
                            <div
                              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                              title="Permission required to edit projects"
                            >
                              <Edit className="w-4 h-4" />
                            </div>
                          )}
                          {hasPermission('projects.delete') ? (
                            <button
                              onClick={() => handleDelete(project.id, project.name)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <div
                              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                              title="Permission required to delete projects"
                            >
                              <Trash2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <FolderKanban className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No projects found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Create your first showcase project or try adjusting your search filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('/admin/projects/new')}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Create New Project</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK EDIT MODAL (Summary, Dates & Links) */}
      <Modal
        isOpen={!!quickEditProject}
        onClose={() => setQuickEditProject(null)}
        title={quickEditProject ? `Edit Summary, Dates & Interactive Links: ${quickEditProject.name}` : 'Quick Edit'}
        maxWidth="4xl"
      >
        {quickEditProject && (
          <form onSubmit={handleSaveQuickEdit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Short Description / Executive Summary (Displayed on Cards & Case Study Header)
              </label>
              <textarea
                rows={3}
                required
                value={quickForm.short_description}
                onChange={e => setQuickForm({ ...quickForm, short_description: e.target.value })}
                placeholder="e.g. Next-generation multimodal enterprise retrieval-augmented generation (RAG) platform with sub-second semantic search over 20M+ documents."
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y"
              />
            </div>

            {/* Project Timeline Section */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Project Timeline</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    value={quickForm.start_date}
                    onChange={e => setQuickForm({ ...quickForm, start_date: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Completion Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={quickForm.completion_date}
                    onChange={e => setQuickForm({ ...quickForm, completion_date: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* External Links Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>External Resource Links</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buttons displayed directly on the case study detail page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddQuickLink('website', 'Project Website', 'https://example.com/')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              {/* Presets */}
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mr-1">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => handleAddQuickLink('website', 'Project Website', 'https://example.com/')}
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  + Project Website
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickLink('github', 'GitHub SDK Repo', 'https://github.com/organization/repo')}
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  + GitHub SDK Repo
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuickLink('documentation', 'API & Architecture Docs', 'https://docs.example.com/')}
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  + API & Arc Docs
                </button>
              </div>

              {/* Links list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {quickForm.links.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                  >
                    <div className="w-full sm:w-36 shrink-0">
                      <select
                        value={link.link_type}
                        onChange={e => handleUpdateQuickLink(idx, 'link_type', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      >
                        <option value="website">Website</option>
                        <option value="github">GitHub</option>
                        <option value="documentation">Documentation</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div className="w-full sm:w-48 shrink-0">
                      <input
                        type="text"
                        placeholder="Button Label"
                        value={link.label}
                        onChange={e => handleUpdateQuickLink(idx, 'label', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={link.url}
                        onChange={e => handleUpdateQuickLink(idx, 'url', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuickLink(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                      title="Remove Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {quickForm.links.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    No external links configured. Click "Quick Add" above to add one.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate(`/admin/projects/edit/${quickEditProject.id}`)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Go to Full Project Editor →</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickEditProject(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuick}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingQuick ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
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

