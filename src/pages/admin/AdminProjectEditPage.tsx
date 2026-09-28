import React, { useEffect, useState } from 'react';
import { Project, ProjectCategory, Technology, ProjectCustomTechnology, ProjectFeature, ProjectWorkflow, ProjectResult, ProjectMedia, ProjectLink, ProjectStatus, ProjectBrochure } from '../../types';
import { api, resolveImageUrl } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { PDFReaderModal } from '../../components/common/PDFReaderModal';
import { stripExtension, getFileTypeBadgeLabel } from '../../utils/fileUtils';

import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Layers,
  Cpu,
  BarChart3,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Code,
  FileText,
  FileUp,
  Eye,
  Download,
  X,
  Edit2,
  AlertCircle,
  Maximize2,
  Minimize2,
  BookOpen,
  Star,
  Loader2,
  Images
} from 'lucide-react';
import { Lightbox } from '../../components/common/Lightbox';

interface AdminProjectEditPageProps {
  projectId?: number | string;
  onNavigate: (path: string) => void;
}

export const AdminProjectEditPage: React.FC<AdminProjectEditPageProps> = ({ projectId, onNavigate }) => {
  const isEditing = !!projectId && projectId !== 'new';
  const { success, error } = useToast();
  const { hasPermission, user, isLoading: authLoading } = useAuth();

  // Check permission: require projects.create for new projects
  useEffect(() => {
    if (authLoading || !user) return;
    const canCreate =
      user.role === 'super_admin' ||
      user.role === 'administrator' ||
      user.role === 'project_manager' ||
      hasPermission('projects.create') ||
      hasPermission('projects.manage');

    if (!isEditing && !canCreate) {
      error('You do not have permission to create new projects.');
      onNavigate('/admin/projects');
    }
  }, [isEditing, hasPermission, onNavigate, error, authLoading, user]);

  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'narrative' | 'features' | 'tech' | 'brochures'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  
  const tabs: ('basic' | 'narrative' | 'features' | 'tech' | 'brochures')[] = ['basic', 'narrative', 'features', 'tech', 'brochures'];
  const currentTabIndex = tabs.indexOf(activeTab);
  
  const handleNext = () => {
    const nextIndex = currentTabIndex + 1;
    if (nextIndex < tabs.length) {
      const nextTab = tabs[nextIndex];
      console.log(`Navigating to tab: ${nextTab} (index ${nextIndex})`);
      setActiveTab(nextTab);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };
  
  const handlePrev = () => {
    const prevIndex = currentTabIndex - 1;
    if (prevIndex >= 0) {
      const prevTab = tabs[prevIndex];
      console.log(`Navigating to tab: ${prevTab} (index ${prevIndex})`);
      setActiveTab(prevTab);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; current: number } | null>(null);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [projectCreatedBy, setProjectCreatedBy] = useState<number | null>(null);

  const handleMultipleImagesUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      error('Please select valid image files (JPEG, PNG, WebP, SVG, GIF).');
      return;
    }

    setIsUploadingCover(true);
    setUploadProgress({ total: imageFiles.length, current: 0 });

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          const res = await api.uploadFile(file);
          if (res.success && res.url) {
            uploadedUrls.push(res.url);
          }
        } catch (err) {
          console.error(`Error uploading file ${file.name}:`, err);
        }
        setUploadProgress({ total: imageFiles.length, current: i + 1 });
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => {
          let newCover = prev.cover_image;
          if (!newCover || newCover.trim() === '') {
            newCover = uploadedUrls[0];
          }

          const existingUrls = new Set((prev.media || []).map(m => m.url));
          const newMediaItems: ProjectMedia[] = [];

          // If previous cover wasn't in media, add it
          if (prev.cover_image && !existingUrls.has(prev.cover_image)) {
            newMediaItems.push({
              media_type: 'image',
              url: prev.cover_image,
              caption: ''
            });
            existingUrls.add(prev.cover_image);
          }

          uploadedUrls.forEach(url => {
            if (!existingUrls.has(url)) {
              newMediaItems.push({
                media_type: 'image',
                url,
                caption: ''
              });
              existingUrls.add(url);
            }
          });

          return {
            ...prev,
            cover_image: newCover,
            media: [...(prev.media || []), ...newMediaItems]
          };
        });

        success(`Successfully uploaded ${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'image' : 'images'}!`);
      } else {
        error('Failed to upload images. Please check the files and try again.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      error(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingCover(false);
      setUploadProgress(null);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleMultipleImagesUpload(files);
    }
    e.target.value = '';
  };

  const handleSetCoverImage = (url: string) => {
    setForm(prev => {
      const existingUrls = new Set((prev.media || []).map(m => m.url));
      const updatedMedia = existingUrls.has(url)
        ? prev.media
        : [{ media_type: 'image' as const, url, caption: '' }, ...(prev.media || [])];

      return {
        ...prev,
        cover_image: url,
        media: updatedMedia
      };
    });
    success('Set as primary cover image!');
  };

  const handleRemoveMediaItem = (urlToRemove: string) => {
    setForm(prev => {
      const updatedMedia = (prev.media || []).filter(m => m.url !== urlToRemove);
      let updatedCover = prev.cover_image;

      if (prev.cover_image === urlToRemove) {
        updatedCover = updatedMedia.length > 0 ? updatedMedia[0].url : '';
      }

      return {
        ...prev,
        cover_image: updatedCover,
        media: updatedMedia
      };
    });
    success('Image removed.');
  };

  const handleUpdateMediaCaption = (url: string, caption: string) => {
    setForm(prev => ({
      ...prev,
      media: (prev.media || []).map(m => m.url === url ? { ...m, caption } : m)
    }));
  };

  const handleAddExternalImageUrl = (url: string) => {
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();

    setForm(prev => {
      let updatedCover = prev.cover_image;
      if (!updatedCover) {
        updatedCover = cleanUrl;
      }
      const existingUrls = new Set((prev.media || []).map(m => m.url));
      const updatedMedia = existingUrls.has(cleanUrl)
        ? prev.media
        : [...(prev.media || []), { media_type: 'image' as const, url: cleanUrl, caption: '' }];

      return {
        ...prev,
        cover_image: updatedCover,
        media: updatedMedia
      };
    });
    success('Image added to gallery!');
  };

  // Form State
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    category_id: number | null;
    client_name: string;
    status: ProjectStatus;
    is_featured: boolean;
    is_published: boolean;
    priority: number;
    start_date: string;
    completion_date: string;
    cover_image: string;
    short_description: string;
    full_description: string;
    purpose: string;
    what_it_does: string;
    problems_solved: string;
    title_overview?: string;
    title_solution?: string;
    title_problems?: string;
    title_features?: string;
    custom_technologies: ProjectCustomTechnology[];
    features: ProjectFeature[];
    results: ProjectResult[];
    media: ProjectMedia[];
    links: ProjectLink[];
    brochures: ProjectBrochure[];
  }>({
    name: '',
    slug: '',
    category_id: null,
    client_name: '',
    status: 'Ongoing',
    is_featured: false,
    is_published: true,
    priority: 5,
    start_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    cover_image: '',
    short_description: '',
    full_description: '',
    purpose: '',
    what_it_does: '',
    problems_solved: '',
    title_overview: 'What is this Project?',
    title_solution: 'What This Project Does',
    title_problems: 'What Problem Does It Solve?',
    title_features: 'Key Features & Capabilities',
    custom_technologies: [],
    features: [],
    results: [],
    media: [],
    links: [],
    brochures: []
  });

  // Load taxonomies & existing project data if editing
  useEffect(() => {
    Promise.all([
      api.categories.getAll(),
      api.technologies.getAll()
    ]).then(([cRes, tRes]) => {
      if (cRes.categories) setCategories(cRes.categories);
      if (tRes.technologies) setTechnologies(tRes.technologies);
    }).catch(err => console.error(err));

    if (isEditing) {
      api.projects.getBySlug(String(projectId)).then(res => {
        if (res.project) {
          const p = res.project;
          
          // Check ownership & editing permissions
          if (user) {
            const canEdit =
              user.role === 'super_admin' ||
              user.role === 'administrator' ||
              user.role === 'project_manager' ||
              hasPermission('projects.edit') ||
              hasPermission('projects.manage') ||
              String(p.created_by) === String(user.id);

            if (!canEdit) {
              error('You do not have permission to edit this project.');
              onNavigate('/admin/projects');
              return;
            }
          }
          
          setProjectCreatedBy(p.created_by ? parseInt(String(p.created_by)) || null : null);
          setForm({
            name: p.name || '',
            slug: p.slug || '',
            category_id: p.category_id ? parseInt(String(p.category_id)) || null : null,
            client_name: p.client_name || '',
            status: p.status || 'Ongoing',
            is_featured: p.is_featured === 1 || p.is_featured === true,
            is_published: p.is_published === 1 || p.is_published === true,
            priority: p.priority || 5,
            start_date: p.start_date ? p.start_date.split('T')[0] : '',
            completion_date: p.completion_date ? p.completion_date.split('T')[0] : '',
            cover_image: p.cover_image || '',
            short_description: p.short_description || '',
            full_description: p.full_description || '',
            purpose: p.purpose || '',
            what_it_does: p.what_it_does || '',
            problems_solved: p.problems_solved || '',
            title_overview: p.title_overview || 'What is this Project?',
            title_solution: p.title_solution || 'What This Project Does',
            title_problems: p.title_problems || 'What Problem Does It Solve?',
            title_features: p.title_features || 'Key Features & Capabilities',
            custom_technologies: p.custom_technologies && p.custom_technologies.length > 0 ? p.custom_technologies : [],
            features: p.features && p.features.length > 0 ? p.features : [],
            results: p.results && p.results.length > 0 ? p.results : [],
            media: p.media && p.media.length > 0 ? p.media : [],
            links: p.links && p.links.length > 0 ? p.links : [],
            brochures: p.brochures && p.brochures.length > 0 ? p.brochures : []
          });
        }
      }).catch(err => {
        console.error(err);
        error('Failed to load project details.');
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [projectId, isEditing]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // For NEW projects, require name, short_description, and cover_image
    if (!form.name || !form.name.trim()) {
      error('Project name is required. Please enter a name on the Basic Info tab.');
      setActiveTab('basic');
      return;
    }

    if (!form.short_description || !form.short_description.trim()) {
      // Auto-fallback to name or description if blank
      setForm(prev => ({ ...prev, short_description: prev.name.trim() }));
    }

    setIsSaving(true);
    try {
      // Auto-commit any staged brochure in newBrochure if the user uploaded a file but didn't click "Add Document"
      let finalBrochures = [...(form.brochures || [])];
      if (newBrochure.file_url && newBrochure.file_url.trim()) {
        const autoTitle = (newBrochure.title && newBrochure.title.trim()) || form.name.trim() + ' Document';
        finalBrochures.push({
          id: Date.now(),
          project_id: typeof projectId === 'number' ? projectId : parseInt(String(projectId)) || 0,
          title: autoTitle,
          description: newBrochure.description.trim(),
          file_type: newBrochure.file_type,
          file_url: newBrochure.file_url,
          thumbnail_url: newBrochure.thumbnail_url || undefined,
          file_size_mb: newBrochure.file_size_mb,
          display_order: finalBrochures.length
        });
      }

      if (isEditing) {
        // Build explicit data object - DO NOT use spread operator for form
        // because some fields might not serialize correctly
        const dataToSend = {
          name: form.name,
          slug: form.slug,
          category_id: form.category_id,
          client_name: form.client_name,
          status: form.status,
          is_featured: form.is_featured,
          is_published: form.is_published,
          priority: form.priority,
          start_date: form.start_date || null,
          completion_date: form.completion_date || null,
          cover_image: form.cover_image, // EXPLICITLY include - might be empty string
          short_description: form.short_description,
          full_description: form.full_description,
          purpose: form.purpose,
          what_it_does: form.what_it_does,
          problems_solved: form.problems_solved,
          title_overview: form.title_overview,
          title_solution: form.title_solution,
          title_problems: form.title_problems,
          title_features: form.title_features,
          custom_technologies: form.custom_technologies || [],
          features: form.features || [],
          results: form.results || [],
          media: Array.isArray(form.media) ? form.media.map(m => ({
            media_type: m.media_type || 'image',
            url: m.url,
            caption: m.caption || ''
          })) : [],
          links: form.links || [],
          brochures: finalBrochures
        };
        
        console.log('=== FRONTEND: SAVING PROJECT (EDIT) ===');
        console.log('Sending data:', {
          name: dataToSend.name,
          cover_image: dataToSend.cover_image === '' ? '(empty string)' : dataToSend.cover_image,
          mediaCount: dataToSend.media.length,
          allMediaUrls: dataToSend.media.map(m => m.url),
          brochuresCount: dataToSend.brochures.length
        });
        
        const res = await api.projects.update(Number(projectId), dataToSend);
        console.log('✓ Update response received:', { success: res.success, message: res.message });
        
        if (res.success) {
          success('Project updated successfully!');
          onNavigate('/admin/projects');
        } else {
          error(res.message || 'Failed to update project');
        }
      } else {
        // For new projects - same explicit approach
        const dataToSend = {
          name: form.name,
          slug: form.slug,
          category_id: form.category_id,
          client_name: form.client_name,
          status: form.status,
          is_featured: form.is_featured,
          is_published: form.is_published,
          priority: form.priority,
          start_date: form.start_date || null,
          completion_date: form.completion_date || null,
          cover_image: form.cover_image,
          short_description: form.short_description,
          full_description: form.full_description,
          purpose: form.purpose,
          what_it_does: form.what_it_does,
          problems_solved: form.problems_solved,
          title_overview: form.title_overview,
          title_solution: form.title_solution,
          title_problems: form.title_problems,
          title_features: form.title_features,
          custom_technologies: form.custom_technologies || [],
          features: form.features || [],
          results: form.results || [],
          media: Array.isArray(form.media) ? form.media.map(m => ({
            media_type: m.media_type || 'image',
            url: m.url,
            caption: m.caption || ''
          })) : [],
          links: form.links || [],
          brochures: finalBrochures
        };
        
        const res = await api.projects.create(dataToSend);
        if (res.success) {
          success('New project created successfully!');
          onNavigate('/admin/projects');
        } else {
          error(res.message || 'Failed to create project');
        }
      }
    } catch (err: any) {
      console.error('Save error:', err);
      error(err.message || 'Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sub-entity helpers: Features
  const addFeature = () => {
    setForm(prev => ({
      ...prev,
      features: [...prev.features, { title: '', description: '', icon: 'CheckCircle' }]
    }));
  };
  const updateFeature = (idx: number, field: keyof ProjectFeature, val: any) => {
    setForm(prev => {
      const updated = [...prev.features];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, features: updated };
    });
  };
  const removeFeature = (idx: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  // Sub-entity helpers: Custom Technologies
  const addCustomTech = () => {
    setForm(prev => ({
      ...prev,
      custom_technologies: [
        ...(prev.custom_technologies || []),
        {
          name: '',
          category: 'Tooling',
          color: '#6366f1'
        }
      ]
    }));
  };
  const updateCustomTech = (idx: number, field: keyof ProjectCustomTechnology, val: any) => {
    setForm(prev => {
      const updated = [...(prev.custom_technologies || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, custom_technologies: updated };
    });
  };
  const removeCustomTech = (idx: number) => {
    setForm(prev => ({
      ...prev,
      custom_technologies: (prev.custom_technologies || []).filter((_, i) => i !== idx)
    }));
  };

  // Sub-entity helpers: Results
  const addResult = () => {
    setForm(prev => ({
      ...prev,
      results: [...prev.results, { metric_label: '', metric_value: '', description: '' }]
    }));
  };
  const updateResult = (idx: number, field: keyof ProjectResult, val: any) => {
    setForm(prev => {
      const updated = [...prev.results];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, results: updated };
    });
  };
  const removeResult = (idx: number) => {
    setForm(prev => ({
      ...prev,
      results: (prev.results || []).filter((_, i) => i !== idx)
    }));
  };

  // Sub-entity helpers: Brochures & Documents
  const [newBrochure, setNewBrochure] = useState<{
    title: string;
    description: string;
    file_type: 'pdf' | 'image' | 'document';
    file_url: string;
    thumbnail_url: string;
    file_size_mb?: number;
  }>({
    title: '',
    description: '',
    file_type: 'pdf',
    file_url: '',
    thumbnail_url: '',
    file_size_mb: undefined
  });
  const [isUploadingBrochureFile, setIsUploadingBrochureFile] = useState(false);
  const [isUploadingBrochureThumb, setIsUploadingBrochureThumb] = useState(false);
  const [previewBrochure, setPreviewBrochure] = useState<ProjectBrochure | null>(null);

  const handleBrochureFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      error('File size exceeds 25 MB maximum limit.');
      return;
    }

    setIsUploadingBrochureFile(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
        const isImg = file.type.includes('image');
        const fileType: 'pdf' | 'image' | 'document' = isPdf ? 'pdf' : isImg ? 'image' : 'document';
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
        const inferredTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

        setNewBrochure(prev => ({
          ...prev,
          file_url: res.url,
          file_type: fileType,
          file_size_mb: sizeMb,
          title: prev.title || inferredTitle
        }));
        success('Document file uploaded!');
      } else {
        error(res.message || 'Failed to upload document file.');
      }
    } catch (err: any) {
      error(err.message || 'Document upload error.');
    } finally {
      setIsUploadingBrochureFile(false);
      e.target.value = '';
    }
  };

  const handleBrochureThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBrochureThumb(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setNewBrochure(prev => ({ ...prev, thumbnail_url: res.url }));
        success('Cover image uploaded!');
      } else {
        error(res.message || 'Failed to upload cover image.');
      }
    } catch (err: any) {
      error(err.message || 'Cover upload error.');
    } finally {
      setIsUploadingBrochureThumb(false);
      e.target.value = '';
    }
  };

  const handleAddBrochure = () => {
    if (!newBrochure.file_url) {
      error('Please upload a PDF or document file.');
      return;
    }
    if (!newBrochure.title.trim()) {
      error('Please enter a document title.');
      return;
    }

    const brochureToAdd: ProjectBrochure = {
      id: Date.now(),
      project_id: typeof projectId === 'number' ? projectId : parseInt(String(projectId)) || 0,
      title: newBrochure.title.trim(),
      description: newBrochure.description.trim(),
      file_type: newBrochure.file_type,
      file_url: newBrochure.file_url,
      thumbnail_url: newBrochure.thumbnail_url || undefined,
      file_size_mb: newBrochure.file_size_mb,
      display_order: (form.brochures || []).length
    };

    setForm(prev => ({
      ...prev,
      brochures: [...(prev.brochures || []), brochureToAdd]
    }));

    setNewBrochure({
      title: '',
      description: '',
      file_type: 'pdf',
      file_url: '',
      thumbnail_url: '',
      file_size_mb: undefined
    });

    success('Document added to project!');
  };

  const handleRemoveBrochure = (idx: number) => {
    setForm(prev => ({
      ...prev,
      brochures: (prev.brochures || []).filter((_, i) => i !== idx)
    }));
    success('Document detached from project.');
  };

  const handleAddLink = (linkType: ProjectLink['link_type'], label: string, url: string) => {
    setForm(prev => ({
      ...prev,
      links: [...(prev.links || []), { link_type: linkType, label, url }]
    }));
  };

  const handleUpdateLink = (index: number, field: keyof ProjectLink, value: any) => {
    setForm(prev => {
      const copy = [...(prev.links || [])];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, links: copy };
    });
  };

  const handleRemoveLink = (index: number) => {
    setForm(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }));
  };

  // Unified list of all project images for preview and gallery management
  const allProjectImages: ProjectMedia[] = (() => {
    const list: ProjectMedia[] = [];
    const seen = new Set<string>();

    if (form.cover_image && form.cover_image.trim()) {
      list.push({
        media_type: 'image',
        url: form.cover_image,
        caption: (form.media || []).find(m => m.url === form.cover_image)?.caption || ''
      });
      seen.add(form.cover_image);
    }

    (form.media || []).forEach(m => {
      if (m.url && !seen.has(m.url)) {
        list.push(m);
        seen.add(m.url);
      }
    });

    return list;
  })();

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Loading project configuration...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin/projects')}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
              {isEditing ? `Edit: ${form.name || 'Project'}` : 'Create New Project Showcase'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Step {currentTabIndex + 1} of {tabs.length}: Configure complete showcase case study data
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Step {currentTabIndex + 1} of {tabs.length}
          </span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round(((currentTabIndex + 1) / tabs.length) * 100)}% Complete
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-1.5 justify-between">
        {tabs.map((tabName, idx) => {
          const tabLabels: Record<string, string> = {
            basic: 'Basic Info',
            narrative: 'Narrative',
            features: 'Features',
            tech: 'Tech Stack',
            brochures: 'Project Documents'
          };
          const isActive = activeTab === tabName;
          const isCompleted = idx < currentTabIndex;
          
          return (
            <button
              key={tabName}
              type="button"
              onClick={() => setActiveTab(tabName)}
              className="flex items-center gap-1.5 flex-1 cursor-pointer text-left hover:opacity-80 transition-opacity"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap hidden sm:inline ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {tabLabels[tabName]}
              </span>
              {idx < tabs.length - 1 && (
                <div className={`h-0.5 flex-1 ml-1.5 ${isCompleted || isActive ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Basic Information */}
      {activeTab === 'basic' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Project Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ApexCore AI Intelligence Platform"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom URL Slug (Optional - auto-generated if blank)
              </label>
              <input
                type="text"
                placeholder="e.g. apexcore-ai-platform"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Specialization Category
              </label>
              <select
                value={form.category_id || ''}
                onChange={e => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Client / Organization Name
              </label>
              <input
                type="text"
                placeholder="e.g. Vanguard Global Analytics"
                value={form.client_name}
                onChange={e => setForm({ ...form, client_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lifecycle Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Completed">Completed</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Upcoming">Upcoming</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Priority Order (1 = Top)
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Start Date
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Completion Date (Optional)
              </label>
              <input
                type="date"
                value={form.completion_date}
                onChange={e => setForm({ ...form, completion_date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Cover Image & Multi-Image Gallery */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cover Image URL or Upload Image *
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload multiple image files simultaneously or paste an image URL. Select which image is the primary cover image for portfolio cards and headers.
                </p>
              </div>

              {allProjectImages.length > 0 && (
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto border border-indigo-200/50 dark:border-indigo-800/50">
                  {allProjectImages.length} {allProjectImages.length === 1 ? 'Image' : 'Images'} in Project
                </span>
              )}
            </div>

            {/* URL input and upload button row */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required={allProjectImages.length === 0}
                  placeholder="https://images.unsplash.com/... or /uploads/asset-...png"
                  value={form.cover_image}
                  onChange={e => {
                    const newUrl = e.target.value;
                    setForm(prev => ({ ...prev, cover_image: newUrl }));
                  }}
                  onBlur={e => {
                    if (e.target.value.trim()) {
                      handleAddExternalImageUrl(e.target.value.trim());
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                />
                {form.cover_image && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, cover_image: '' }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title="Clear cover URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <label className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-md active:scale-98">
                {isUploadingCover ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading ({uploadProgress?.current || 0}/{uploadProgress?.total || 1})...</span>
                  </>
                ) : (
                  <>
                    <Images className="w-4 h-4" />
                    <span>Upload Images (Multiple)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                  className="hidden"
                />
              </label>
            </div>

            {/* Drag & Drop Multi-Image Dropzone */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDraggingImages(true);
              }}
              onDragLeave={e => {
                e.preventDefault();
                setIsDraggingImages(false);
              }}
              onDrop={e => {
                e.preventDefault();
                setIsDraggingImages(false);
                const files = Array.from(e.dataTransfer.files || []);
                if (files.length > 0) {
                  handleMultipleImagesUpload(files);
                }
              }}
              className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
                isDraggingImages
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-4 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40 hover:border-indigo-400 dark:hover:border-indigo-600'
              }`}
            >
              <label className="w-full flex flex-col items-center justify-center cursor-pointer py-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Click to browse or drag & drop multiple images here</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Supports JPG, PNG, WebP, SVG, and GIF — Select 1 or many files at once
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                  className="hidden"
                />
              </label>

              {/* Uploading progress bar */}
              {isUploadingCover && uploadProgress && (
                <div className="w-full max-w-md mt-3 space-y-1.5 animate-fade-in">
                  <div className="flex justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Uploading images to server...</span>
                    <span>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Image Gallery Manager Grid */}
            {allProjectImages.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Uploaded Project Images ({allProjectImages.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click ★ to set primary cover image
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allProjectImages.map((img, idx) => {
                    const isCover = img.url === form.cover_image;
                    return (
                      <div
                        key={`${img.url}-${idx}`}
                        className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs ${
                          isCover
                            ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Image Thumbnail & Actions Overlay */}
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                          <img
                            src={resolveImageUrl(img.url) || img.url}
                            alt={img.caption || `Image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Primary Cover</span>
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setLightboxIndex(idx);
                                setLightboxOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                              title="Preview Fullscreen"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>

                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(img.url)}
                                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                title="Make Primary Cover"
                              >
                                <Star className="w-3 h-3" />
                                <span>Set Cover</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveMediaItem(img.url)}
                              className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Caption input */}
                        <div className="p-2 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="Add caption..."
                            value={img.caption || ''}
                            onChange={e => handleUpdateMediaCaption(img.url, e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more images quick card */}
                  <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer group bg-slate-50/40 dark:bg-slate-850/20 transition-all min-h-[120px]">
                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110 transition-all mb-1" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Add More
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Select multiple files
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCoverUpload}
                      disabled={isUploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Short Description (Card Summary & Hero Subtitle) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Next-generation multimodal enterprise retrieval-augmented generation (RAG) platform..."
              value={form.short_description}
              onChange={e => setForm({ ...form, short_description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Displayed prominently on homepage featured cards, portfolio grid, search modals, and case study hero headers.
            </p>
          </div>

          {/* External Links */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>External Resource Links</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Add Website, GitHub repository, documentation, or video links displayed across project details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddLink('website', 'Project Website', 'https://example.com/')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
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
                onClick={() => handleAddLink('website', 'Project Website', 'https://example.com/')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
              >
                + Project Website
              </button>
              <button
                type="button"
                onClick={() => handleAddLink('github', 'GitHub SDK Repo', 'https://github.com/organization/repo')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
              >
                + GitHub SDK Repo
              </button>
              <button
                type="button"
                onClick={() => handleAddLink('documentation', 'API & Architecture Docs', 'https://docs.example.com/')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
              >
                + API & Arc Docs
              </button>
              <button
                type="button"
                onClick={() => handleAddLink('video', 'Project Video', 'https://youtube.com/watch?v=...')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
              >
                + Video
              </button>
            </div>

            {/* Links list */}
            {form.links && form.links.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {form.links.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                  >
                    <div className="w-full sm:w-36 shrink-0">
                      <select
                        value={link.link_type}
                        onChange={e => handleUpdateLink(idx, 'link_type', e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="website">Website</option>
                        <option value="github">GitHub</option>
                        <option value="documentation">Documentation</option>
                        <option value="video">Video</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="w-full sm:w-48 shrink-0">
                      <input
                        type="text"
                        placeholder="Button Label"
                        value={link.label}
                        onChange={e => handleUpdateLink(idx, 'label', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={e => handleUpdateLink(idx, 'url', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg shrink-0 cursor-pointer"
                      title="Remove Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No external links configured yet. Click "Quick Add" above to add a website, GitHub repo, or docs link.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Mark as Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={e => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Publish Immediately (Visible to Public)</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Narrative & Purpose */}
      {activeTab === 'narrative' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detailed Narrative & Purpose</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Short Description (Card Summary) *
            </label>
            <textarea
              rows={2}
              required
              value={form.short_description}
              onChange={e => setForm({ ...form, short_description: e.target.value })}
              placeholder="Concise 1-2 sentence executive summary..."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Overview Section Title
                </label>
                <input
                  type="text"
                  value={form.title_overview || ''}
                  onChange={e => setForm({ ...form, title_overview: e.target.value })}
                  placeholder="e.g. What is this Project?"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="w-full sm:w-2/3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Project Overview Content
                </label>
                <textarea
                  rows={4}
                  value={form.full_description}
                  onChange={e => setForm({ ...form, full_description: e.target.value })}
                  placeholder="In-depth narrative of the platform..."
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Functionality Section Title
                </label>
                <input
                  type="text"
                  value={form.title_solution || ''}
                  onChange={e => setForm({ ...form, title_solution: e.target.value })}
                  placeholder="e.g. What This Project Does"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="w-full sm:w-2/3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  What This Project Does Content
                </label>
                <textarea
                  rows={3}
                  value={form.what_it_does}
                  onChange={e => setForm({ ...form, what_it_does: e.target.value })}
                  placeholder="Clearly explain the real-world use and what it does for users..."
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Problems Section Title
                </label>
                <input
                  type="text"
                  value={form.title_problems || ''}
                  onChange={e => setForm({ ...form, title_problems: e.target.value })}
                  placeholder="e.g. What Problem Does It Solve?"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="w-full sm:w-2/3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  What Problem Does It Solve Content
                </label>
                <textarea
                  rows={3}
              value={form.problems_solved}
              onChange={e => setForm({ ...form, problems_solved: e.target.value })}
              placeholder="Describe the challenges, pain points, or inefficiencies resolved..."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y"
            />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Features & Capabilities */}
      {activeTab === 'features' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8">
          {/* Dynamic Features Matrix Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Features & Capabilities</h3>
                <p className="text-xs text-slate-400 mb-4">Add modular capabilities displayed on the project showcase page.</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Section Title:</label>
                  <input
                    type="text"
                    value={form.title_features || ''}
                    onChange={e => setForm({ ...form, title_features: e.target.value })}
                    placeholder="e.g. Key Project Features"
                    className="w-full max-w-sm bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Feature</span>
              </button>
            </div>

            <div className="space-y-4">
              {form.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Feature Title (e.g. Multimodal RAG)"
                      value={feat.title}
                      onChange={e => updateFeature(idx, 'title', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Feature Description..."
                      value={feat.description}
                      onChange={e => updateFeature(idx, 'description', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={feat.icon}
                      onChange={e => updateFeature(idx, 'icon', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs"
                    >
                      <option value="Zap">Zap (Lightning)</option>
                      <option value="ShieldCheck">Shield (Security)</option>
                      <option value="Lock">Lock (Auth)</option>
                      <option value="BarChart3">BarChart (Analytics)</option>
                      <option value="Cpu">Cpu (Compute)</option>
                      <option value="CheckCircle">Check (Quality)</option>
                      <option value="Activity">Activity (Monitoring)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Technology Stack Matrix */}
      {activeTab === 'tech' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technologies</h3>
                <p className="text-xs text-slate-400">Programming languages, frameworks, and libraries used.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    custom_technologies: [
                      ...(prev.custom_technologies || []),
                      { name: '', category: '', color: '#6366f1' }
                    ]
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tech</span>
              </button>
            </div>

            <div className="space-y-4">
              {(form.custom_technologies || []).filter(t => t.category !== 'Tooling').map((tech, idx) => {
                const originalIdx = form.custom_technologies!.indexOf(tech);
                return (
                  <div
                    key={originalIdx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: tech.color || '#6366f1', color: '#fff' }}
                    >
                      {originalIdx + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                      <div className="sm:col-span-4">
                        <select
                          value={tech.name}
                          onChange={e => {
                            const selectedTech = technologies.find(t => t.name === e.target.value);
                            if (selectedTech) {
                              updateCustomTech(originalIdx, 'name', selectedTech.name);
                              updateCustomTech(originalIdx, 'category', selectedTech.category || '');
                              updateCustomTech(originalIdx, 'color', selectedTech.color || '#6366f1');
                            }
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold"
                        >
                          <option value="">Select Technology...</option>
                          {technologies.filter(t => t.category !== 'Tooling').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Category"
                          value={tech.category}
                          onChange={e => updateCustomTech(originalIdx, 'category', e.target.value)}
                          disabled
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="color"
                          value={tech.color || '#6366f1'}
                          onChange={e => updateCustomTech(originalIdx, 'color', e.target.value)}
                          disabled
                          className="w-full h-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-not-allowed p-1"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCustomTech(originalIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Project Brochures & Documents */}
      {activeTab === 'brochures' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8">
          {/* Header & Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Project Documents</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  {(form.brochures || []).length} Attached
                </span>
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/brochures')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>Open Project Documents Center</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Document Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 space-y-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Add New Project Document</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Document / PDF File <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or click Upload"
                    value={newBrochure.file_url}
                    onChange={e => setNewBrochure({ ...newBrochure, file_url: e.target.value })}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBrochureFile ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleBrochureFileUpload}
                      disabled={isUploadingBrochureFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>Supported: PDF, Images, Word</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">Max 25 MB per upload</span>
                </p>
                {newBrochure.file_url && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-750">
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>File attached ({getFileTypeBadgeLabel(newBrochure.file_type)})</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewBrochure({
                          id: 0,
                          project_id: typeof projectId === 'number' ? projectId : 0,
                          title: newBrochure.title || 'Document Preview',
                          description: newBrochure.description,
                          file_type: newBrochure.file_type,
                          file_url: newBrochure.file_url,
                          thumbnail_url: newBrochure.thumbnail_url,
                          display_order: 0
                        })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-all cursor-pointer shadow-2xs"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <a
                        href={resolveImageUrl(newBrochure.file_url) || newBrochure.file_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all shadow-2xs"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Image Upload (Optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cover Image / Thumbnail (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or upload"
                    value={newBrochure.thumbnail_url}
                    onChange={e => setNewBrochure({ ...newBrochure, thumbnail_url: e.target.value })}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isUploadingBrochureThumb ? 'Uploading...' : 'Upload Cover'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrochureThumbUpload}
                      disabled={isUploadingBrochureThumb}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical Whitepaper & Specs v1.0"
                  value={newBrochure.title}
                  onChange={e => setNewBrochure({ ...newBrochure, title: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Brief Summary / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete technical blueprint, architecture diagram, and benchmark results."
                  value={newBrochure.description}
                  onChange={e => setNewBrochure({ ...newBrochure, description: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Add Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddBrochure}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Document to Project</span>
              </button>
            </div>
          </div>

          {/* Attached Project Documents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Attached Project Documents ({(form.brochures || []).length})
              </h4>
            </div>

            {(form.brochures || []).length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Documents Attached Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the upload box above to attach PDFs or marketing whitepapers to this project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(form.brochures || []).map((b, idx) => (
                  <div
                    key={idx}
                    className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail / Icon */}
                      <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300 dark:border-slate-700">
                        {b.thumbnail_url ? (
                          <img src={resolveImageUrl(b.thumbnail_url) || b.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-7 h-7 text-indigo-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            {getFileTypeBadgeLabel(b.file_type)}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {stripExtension(b.title) || 'Untitled Document'}
                        </h5>
                        {b.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {b.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-750">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewBrochure(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-all cursor-pointer shadow-2xs"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <a
                          href={resolveImageUrl(b.file_url) || b.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition-all shadow-2xs"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBrochure(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* High-Readability PDF Reader Modal */}
      {previewBrochure && (
        <PDFReaderModal
          isOpen={!!previewBrochure}
          onClose={() => setPreviewBrochure(null)}
          fileUrl={previewBrochure.file_url}
          title={previewBrochure.title || 'Project Document'}
          description={previewBrochure.description}
          fileType={previewBrochure.file_type}
        />
      )}

      {/* Lightbox Modal for Fullscreen Image Preview */}
      {lightboxOpen && (
        <Lightbox
          media={allProjectImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Bottom Navigation Bar */}
      <div className="pt-8 pb-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/admin/projects')}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentTabIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          {currentTabIndex < tabs.length - 1 ? (
            <div className="flex items-center gap-2.5">
              {(!user || user.role === 'super_admin' || user.role === 'administrator' || user.role === 'project_manager' || (isEditing ? hasPermission('projects.edit') : hasPermission('projects.create'))) && (
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Save changes right away"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Draft'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            (!user || user.role === 'super_admin' || user.role === 'administrator' || user.role === 'project_manager' || (isEditing ? hasPermission('projects.edit') : hasPermission('projects.create'))) && (
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-wait shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving All...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? '💾 Save All Changes' : '✨ Create & Publish Project'}</span>
                  </>
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
