import React, { useEffect, useState } from 'react';
import { Project, ProjectMedia } from '../../types';
import { api, resolveImageUrl } from '../../services/api';
import { StatusBadge, CategoryBadge, TechBadge } from '../../components/common/Badge';
import { WorkflowTimeline } from '../../components/public/WorkflowTimeline';
import { FeaturesGrid } from '../../components/public/FeaturesGrid';
import { ProjectCard } from '../../components/public/ProjectCard';
import { Lightbox } from '../../components/common/Lightbox';
import { BrochureViewer } from '../../components/public/BrochureViewer';

import {
  ArrowLeft,
  Calendar,
  Building2,
  ExternalLink,
  Github,
  Globe,
  FileText,
  Video,
  Sparkles,
  HelpCircle,
  Cpu,
  Layers,
  BarChart3,
  CheckCircle2,
  Maximize2,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';

interface ProjectDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ slug, onNavigate }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [brochureOpen, setBrochureOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api.projects.getBySlug(slug).then(res => {
      if (res.project) {
        setProject(res.project);
      } else {
        setError('Project not found.');
      }
    }).catch(err => {
      console.error(err);
      setError(err.message || 'Failed to load project details.');
    }).finally(() => {
      setIsLoading(false);
    });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-36 pb-20 text-center max-w-md mx-auto px-4 space-y-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested project could not be located in our portfolio.'}</p>
        <button
          onClick={() => onNavigate('/projects')}
          className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
        >
          Return to Portfolio
        </button>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const allMedia: ProjectMedia[] = [
    { media_type: 'image', url: project.cover_image, caption: `${project.name} Cover` },
    ...(project.media || [])
  ];

  return (
    <div className="pt-28 pb-20 space-y-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('/projects')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Project Portfolio</span>
      </button>

      {/* Hero Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} />
          {project.category && (
            <CategoryBadge name={project.category.name} color={project.category.color} />
          )}
          {project.client_name && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Client: {project.client_name}
            </span>
          )}
          {project.completion_date && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-sans">
          {project.name}
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          {project.short_description}
        </p>

        {/* Action / External Links */}
        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs hover:shadow-md"
              >
                {link.link_type === 'github' && <Github className="w-4 h-4" />}
                {link.link_type === 'documentation' && <FileText className="w-4 h-4" />}
                {link.link_type === 'video' && <Video className="w-4 h-4" />}
                {link.link_type === 'website' && <Globe className="w-4 h-4" />}
                {link.link_type !== 'github' && link.link_type !== 'documentation' && link.link_type !== 'video' && link.link_type !== 'website' && <ExternalLink className="w-4 h-4" />}
                <span>{link.label || link.link_type}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Cover Image Banner with click-to-enlarge */}
      <div className="space-y-4">
        <div
          onClick={() => openLightbox(0)}
          className="relative h-[350px] sm:h-[480px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 cursor-pointer group bg-slate-900"
        >
          <img
            src={resolveImageUrl(project.cover_image) || project.cover_image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl bg-black/70 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/15 shadow-xl transition-all group-hover:scale-105">
            <Maximize2 className="w-4 h-4 text-indigo-400" />
            <span>Click to Enlarge Gallery ({allMedia.length} {allMedia.length === 1 ? 'Image' : 'Images'})</span>
          </div>

          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full HD Showcase</span>
          </div>
        </div>

        {/* Multi-Image Gallery Strip below banner */}
        {allMedia.length > 1 && (
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>Gallery & Architecture Screenshots ({allMedia.length} Photos)</span>
              </span>
              <button
                onClick={() => openLightbox(0)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>View Fullscreen Gallery</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {allMedia.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(idx)}
                  className="group relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  {m.media_type === 'video' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-1">
                      <Video className="w-5 h-5 text-indigo-400" />
                      <span className="text-[9px] font-medium mt-0.5 truncate max-w-full">Video</span>
                    </div>
                  ) : (
                    <img
                      src={resolveImageUrl(m.url) || m.url}
                      alt={m.caption || `Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-white font-medium truncate">
                    {idx === 0 ? 'Cover' : (m.caption || `Image ${idx + 1}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 1: What is this project? (Overview) & What Problem Does It Solve? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* What is this project? */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            {project.title_overview || 'What is this Project?'}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            {project.full_description || project.short_description}
          </p>
        </div>

        {/* What Problem Does It Solve? */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
            {project.title_problems || 'What Problem Does It Solve?'}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            {project.problems_solved ||
              'Legacy architectures caused severe operational latency, security vulnerabilities, and lacked automated failover under high-concurrency peak demand.'}
          </p>
        </div>
      </div>

      {/* Section 2: What This Project Does (Functional Purpose) */}
      {project.what_it_does && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-300 border border-white/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Functional Utility</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
            {project.title_solution || 'What This Project Does'}
          </h2>
          <p className="text-indigo-100 text-base sm:text-lg leading-relaxed max-w-4xl">
            {project.what_it_does}
          </p>
        </div>
      )}

      {/* Section 4: Key Project Features & Capabilities */}
      {project.features && project.features.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Capabilities Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-sans">
              {project.title_features || 'Key Project Features'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Engineered capabilities delivering high availability, security, and automated workflows.
            </p>
          </div>

          <FeaturesGrid features={project.features} />
        </div>
      )}

      {/* Section 4: Technologies Used */}
      {project.custom_technologies && project.custom_technologies.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
              Technology Stack & Infrastructure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Battle-tested frameworks, databases, and languages powering this system.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {project.custom_technologies.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#6366f1' }} />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{t.name}</span>
                  <span className="text-[10px] text-slate-400 block">{t.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Screenshots & Media Gallery */}
      {project.media && project.media.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-sans">
                Project Gallery & Screenshots
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Visual interfaces, live console views, and architectural diagrams.
              </p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              {project.media.length} {project.media.length === 1 ? 'asset' : 'assets'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.media.map((m, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx + 1)}
                className="group relative h-60 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs hover:shadow-xl transition-all"
              >
                {m.media_type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-4">
                    <Video className="w-12 h-12 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-center">{m.caption || 'Watch Video Demo'}</span>
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt={m.caption || 'Project Media'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-xs text-white font-medium">{m.caption || `Screenshot ${idx + 1}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxOpen}
        media={allMedia}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />

      

      {/* Section 7: Brochures & Documents */}
      {project.brochures && project.brochures.length > 0 && (
        <div id="project-documents" className="scroll-mt-32">
          <BrochureViewer brochures={project.brochures} />
        </div>
      )}

    </div>
  );
};
