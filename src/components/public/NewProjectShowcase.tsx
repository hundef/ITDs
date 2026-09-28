import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { api, resolveImageUrl } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { Zap, ArrowRight, Calendar, Users, Target, Sparkles, FileText } from 'lucide-react';

interface NewProjectShowcaseProps {
  onNavigate: (path: string) => void;
}

export const NewProjectShowcase: React.FC<NewProjectShowcaseProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch latest 3 published projects
    api.projects.getAll({ published: 'true', limit: 3, sort: 'newest' })
      .then(res => {
        if (res.projects) setProjects(res.projects);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Latest Innovations</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            New Project Showcase
          </h2>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                className="group h-full flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 hover:border-indigo-500/50 transition-all duration-300 shadow-xs hover:shadow-xl hover:scale-105"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  {project.cover_image ? (
                    <img
                      src={resolveImageUrl(project.cover_image) || project.cover_image}
                      alt={project.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
                    {project.status}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                  {/* Project Name & Category */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    {project.category && (
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {project.category.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">
                    {project.short_description}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {project.client_name && (
                      <div className="flex items-start gap-2 text-xs">
                        <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">{project.client_name}</span>
                      </div>
                    )}

                    {project.completion_date && (
                      <div className="flex items-start gap-2 text-xs">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {new Date(project.completion_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </div>
                    )}

                    {project.problems_solved && (
                      <div className="flex items-start gap-2 text-xs">
                        <Target className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300 line-clamp-1">
                          {project.problems_solved}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onNavigate(`/projects/${project.slug}`)}
                    className="group/btn mt-4 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">No new projects yet. Check back soon!</p>
          </div>
        )}

        {/* View All Projects CTA */}
        {projects.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('/projects')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md hover:shadow-lg"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
