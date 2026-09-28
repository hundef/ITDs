import React, { useState } from 'react';
import { ProjectBrochure } from '../../types';
import { resolveImageUrl } from '../../services/api';
import { PDFThumbnail } from '../common/PDFThumbnail';
import { PDFReaderModal } from '../common/PDFReaderModal';
import { detectFileType, getFileTypeBadgeLabel, stripExtension } from '../../utils/fileUtils';
import {
  Download,
  FileText,
  ExternalLink,
  Eye,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface BrochureViewerProps {
  brochures: ProjectBrochure[];
}

export const BrochureViewer: React.FC<BrochureViewerProps> = ({ brochures }) => {
  const [selectedBrochure, setSelectedBrochure] = useState<ProjectBrochure | null>(null);
  const [showReaderModal, setShowReaderModal] = useState(false);

  try {
    if (!brochures || brochures.length === 0) {
      return null;
    }

    const handleReadClick = (brochure: ProjectBrochure) => {
      setSelectedBrochure(brochure);
      setShowReaderModal(true);
    };

    const handleCloseReader = () => {
      setShowReaderModal(false);
      setSelectedBrochure(null);
    };

    return (
      <>
        {/* Project Documents Section */}
        <section className="py-16 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Project Documents
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Read online in high resolution or download official specifications, whitepapers, and documentation
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {brochures.length} {brochures.length === 1 ? 'Document' : 'Documents'}
                </span>
              </div>
            </div>

            {/* Brochures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brochures.map((brochure, idx) => {
                const resolvedFileUrl = resolveImageUrl(brochure.file_url) || brochure.file_url;
                const effectiveType = brochure.file_type || detectFileType(brochure.file_url);
                const isPdf =
                  effectiveType === 'pdf' ||
                  (brochure.file_url && brochure.file_url.toLowerCase().endsWith('.pdf'));

                return (
                  <div
                    key={brochure.id || idx}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 shadow-xs hover:shadow-2xl flex flex-col justify-between"
                  >
                    {/* Visual Cover Preview Thumbnail */}
                    <div
                      onClick={() => handleReadClick(brochure)}
                      className="relative h-56 bg-slate-100 dark:bg-slate-855 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      <PDFThumbnail
                        fileUrl={resolvedFileUrl}
                        thumbnailUrl={brochure.thumbnail_url}
                        fileType={effectiveType}
                        title={brochure.title}
                        className="w-full h-full"
                        imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10 pointer-events-none">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase backdrop-blur-md text-white tracking-wider shadow-sm ${
                          effectiveType === 'pdf'
                            ? 'bg-rose-900/80'
                            : effectiveType === 'image'
                            ? 'bg-indigo-900/80'
                            : 'bg-black/80'
                        }`}>
                          {getFileTypeBadgeLabel(effectiveType, brochure.file_url)}
                        </span>
                      </div>

                      {/* Hover Overlay with Read & Download Actions */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 backdrop-blur-2xs z-10 p-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReadClick(brochure);
                          }}
                          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl transition-all cursor-pointer transform active:scale-95 flex items-center justify-center"
                          title="Read Online"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <a
                          href={resolvedFileUrl}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-md shadow-lg transition-all flex items-center justify-center"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Card Content Information */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          onClick={() => handleReadClick(brochure)}
                          className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {stripExtension(brochure.title) || 'Project Publication'}
                        </h3>
                        {brochure.description ? (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                            {brochure.description}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-1.5">
                            Official project publication & document
                          </p>
                        )}
                      </div>

                      {/* Primary Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReadClick(brochure)}
                            className="p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer active:scale-95"
                            title="Read Online"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={resolvedFileUrl}
                            download
                            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* High-Readability Interactive PDF Reader Modal */}
        {selectedBrochure && (
          <PDFReaderModal
            isOpen={showReaderModal}
            onClose={handleCloseReader}
            fileUrl={selectedBrochure.file_url}
            title={selectedBrochure.title || 'Project Brochure'}
            description={selectedBrochure.description}
            fileType={selectedBrochure.file_type}
            fileSizeMb={selectedBrochure.file_size_mb}
          />
        )}
      </>
    );
  } catch (err) {
    console.error('BrochureViewer error:', err);
    return null;
  }
};
