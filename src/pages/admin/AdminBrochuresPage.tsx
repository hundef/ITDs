import React, { useEffect, useState } from 'react';
import { Project, ProjectBrochure } from '../../types';
import { api, resolveImageUrl } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { BrochureUploader } from '../../components/admin/BrochureUploader';
import { PDFThumbnail } from '../../components/common/PDFThumbnail';
import { PDFReaderModal } from '../../components/common/PDFReaderModal';
import { detectFileType, formatTitleFromFileName, getFileTypeBadgeLabel, stripExtension } from '../../utils/fileUtils';
import {
  ArrowLeft,
  FileText,
  Loader,
  Trash2,
  Edit2,
  X,
  Upload,
  Plus,
  Search,
  Download,
  Eye,
  Image as ImageIcon,
  FolderKanban,
  CheckCircle,
  FileUp,
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen
} from 'lucide-react';

interface AdminBrochuresPageProps {
  onNavigate: (path: string) => void;
}

interface BrochureWithProject extends ProjectBrochure {
  project_name?: string;
  project_slug?: string;
}

export const AdminBrochuresPage: React.FC<AdminBrochuresPageProps> = ({ onNavigate }) => {
  const { success, error } = useToast();

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null); // null = "All Projects"
  const [projectSearch, setProjectSearch] = useState('');

  // Brochures State
  const [brochures, setBrochures] = useState<BrochureWithProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isFetchingBrochures, setIsFetchingBrochures] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<{
    project_id: number | null;
    title: string;
    description: string;
    file_type: 'pdf' | 'image' | 'document';
    file_url: string;
    thumbnail_url: string;
    file_size_mb?: number;
    display_order: number;
  }>({
    project_id: null,
    title: '',
    description: '',
    file_type: 'pdf',
    file_url: '',
    thumbnail_url: '',
    file_size_mb: undefined,
    display_order: 0
  });
  const [isUploadingAddDoc, setIsUploadingAddDoc] = useState(false);
  const [isUploadingAddCover, setIsUploadingAddCover] = useState(false);
  const [isSavingAdd, setIsSavingAdd] = useState(false);

  // Edit Modal State
  const [editingBrochure, setEditingBrochure] = useState<BrochureWithProject | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    project_id: number;
    file_url: string;
    file_type: 'pdf' | 'image' | 'document';
    thumbnail_url: string;
    file_size_mb?: number;
    display_order: number;
  }>({
    title: '',
    description: '',
    project_id: 0,
    file_url: '',
    file_type: 'pdf',
    thumbnail_url: '',
    file_size_mb: undefined,
    display_order: 0
  });
  const [isUploadingEditDoc, setIsUploadingEditDoc] = useState(false);
  const [isUploadingEditCover, setIsUploadingEditCover] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingBrochure, setDeletingBrochure] = useState<BrochureWithProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // PDF / Document Viewer Modal
  const [previewBrochure, setPreviewBrochure] = useState<BrochureWithProject | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // 1. Load All Projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const res = await api.projects.getAll({ limit: 100, published: 'all' });
        if (res.projects && Array.isArray(res.projects)) {
          setProjects(res.projects);
          if (res.projects.length > 0 && selectedProjectId === null) {
            // Leave as all projects initially, or user can select
          }
        }
      } catch (err: any) {
        console.error('Error loading projects:', err);
        // Fallback to direct api.get
        try {
          const res2 = await api.get('/api/projects?limit=100');
          if (res2 && res2.projects) {
            setProjects(res2.projects);
          }
        } catch (e) {
          error('Failed to load projects list.');
        }
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [error]);

  // 2. Load Brochures (for specific project or all projects)
  const fetchBrochures = async () => {
    try {
      setIsFetchingBrochures(true);
      let endpoint = '/api/brochures';
      if (selectedProjectId) {
        endpoint += `?projectId=${selectedProjectId}`;
      }
      const response = await api.get(endpoint);
      if (response && response.success) {
        const list = response.brochures || response.data || [];
        setBrochures(Array.isArray(list) ? list : []);
      } else {
        setBrochures([]);
      }
    } catch (err: any) {
      console.error('Error loading brochures:', err);
      error(err.message || 'Failed to load brochures');
      setBrochures([]);
    } finally {
      setIsFetchingBrochures(false);
    }
  };

  useEffect(() => {
    fetchBrochures();
  }, [selectedProjectId]);

  // Handle brochure changes from inline BrochureUploader component
  const handleBrochuresChange = (updated: ProjectBrochure[]) => {
    setBrochures(updated as BrochureWithProject[]);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setAddForm({
      project_id: selectedProjectId || (projects[0]?.id || null),
      title: '',
      description: '',
      file_type: 'pdf',
      file_url: '',
      thumbnail_url: '',
      file_size_mb: undefined,
      display_order: brochures.length
    });
    setShowAddModal(true);
  };

  // Upload PDF for Add Form
  const handleAddDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAddDoc(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        const detectedType = detectFileType(file.name, file.type);
        const inferredTitle = formatTitleFromFileName(file.name);
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

        setAddForm((prev) => ({
          ...prev,
          file_url: res.url,
          file_type: detectedType,
          thumbnail_url: detectedType === 'image' ? res.url : prev.thumbnail_url,
          file_size_mb: sizeMb,
          title: prev.title || inferredTitle
        }));
        success(`Uploaded ${file.name} (detected as ${detectedType.toUpperCase()})`);
      } else {
        error(res.message || 'File upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'Upload error');
    } finally {
      setIsUploadingAddDoc(false);
      e.target.value = '';
    }
  };

  // Upload Cover Image for Add Form
  const handleAddCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAddCover(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setAddForm((prev) => ({ ...prev, thumbnail_url: res.url }));
        success('Cover image uploaded!');
      } else {
        error(res.message || 'Cover upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'Upload error');
    } finally {
      setIsUploadingAddCover(false);
      e.target.value = '';
    }
  };

  // Save New Brochure
  const handleSaveNewBrochure = async () => {
    if (!addForm.project_id) {
      error('Please select a project for this document.');
      return;
    }
    if (!addForm.file_url) {
      error('Please upload a PDF or document file.');
      return;
    }
    if (!addForm.title.trim()) {
      error('Please provide a document title.');
      return;
    }

    try {
      setIsSavingAdd(true);
      const res = await api.post('/api/brochures', {
        project_id: addForm.project_id,
        title: addForm.title.trim(),
        description: addForm.description.trim(),
        file_type: addForm.file_type,
        file_url: addForm.file_url,
        thumbnail_url: addForm.thumbnail_url || undefined,
        file_size_mb: addForm.file_size_mb,
        display_order: addForm.display_order
      });

      if (res.success) {
        success('Project document created successfully!');
        setShowAddModal(false);
        fetchBrochures();
      } else {
        error(res.message || 'Failed to create document.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to create document.');
    } finally {
      setIsSavingAdd(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (brochure: BrochureWithProject) => {
    setEditingBrochure(brochure);
    setEditForm({
      title: brochure.title || '',
      description: brochure.description || '',
      project_id: brochure.project_id || 0,
      file_url: brochure.file_url || '',
      file_type: brochure.file_type || 'pdf',
      thumbnail_url: brochure.thumbnail_url || '',
      file_size_mb: brochure.file_size_mb,
      display_order: brochure.display_order || 0
    });
  };

  // Upload PDF in Edit Modal
  const handleEditDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditDoc(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        const detectedType = detectFileType(file.name, file.type);
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

        setEditForm((prev) => ({
          ...prev,
          file_url: res.url,
          file_type: detectedType,
          thumbnail_url: detectedType === 'image' ? res.url : prev.thumbnail_url,
          file_size_mb: sizeMb
        }));
        success(`Updated file (detected as ${detectedType.toUpperCase()})`);
      } else {
        error(res.message || 'Upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'Upload error');
    } finally {
      setIsUploadingEditDoc(false);
      e.target.value = '';
    }
  };

  // Upload Cover in Edit Modal
  const handleEditCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditCover(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setEditForm((prev) => ({ ...prev, thumbnail_url: res.url }));
        success('Updated cover image uploaded!');
      } else {
        error(res.message || 'Cover upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'Upload error');
    } finally {
      setIsUploadingEditCover(false);
      e.target.value = '';
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingBrochure || !editingBrochure.id) return;
    if (!editForm.title.trim()) {
      error('Title cannot be empty.');
      return;
    }

    try {
      setIsSavingEdit(true);
      const res = await api.put(`/api/brochures/${editingBrochure.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        project_id: editForm.project_id,
        file_url: editForm.file_url,
        file_type: editForm.file_type,
        thumbnail_url: editForm.thumbnail_url || null,
        file_size_mb: editForm.file_size_mb,
        display_order: editForm.display_order
      });

      if (res.success) {
        success('Document updated successfully!');
        setEditingBrochure(null);
        fetchBrochures();
      } else {
        error(res.message || 'Failed to update document.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update document.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Brochure
  const handleConfirmDelete = async () => {
    if (!deletingBrochure || !deletingBrochure.id) return;

    try {
      setIsDeleting(true);
      const res = await api.delete(`/api/brochures/${deletingBrochure.id}`);
      if (res.success) {
        success('Document deleted successfully.');
        setBrochures((prev) => prev.filter((b) => b.id !== deletingBrochure.id));
        setDeletingBrochure(null);
      } else {
        error(res.message || 'Failed to delete document.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered brochures list
  const filteredBrochures = brochures.filter((b) => {
    return (
      !searchQuery.trim() ||
      (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.project_name && b.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredProjects = projects.filter((p) => {
    const name = p.name || (p as any).title || '';
    return name.toLowerCase().includes(projectSearch.toLowerCase());
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 lg:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
              title="Back to Projects"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Project Documents
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  {brochures.length} Total
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Upload and manage project PDF documents, technical specifications, and cover images.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Add Documents Button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Documents</span>
            </button>
          </div>
        </div>

        {/* Documents Viewer & Management Full Width */}
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      selectedProject
                        ? `Search documents in ${selectedProject.name || (selectedProject as any).title}...`
                        : 'Search project documents across all projects...'
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Selected Project Banner */}
              {selectedProject && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedProject.name || (selectedProject as any).title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {brochures.length} document{brochures.length === 1 ? '' : 's'} linked to this project
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(`/admin/projects/edit/${selectedProject.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <span>Edit Project</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Documents Grid / List */}
            {isFetchingBrochures ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-16">
                <Loader className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading documents...</p>
              </div>
            ) : filteredBrochures.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center py-16 space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No Documents Found</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No documents match your search query. Try clearing filters.'
                      : selectedProject
                      ? `No documents have been uploaded for "${selectedProject.name || (selectedProject as any).title}" yet.`
                      : 'No documents in repository. Click below to add the first one!'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAddModal()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Documents</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredBrochures.map((brochure) => (
                  <div
                    key={brochure.id}
                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Preview Area with Cover Image or PDF Thumbnail */}
                    <div 
                      onClick={() => setPreviewBrochure(brochure)}
                      className="relative h-48 bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      <PDFThumbnail
                        fileUrl={resolveImageUrl(brochure.file_url) || brochure.file_url}
                        thumbnailUrl={brochure.thumbnail_url}
                        fileType={brochure.file_type}
                        title={brochure.title}
                        className="w-full h-full"
                        imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase backdrop-blur-md tracking-wider ${
                          brochure.file_type === 'pdf'
                            ? 'bg-rose-900/80 text-white'
                            : brochure.file_type === 'image'
                            ? 'bg-indigo-900/80 text-white'
                            : 'bg-black/70 text-white'
                        }`}>
                          {getFileTypeBadgeLabel(brochure.file_type, brochure.file_url)}
                        </span>
                      </div>

                      {/* Project Name Badge */}
                      {brochure.project_name && (
                        <div className="absolute bottom-3 left-3 right-3 truncate">
                          <span className="inline-block max-w-full truncate px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/90 backdrop-blur-md text-white">
                            📁 {brochure.project_name}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay with Preview & Download Actions */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-2xs">
                        <button
                          type="button"
                          onClick={() => setPreviewBrochure(brochure)}
                          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl transition-transform active:scale-95 cursor-pointer"
                          title="Preview in browser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={resolveImageUrl(brochure.file_url) || brochure.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-md shadow-xl transition-transform active:scale-95"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Bottom Metadata & Controls */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {stripExtension(brochure.title) || 'Untitled Document'}
                        </h3>
                        {brochure.description ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {brochure.description}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No description provided</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                          <span>{brochure.created_at ? new Date(brochure.created_at).toLocaleDateString() : 'Active'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewBrochure(brochure)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Preview / Read Online"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={resolveImageUrl(brochure.file_url) || brochure.file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(brochure)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title="Edit Document"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingBrochure(brochure)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

      {/* ============================================================ */}
      {/* ADD PROJECT DOCUMENT MODAL */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 lg:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl text-white shadow-md bg-gradient-to-br from-indigo-500 to-violet-600">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Add Documents
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload PDF specifications, reports, whitepapers, or promotional images
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              {/* Project Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Project <span className="text-rose-500">*</span>
                </label>
                <select
                  value={addForm.project_id || ''}
                  onChange={(e) => setAddForm({ ...addForm, project_id: parseInt(e.target.value) || null })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    -- Select Project --
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || (p as any).title} ({p.status || 'Active'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Document Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addForm.title}
                      onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                      placeholder="e.g. Platform Architecture Whitepaper"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Description / Subtitle
                    </label>
                    <textarea
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      rows={3}
                      placeholder="Brief summary of what this document contains..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                {/* Upload Zones */}
                <div className="space-y-4">
                  {/* Main File Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Document File <span className="text-rose-500">*</span>
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-500 transition-all text-center cursor-pointer">
                      <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isUploadingAddDoc
                          ? 'Uploading file...'
                          : addForm.file_url
                          ? 'Replace Document File'
                          : 'Click to Upload Document (PDF, Image, etc.)'}
                      </span>
                      {addForm.file_url && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 truncate max-w-[200px]">
                          ✓ {stripExtension(addForm.file_url.split('/').pop()) || 'File uploaded'}
                        </span>
                      )}
                      <input
                        type="file"
                        accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.jfif,.doc,.docx,.xls,.xlsx"
                        onChange={handleAddDocUpload}
                        disabled={isUploadingAddDoc}
                        className="hidden"
                      />
                      {addForm.file_url && (
                        <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[140px]">
                            ✓ Attached
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewBrochure({
                                  id: 0,
                                  project_id: addForm.project_id || 0,
                                  title: addForm.title || 'Document Preview',
                                  description: addForm.description,
                                  file_type: addForm.file_type,
                                  file_url: addForm.file_url,
                                  thumbnail_url: addForm.thumbnail_url,
                                  display_order: 0
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg cursor-pointer"
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <a
                              href={resolveImageUrl(addForm.file_url) || addForm.file_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg"
                              title="Download Document"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
                      <span>Supported: PDF, Images, Word</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">Max 25 MB per upload</span>
                    </p>
                  </div>

                  {/* Optional Cover Image Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Cover Image <span className="text-slate-400 font-normal">(Optional Thumbnail)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {addForm.thumbnail_url ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 group">
                          <img src={addForm.thumbnail_url} alt="Cover" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAddForm({ ...addForm, thumbnail_url: '' })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}

                      <label className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-indigo-500 transition-colors">
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {isUploadingAddCover
                            ? 'Uploading cover...'
                            : addForm.thumbnail_url
                            ? 'Change Cover Image'
                            : 'Upload Cover (PNG/JPG)'}
                        </span>
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAddCoverUpload}
                          disabled={isUploadingAddCover}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewBrochure}
                disabled={isSavingAdd || !addForm.file_url || !addForm.title.trim() || !addForm.project_id}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/20 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingAdd ? 'Saving...' : 'Save Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT PROJECT DOCUMENT MODAL */}
      {/* ============================================================ */}
      {editingBrochure && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 lg:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Project Document</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update document details, PDF, or cover image</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBrochure(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Reassign Project
                </label>
                <select
                  value={editForm.project_id}
                  onChange={(e) => setEditForm({ ...editForm, project_id: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || (p as any).title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Document Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Replace Document */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Document File
                    </label>
                    <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-indigo-500 transition-colors">
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {isUploadingEditDoc
                          ? 'Uploading new file...'
                          : `Current: ${editForm.file_url.split('/').pop()}`}
                      </span>
                      <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="file"
                        accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.jfif,.doc,.docx,.xls,.xlsx"
                        onChange={handleEditDocUpload}
                        disabled={isUploadingEditDoc}
                        className="hidden"
                      />
                    </label>
                    {editForm.file_url && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {getFileTypeBadgeLabel(editForm.file_type, editForm.file_url)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewBrochure({
                              id: editingBrochure?.id || 0,
                              project_id: editForm.project_id,
                              title: editForm.title || 'Document Preview',
                              description: editForm.description,
                              file_type: editForm.file_type,
                              file_url: editForm.file_url,
                              thumbnail_url: editForm.thumbnail_url,
                              display_order: editForm.display_order
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg cursor-pointer"
                            title="View Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <a
                            href={resolveImageUrl(editForm.file_url) || editForm.file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
                      <span>Supported: PDF, Images, Word</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">Max 25 MB per upload</span>
                    </p>
                  </div>

                  {/* Replace Cover Image */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Cover Image / Thumbnail
                    </label>
                    <div className="flex items-center gap-3">
                      {editForm.thumbnail_url ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 group">
                          <img src={editForm.thumbnail_url} alt="Cover" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, thumbnail_url: '' })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            title="Remove cover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}

                      <label className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-indigo-500 transition-colors">
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {isUploadingEditCover
                            ? 'Uploading cover...'
                            : editForm.thumbnail_url
                            ? 'Change Cover Image'
                            : 'Upload Cover Image'}
                        </span>
                        <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditCoverUpload}
                          disabled={isUploadingEditCover}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingBrochure(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editForm.title.trim()}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {isSavingEdit ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {deletingBrochure && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Document?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  "{deletingBrochure.title || 'this document'}"
                </strong>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingBrochure(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* HIGH-READABILITY PDF & DOCUMENT READER MODAL */}
      {/* ============================================================ */}
      {previewBrochure && (
        <PDFReaderModal
          isOpen={!!previewBrochure}
          onClose={() => setPreviewBrochure(null)}
          fileUrl={previewBrochure.file_url}
          title={previewBrochure.title || 'Document Reader'}
          description={previewBrochure.description}
          fileType={previewBrochure.file_type}
          fileSizeMb={previewBrochure.file_size_mb}
        />
      )}
      </div>
    </div>
  );
};
