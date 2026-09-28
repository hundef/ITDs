import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Project, ProjectCategory, Technology, ProjectStatus } from '../../types';
import { api } from '../../services/api';
import { ProjectCard } from '../../components/public/ProjectCard';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  FolderKanban,
  X,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate, initialCategory }) => {
  const { settings } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories & technologies once
  useEffect(() => {
    Promise.all([
      api.categories.getAll(),
      api.technologies.getAll()
    ]).then(([cRes, tRes]) => {
      if (cRes.categories) setCategories(cRes.categories);
      if (tRes.technologies) setTechnologies(tRes.technologies);
    }).catch(err => console.error(err));
  }, []);

  // Fetch projects when filters change
  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, any> = {
      search,
      status: statusFilter,
      category: categoryFilter,
      technology: techFilter,
      year: yearFilter,
      sort: sortOrder,
      limit: 100
    };

    api.projects.getAll(params).then(res => {
      if (res.projects) setProjects(res.projects);
    }).catch(err => {
      console.error('Failed to load projects:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [search, statusFilter, categoryFilter, techFilter, yearFilter, sortOrder]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTechFilter('all');
    setYearFilter('all');
    setSortOrder('priority');
  };

  const hasActiveFilters = search || statusFilter !== 'all' || categoryFilter !== 'all' || techFilter !== 'all' || yearFilter !== 'all';

  const statusTabs = [
    { label: 'All Projects', value: 'all', icon: FolderKanban },
    { label: 'Completed', value: 'Completed', icon: CheckCircle2 },
    { label: 'Ongoing', value: 'Ongoing', icon: Clock },
    { label: 'Upcoming', value: 'Upcoming', icon: Calendar },
    { label: 'Featured', value: 'featured', icon: Sparkles }
  ];

  return (
    <div className="pt-28 pb-20 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <FolderKanban className="w-3.5 h-3.5" />
          <span>{settings.projects_badge_text || 'Central Project Portfolio'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          {settings.projects_section_title || 'Engineering Showcase & Case Studies'}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {settings.projects_section_desc || ''}
        </p>
      </div>

      {/* Main Status Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          {statusTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name, keywords, client, or problem..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              aria-label="Filter by specialization category"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name} ({c.project_count || 0})</option>
              ))}
            </select>
          </div>

          {/* Technology Dropdown */}
          <div className="md:col-span-3">
            <select
              value={techFilter}
              onChange={e => setTechFilter(e.target.value)}
              aria-label="Filter by technology stack"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Technologies</option>
              {technologies.map(t => (
                <option key={t.id} value={t.slug}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>

          {/* Sort & View Toggle */}
          <div className="md:col-span-2 flex items-center gap-2 justify-end">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              aria-label="Sort projects order"
              className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="priority">Priority</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetical</option>
            </select>

            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-400'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-400'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Active Filters:</span>
            {search && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                Search: "{search}" <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                Category: {categoryFilter} <button onClick={() => setCategoryFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {techFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                Tech: {techFilter} <button onClick={() => setTechFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                Status: {statusFilter} <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-rose-500 ml-auto flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>
        )}
      </div>

      {/* Projects Count & Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
          <span>Updated in Real-Time</span>
        </div>

        {isLoading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-850 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={slug => onNavigate(`/projects/${slug}`)}
                layout={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <FolderKanban className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sans">
              No matching projects found
            </h3>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
