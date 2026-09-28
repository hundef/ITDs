import React, { useState } from 'react';
import { api, resolveImageUrl } from '../../services/api';
import { useToast } from '../common/Toast';
import { PDFThumbnail } from '../common/PDFThumbnail';
import { PDFReaderModal } from '../common/PDFReaderModal';
import { detectFileType, formatTitleFromFileName, getFileTypeBadgeLabel, stripExtension } from '../../utils/fileUtils';
import {
  Upload,
  Trash2,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  Plus,
  X,
  Sparkles,
  CheckCircle,
  FileUp,
  ExternalLink,
  Layers,
  RefreshCw
} from 'lucide-react';

export interface BrochureItem {
  id?: number;
  project_id?: number;
  file_type: 'pdf' | 'image' | 'document';
  file_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  file_size_mb?: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface BrochureUploaderProps {
  projectId: number;
  brochures: BrochureItem[];
  onBrochuresChange: (brochures: BrochureItem[]) => void;
}

export const BrochureUploader: React.FC<BrochureUploaderProps> = ({
  projectId,
  brochures,
  onBrochuresChange
}) => {
  const { success, error } = useToast();
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadingCoverIdx, setUploadingCoverIdx] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // New Brochure Form State for Manual Add
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileType, setNewFileType] = useState<'pdf' | 'image' | 'document'>('pdf');
  const [newFileSize, setNewFileSize] = useState<number | undefined>(undefined);
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [isUploadingNewDoc, setIsUploadingNewDoc] = useState(false);
  const [isUploadingNewCover, setIsUploadingNewCover] = useState(false);
  const [previewingBrochure, setPreviewingBrochure] = useState<BrochureItem | null>(null);

  // Open Add Form
  const handleOpenAddForm = () => {
    setNewFileType('pdf');
    setNewTitle('');
    setNewDescription('');
    setNewFileUrl('');
    setNewThumbnailUrl('');
    setNewFileSize(undefined);
    setShowAddForm(true);
  };

  // Handle Multi-file Upload (PDFs, Docs, etc.)
  const processUploadedFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);
    const newBrochureItems: BrochureItem[] = [];
    const failedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

      try {
        const uploadRes = await api.uploadFile(file);
        if (!uploadRes.success || !uploadRes.url) {
          failedFiles.push(`${file.name}: ${uploadRes.message || 'Upload failed'}`);
          continue;
        }

        const detectedType = detectFileType(file.name, file.type);
        const cleanTitle = formatTitleFromFileName(file.name);
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
        const order = brochures.length + newBrochureItems.length;
        const isImg = detectedType === 'image';

        // Auto-save to backend if projectId is a valid positive number
        if (projectId && projectId > 0) {
          try {
            const saveRes = await api.post('/api/brochures', {
              project_id: projectId,
              file_type: detectedType,
              file_url: uploadRes.url,
              thumbnail_url: isImg ? uploadRes.url : undefined,
              title: cleanTitle,
              description: '',
              file_size_mb: sizeMb,
              display_order: order
            });

            if (saveRes.success && (saveRes.brochure || saveRes.data)) {
              newBrochureItems.push(saveRes.brochure || saveRes.data);
            } else {
              // Fallback to local item
              newBrochureItems.push({
                id: Date.now() + i,
                project_id: projectId,
                file_type: detectedType,
                file_url: uploadRes.url,
                thumbnail_url: isImg ? uploadRes.url : undefined,
                title: cleanTitle,
                description: '',
                file_size_mb: sizeMb,
                display_order: order
              });
            }
          } catch (saveErr) {
            newBrochureItems.push({
              id: Date.now() + i,
              project_id: projectId,
              file_type: detectedType,
              file_url: uploadRes.url,
              thumbnail_url: isImg ? uploadRes.url : undefined,
              title: cleanTitle,
              description: '',
              file_size_mb: sizeMb,
              display_order: order
            });
          }
        } else {
          // Creating project without ID yet
          newBrochureItems.push({
            id: Date.now() + i,
            project_id: projectId,
            file_type: detectedType,
            file_url: uploadRes.url,
            thumbnail_url: isImg ? uploadRes.url : undefined,
            title: cleanTitle,
            description: '',
            file_size_mb: sizeMb,
            display_order: order
          });
        }
      } catch (err: any) {
        failedFiles.push(`${file.name}: ${err.message || 'Error'}`);
      }
    }

    if (newBrochureItems.length > 0) {
      onBrochuresChange([...brochures, ...newBrochureItems]);
      success(`Successfully added ${newBrochureItems.length} document file${newBrochureItems.length === 1 ? '' : 's'}!`);
    }

    if (failedFiles.length > 0) {
      error(`Some files could not be uploaded:\n${failedFiles.join('\n')}`);
    }

    setIsUploadingFile(false);
    setUploadProgress('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Replace document file for a specific item with auto extension detection
  const handleReplaceDocForItem = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        const detectedType = detectFileType(file.name, file.type);
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
        const isImg = detectedType === 'image';

        const updated = [...brochures];
        updated[idx] = {
          ...updated[idx],
          file_url: res.url,
          file_type: detectedType,
          file_size_mb: sizeMb,
          thumbnail_url: isImg && !updated[idx].thumbnail_url ? res.url : updated[idx].thumbnail_url
        };
        onBrochuresChange(updated);

        if (updated[idx].id && typeof updated[idx].id === 'number') {
          await api.put(`/api/brochures/${updated[idx].id}`, {
            file_url: res.url,
            file_type: detectedType,
            file_size_mb: sizeMb,
            thumbnail_url: isImg && !updated[idx].thumbnail_url ? res.url : updated[idx].thumbnail_url
          });
        }
        success(`Replaced with ${file.name} (detected as ${detectedType.toUpperCase()})`);
      } else {
        error(res.message || 'Failed to upload document.');
      }
    } catch (err: any) {
      error(err.message || 'Upload failed.');
    } finally {
      e.target.value = '';
    }
  };

  // Upload Cover Image for a specific brochure item
  const handleCoverUploadForItem = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverIdx(idx);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        await handleUpdate(idx, 'thumbnail_url', res.url);
        success('Cover image updated successfully!');
      } else {
        error(res.message || 'Failed to upload cover image.');
      }
    } catch (err: any) {
      error(err.message || 'Cover upload failed.');
    } finally {
      setUploadingCoverIdx(null);
      e.target.value = '';
    }
  };

  // Upload main document in modal add form with automatic extension detection
  const handleAddFormDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingNewDoc(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        const detectedType = detectFileType(file.name, file.type);
        const inferredTitle = formatTitleFromFileName(file.name);
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

        setNewFileUrl(res.url);
        setNewFileType(detectedType);
        setNewFileSize(sizeMb);

        if (detectedType === 'image' && !newThumbnailUrl) {
          setNewThumbnailUrl(res.url);
        }

        if (!newTitle.trim()) {
          setNewTitle(inferredTitle);
        }
        success(`Uploaded ${file.name} (auto-detected as ${detectedType.toUpperCase()})`);
      } else {
        error(res.message || 'Upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'Upload failed.');
    } finally {
      setIsUploadingNewDoc(false);
      e.target.value = '';
    }
  };

  // Upload cover in modal add form
  const handleAddFormCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingNewCover(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setNewThumbnailUrl(res.url);
        success('Cover image uploaded!');
      } else {
        error(res.message || 'Upload failed.');
      }
    } catch (err: any) {
      error(err.message || 'Upload failed.');
    } finally {
      setIsUploadingNewCover(false);
      e.target.value = '';
    }
  };

  // Submit modal add form
  const handleSaveNewBrochure = async () => {
    if (!newFileUrl) {
      error('Please upload a PDF or document file.');
      return;
    }
    if (!newTitle.trim()) {
      error('Please provide a document title.');
      return;
    }

    try {
      const brochureData = {
        project_id: projectId,
        file_type: newFileType,
        file_url: newFileUrl,
        thumbnail_url: newThumbnailUrl || undefined,
        title: newTitle.trim(),
        description: newDescription.trim(),
        file_size_mb: newFileSize,
        display_order: brochures.length
      };

      if (projectId && projectId > 0) {
        const res = await api.post('/api/brochures', brochureData);
        if (res.success && (res.brochure || res.data)) {
          onBrochuresChange([...brochures, res.brochure || res.data]);
        } else {
          onBrochuresChange([...brochures, { ...brochureData, id: Date.now() }]);
        }
      } else {
        onBrochuresChange([...brochures, { ...brochureData, id: Date.now() }]);
      }

      success('Document added successfully!');
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewFileUrl('');
      setNewThumbnailUrl('');
      setNewFileSize(undefined);
      setShowAddForm(false);
    } catch (err: any) {
      error(err.message || 'Failed to add document.');
    }
  };

  // Delete brochure
  const handleDelete = async (idx: number) => {
    const brochureToDelete = brochures[idx];
    if (!window.confirm(`Are you sure you want to delete "${brochureToDelete.title || 'this document'}"?`)) {
      return;
    }

    try {
      if (brochureToDelete.id && typeof brochureToDelete.id === 'number') {
        const res = await api.delete(`/api/brochures/${brochureToDelete.id}`);
        if (!res.success) {
          console.warn('Backend delete returned unsuccessful, removing from local state:', res.message);
        }
      }

      onBrochuresChange(brochures.filter((_, i) => i !== idx));
      success('Document deleted successfully.');
    } catch (err: any) {
      console.error('Delete error:', err);
      // Still remove locally to keep UI responsive
      onBrochuresChange(brochures.filter((_, i) => i !== idx));
      success('Document removed.');
    }
  };

  // Update brochure field
  const handleUpdate = async (idx: number, field: keyof BrochureItem, value: any) => {
    const brochure = brochures[idx];
    const updated = [...brochures];
    updated[idx] = { ...updated[idx], [field]: value };
    onBrochuresChange(updated);

    if (brochure.id && typeof brochure.id === 'number') {
      try {
        await api.put(`/api/brochures/${brochure.id}`, {
          [field]: value
        });
      } catch (err: any) {
        console.warn('Background sync failed for brochure update:', err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Project Documents</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              {brochures.length}
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Attach PDFs, project documents, specification sheets, and custom cover images.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Documents Button */}
          <button
            type="button"
            onClick={() => handleOpenAddForm()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Documents</span>
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-850/50 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
            {isUploadingFile ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileUp className="w-7 h-7" />
            )}
          </div>

          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {isUploadingFile
              ? uploadProgress || 'Uploading files...'
              : 'Drag & drop PDF, Image, or Office documents here'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Supports PDF whitepapers & reports or high-resolution PNG/JPG/WEBP images (Max 25 MB per upload).
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer">
              <FileUp className="w-4 h-4" />
              <span>Select Documents</span>
              <input
                type="file"
                multiple
                accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.jfif,.doc,.docx,.xls,.xlsx"
                onChange={handleFileInputChange}
                disabled={isUploadingFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Manual Add Modal / Drawer */}
      {showAddForm && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl text-white shadow-xs bg-gradient-to-br from-indigo-500 to-violet-600">
                <FileUp className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Documents
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload PDF whitepapers, project documentation, or high-resolution images
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ApexCore Platform Executive Whitepaper"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Description / Subtitle
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief overview of the document contents, target audience, or technical specs..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column: File & Cover Image */}
            <div className="space-y-4">
              {/* Document Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Document File <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-500 transition-colors cursor-pointer">
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                      {isUploadingNewDoc
                        ? 'Uploading file...'
                        : newFileUrl
                        ? `Attached: ${stripExtension(newFileUrl.split('/').pop())}`
                        : 'Choose Document File (PDF, Image, etc.)'}
                    </span>
                    <FileUp className="w-4 h-4 text-indigo-500 shrink-0" />
                    <input
                      type="file"
                      accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.jfif,.doc,.docx,.xls,.xlsx"
                      onChange={handleAddFormDocUpload}
                      disabled={isUploadingNewDoc}
                      className="hidden"
                    />
                  </label>
                </div>
                {newFileUrl && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-750">
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>File attached ({getFileTypeBadgeLabel(newFileType, newFileUrl)})</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewingBrochure({
                          project_id: projectId,
                          title: newTitle || 'Document Preview',
                          description: newDescription,
                          file_type: newFileType,
                          file_url: newFileUrl,
                          thumbnail_url: newThumbnailUrl,
                          display_order: 0
                        })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg cursor-pointer"
                        title="View Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <a
                        href={resolveImageUrl(newFileUrl) || newFileUrl}
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

              {/* Optional Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Cover Image / Thumbnail <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  {newThumbnailUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 group">
                      <img src={newThumbnailUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewThumbnailUrl('')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Remove cover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-indigo-500 transition-colors">
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {isUploadingNewCover
                        ? 'Uploading cover image...'
                        : newThumbnailUrl
                        ? 'Change Cover Image'
                        : 'Upload Cover Image (PNG/JPG)'}
                    </span>
                    <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddFormCoverUpload}
                      disabled={isUploadingNewCover}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNewBrochure}
              disabled={!newFileUrl || !newTitle.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/20 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Save Document
            </button>
          </div>
        </div>
      )}

      {/* Brochure Cards List */}
      {brochures.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {brochures.map((brochure, idx) => (
              <div
                key={brochure.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 space-y-4"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Thumbnail / Cover Preview */}
                  <div 
                    onClick={() => setPreviewingBrochure(brochure)}
                    className="relative w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden group cursor-pointer"
                  >
                    <PDFThumbnail
                      fileUrl={resolveImageUrl(brochure.file_url) || brochure.file_url}
                      thumbnailUrl={brochure.thumbnail_url}
                      fileType={brochure.file_type}
                      title={brochure.title}
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover"
                    />

                    {/* Quick Cover Change Button */}
                    <label 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity text-[10px] font-medium p-1 text-center z-10"
                    >
                      <ImageIcon className="w-4 h-4 mb-1" />
                      <span>{uploadingCoverIdx === idx ? 'Uploading...' : 'Change Cover'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverUploadForItem(idx, e)}
                        disabled={uploadingCoverIdx === idx}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Title & File Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={brochure.title || ''}
                        onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                        placeholder="Document title"
                        className="w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 py-1 focus:outline-hidden transition-colors"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                        brochure.file_type === 'pdf'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : brochure.file_type === 'image'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {getFileTypeBadgeLabel(brochure.file_type, brochure.file_url)}
                      </span>
                      {brochure.thumbnail_url && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans">• Cover Attached</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    {/* Preview in Reader */}
                    <button
                      type="button"
                      onClick={() => setPreviewingBrochure(brochure)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Read Document in Interactive Reader"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Download */}
                    <a
                      href={resolveImageUrl(brochure.file_url) || brochure.file_url}
                      download
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Replace Document Button (Auto-Detects Extension) */}
                    <label
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-600 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400 transition-colors cursor-pointer"
                      title="Replace Document File (Auto-detects PDF / Image / Document)"
                    >
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.jfif,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleReplaceDocForItem(idx, e)}
                        className="hidden"
                      />
                    </label>

                    {/* Cover Image Upload Icon Button */}
                    <label
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title="Upload or Change Cover Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverUploadForItem(idx, e)}
                        disabled={uploadingCoverIdx === idx}
                        className="hidden"
                      />
                    </label>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description input */}
                <div>
                  <textarea
                    value={brochure.description || ''}
                    onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                    placeholder="Enter document description or summary..."
                    rows={2}
                    className="w-full text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No documents attached yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Upload files or click "Add Documents" to upload documentation.
          </p>
        </div>
      )}

      {/* Interactive PDF & Document Reader Modal */}
      {previewingBrochure && (
        <PDFReaderModal
          isOpen={!!previewingBrochure}
          onClose={() => setPreviewingBrochure(null)}
          fileUrl={previewingBrochure.file_url}
          title={previewingBrochure.title || 'Document Preview'}
          description={previewingBrochure.description}
          fileType={previewingBrochure.file_type}
          fileSizeMb={previewingBrochure.file_size_mb}
        />
      )}
    </div>
  );
};
