import React, { useState, useEffect } from 'react';
import { Search, FolderKanban, Briefcase, FileText, ArrowRight, X, Users, Building2 } from 'lucide-react';
import { Project, Service, BlogPost, TeamMember } from '../../types';
import { api } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setIsLoading(true);
      Promise.all([
        api.projects.getAll({ limit: 100, published: 'all' }),
        api.services.getAll(),
        api.blogs.getAll(),
        api.team.getAll()
      ]).then(([pRes, sRes, bRes, tRes]) => {
        if (pRes.projects) setProjects(pRes.projects);
        if (sRes.services) setServices(sRes.services);
        if (bRes.blogs) setBlogs(bRes.blogs);
        if (tRes.team) setTeam(tRes.team);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setQuery('');
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProjects = q
    ? projects.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        (p.category && p.category.name.toLowerCase().includes(q))
      )
    : projects.slice(0, 3);

  const filteredTeam = q
    ? team.filter(m =>
        (m.is_visible === 1 || m.is_visible === true || m.is_visible === undefined) &&
        (m.name.toLowerCase().includes(q) ||
         (m.role && m.role.toLowerCase().includes(q)) ||
         (m.department && m.department.toLowerCase().includes(q)) ||
         (m.bio && m.bio.toLowerCase().includes(q)))
      )
    : [];

  const filteredServices = q
    ? services.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.short_description.toLowerCase().includes(q)
      )
    : services.slice(0, 2);

  const filteredBlogs = q
    ? blogs.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q)
      )
    : blogs.slice(0, 2);

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex-1 flex items-center min-w-0">
            <input
              type="text"
              placeholder="Search projects, team members, departments, services, or articles..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              autoFocus
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden text-base pr-2"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={onClose}
              className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md font-mono transition-colors cursor-pointer shadow-xs"
              title="Close search (ESC)"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading catalog...</div>
          ) : (
            <>
              {/* Team Members & Professionals */}
              {filteredTeam.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Team Members & Professionals
                  </h4>
                  <div className="space-y-1">
                    {filteredTeam.map(m => (
                      <button
                        key={m.id}
                        onClick={() => handleSelect(`/team`)}
                        className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.avatar || '/avatars/avatar_default.jpg'}
                            alt={m.name}
                            onError={e => { e.currentTarget.src = '/avatars/avatar_default.jpg'; }}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="truncate">
                            <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {m.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                              <span>{m.role}</span>
                              {m.department && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{m.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5" /> Projects
                  </h4>
                  <div className="space-y-1">
                    {filteredProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(`/projects/${p.slug}`)}
                        className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.cover_image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="truncate">
                            <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {p.category?.name || 'General'} • {p.status}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {filteredServices.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Services
                  </h4>
                  <div className="space-y-1">
                    {filteredServices.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSelect(`/services`)}
                        className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      >
                        <div className="truncate">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {s.short_description}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blogs */}
              {filteredBlogs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Insights & News
                  </h4>
                  <div className="space-y-1">
                    {filteredBlogs.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(`/blog/${b.slug}`)}
                        className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      >
                        <div className="truncate">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {b.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {b.read_time} • {b.published_at}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredProjects.length === 0 && filteredTeam.length === 0 && filteredServices.length === 0 && filteredBlogs.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-500 dark:text-slate-400">No results found for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching for members like "Israel", "DevOps", "AI", or "Architecture"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
