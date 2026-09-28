import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../../types';
import { ProjectCard } from './ProjectCard';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, ArrowRight, FolderKanban } from 'lucide-react';

interface FeaturedProjectsProps {
  onNavigate: (path: string) => void;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.projects.getAll({ published: 'true', limit: 9, sort: 'featured' }),
      api.categories.getAll(),
    ])
      .then(([pRes, cRes]) => {
        if (pRes.projects) setProjects(pRes.projects);
        if (cRes.categories) setCategories(cRes.categories);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered =
    selectedCat === 'all'
      ? projects
      : projects.filter(p => p.category?.slug === selectedCat || String(p.category_id) === selectedCat);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <span className="section-label bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {settings.featured_badge_text || 'Showcase Portfolio'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
              {settings.featured_section_title || 'Featured Projects & Engineering Milestones'}
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {settings.featured_section_desc || ''}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/projects')}
            className="group shrink-0 self-start md:self-auto inline-flex items-center gap-2
              px-5 py-2.5 rounded-xl text-[13px] font-bold
              bg-[var(--bg-surface)] border border-[var(--border-color)]
              hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400
              text-slate-600 dark:text-slate-300
              shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
              transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* ── Category filter pills ── */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {['all', ...categories.map(c => c.slug)].map((slug, i) => {
              const cat = categories.find(c => c.slug === slug);
              const label = slug === 'all' ? 'All' : cat?.name ?? slug;
              const isActive = selectedCat === slug;
              return (
                <button
                  key={slug}
                  onClick={() => setSelectedCat(slug)}
                  className={`px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-slate-500 dark:text-slate-400 hover:border-indigo-400/40 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[380px] rounded-2xl skeleton" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {filtered.map(project => (
              <div key={project.id} className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
                <ProjectCard
                  project={project}
                  onSelect={slug => onNavigate(`/projects/${slug}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
            <FolderKanban className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No featured projects in this category.</p>
            <button
              onClick={() => setSelectedCat('all')}
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Show all
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
