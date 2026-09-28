import React from 'react';
import { Project } from '../../types';
import { StatusBadge, CategoryBadge, TechBadge } from '../common/Badge';
import { ArrowRight, Calendar, Building2, FileText } from 'lucide-react';
import { resolveImageUrl } from '../../services/api';

interface ProjectCardProps {
  project: Project;
  onSelect: (slug: string) => void;
  layout?: 'grid' | 'list';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, layout = 'grid' }) => {
  if (layout === 'list') {
    return (
      <div
        onClick={() => onSelect(project.slug)}
        className="group relative bg-[var(--bg-surface)] border border-[var(--border-color)]
          hover:border-indigo-500/40 dark:hover:border-indigo-500/30
          rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
          transition-all duration-300 hover:-translate-y-0.5 cursor-pointer
          flex flex-col sm:flex-row gap-5 items-start sm:items-center"
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <img
            src={resolveImageUrl(project.cover_image) || project.cover_image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {project.category && <CategoryBadge name={project.category.name} color={project.category.color} />}
            {project.client_name && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />{project.client_name}
              </span>
            )}
            {project.brochures && project.brochures.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                <FileText className="w-3 h-3" />
                <span>{project.brochures.length} {project.brochures.length === 1 ? 'Doc' : 'Docs'}</span>
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate font-sans">
            {project.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.short_description}
          </p>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {project.technologies.slice(0, 5).map(t => <TechBadge key={t.id} name={t.name} color={t.color} />)}
              {project.technologies.length > 5 && (
                <span className="text-[11px] text-slate-400">+{project.technologies.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 self-center hidden sm:flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center transition-all duration-300">
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </span>
        </div>
      </div>
    );
  }

  // ── Grid Card ──────────────────────────────────────────
  return (
    <div
      onClick={() => onSelect(project.slug)}
      className="group relative bg-[var(--bg-surface)] border border-[var(--border-color)]
        hover:border-indigo-500/30 dark:hover:border-indigo-500/25
        rounded-2xl overflow-hidden
        shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
        transition-all duration-300 hover:-translate-y-1.5
        flex flex-col h-full cursor-pointer"
    >
      {/* ── Image ── */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={resolveImageUrl(project.cover_image) || project.cover_image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-700 ease-out"
          style={{ '--tw-scale-x': 'var(--hover-scale,1)', '--tw-scale-y': 'var(--hover-scale,1)' } as React.CSSProperties}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Shimmer on hover */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-1.5 flex-wrap">
          <StatusBadge status={project.status} />
          <div className="flex items-center gap-1.5 ml-auto">
            {project.brochures && project.brochures.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/90 text-white backdrop-blur-md shadow border border-indigo-400/30 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{project.brochures.length} {project.brochures.length === 1 ? 'Doc' : 'Docs'}</span>
              </span>
            )}
            {(project.is_featured === 1 || project.is_featured === true) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-md shadow border border-amber-400/30 flex items-center gap-1">
                ★ Featured
              </span>
            )}
          </div>
        </div>

        {/* Bottom meta */}
        <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between">
          {project.category && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border border-white/20 text-white"
              style={{ backgroundColor: `${project.category.color}30` }}
            >
              {project.category.name}
            </span>
          )}
          {project.client_name && (
            <span className="text-[10px] text-white/80 font-medium truncate max-w-[120px] ml-auto drop-shadow">
              {project.client_name}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="space-y-2">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 font-sans">
            {project.name}
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.short_description}
          </p>
        </div>

        {/* Tech stack */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-[var(--border-subtle)] space-y-3">
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map(t => (
                <TechBadge key={t.id} name={t.name} color={t.color} />
              ))}
              {project.technologies.length > 4 && (
                <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              {project.completion_date ? new Date(project.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'In Progress'}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
              Case Study <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Gradient border glow on hover */}
      <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-indigo-500/0 group-hover:ring-indigo-500/20 transition-all duration-300 pointer-events-none" />
    </div>
  );
};
