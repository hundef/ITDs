import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { RoleBadge } from '../common/Badge';
import {
  LayoutDashboard, FolderKanban, Briefcase,
  Layers, Cpu, Users, MessageSquare, FileText, Quote,
  Settings, Lock, LogOut, ExternalLink, Menu, X,
  User as UserIcon, ChevronRight, File, PlusCircle
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

const menuSections = (hasPermission: (k: string) => boolean) => [
  {
    title: 'Core Portfolio',
    items: [
      { label: 'Dashboard',           path: '/admin',                icon: LayoutDashboard, access: true },
      { label: 'Projects',             path: '/admin/projects',       icon: FolderKanban,    access: hasPermission('projects.view') },
      { label: 'Project Documents',    path: '/admin/brochures',      icon: FileText,        access: hasPermission('projects.view') },
      { label: 'Categories',           path: '/admin/categories',     icon: Layers,          access: hasPermission('categories.manage') },
      { label: 'Technologies',         path: '/admin/technologies',   icon: Cpu,             access: hasPermission('technologies.manage') },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Services',             path: '/admin/services',       icon: Briefcase,       access: hasPermission('services.manage') },
      { label: 'Team Members',         path: '/admin/team',           icon: Users,           access: hasPermission('team.manage') },
      { label: 'Departments',          path: '/admin/departments',    icon: Briefcase,       access: hasPermission('team.manage') },
      { label: 'Testimonials',         path: '/admin/testimonials',   icon: Quote,           access: hasPermission('testimonials.manage') },
      { label: 'Blog & Insights',      path: '/admin/blogs',          icon: FileText,        access: hasPermission('blogs.manage') },
      { label: 'Inquiries',            path: '/admin/inquiries',      icon: MessageSquare,   access: hasPermission('inquiries.manage') },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'My Profile',           path: '/admin/profile',        icon: UserIcon,        access: true },
      { label: 'CMS Settings',         path: '/admin/settings',       icon: Settings,        access: hasPermission('settings.manage') },
      { label: 'Users & Roles',        path: '/admin/users',          icon: Lock,            access: hasPermission('users.view') },
      { label: 'Audit Logs',           path: '/admin/audit-logs',     icon: Lock,            access: hasPermission('security.audit') },
    ],
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { user, logout, hasPermission } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sections = menuSections(hasPermission);

  const go = (path: string) => { onNavigate(path); setSidebarOpen(false); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-primary)] text-slate-900 dark:text-slate-100 flex">

      {/* ── Sidebar ── */}
      <>
        {/* Backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 left-0 z-40 h-screen w-64 flex flex-col
            bg-white dark:bg-[#0c0e14] border-r border-slate-200 dark:border-[var(--border-color)]
            transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          {/* ── Logo ── */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[var(--border-color)]">
            {/* Animated logo — mirrors public navbar */}
            <button onClick={() => go('/')} className="flex items-center gap-2 group focus:outline-none">
              <div className="leading-none" style={{ perspective: '600px' }}>
                <div className="flex items-baseline gap-[1px]">
                  {(settings.logo_name || settings.company_name || 'ITD').split('').map((char, i) => (
                    <span
                      key={i}
                      className="font-extrabold text-[17px] tracking-tight font-sans text-indigo-500 dark:text-indigo-400 inline-block"
                      style={{
                        transformOrigin: 'center',
                        animation: `letterFlipIn 0.6s cubic-bezier(.16,1,.3,1) ${i * 120}ms both, letterSpin 3s ease-in-out ${0.6 + i * 0.12 + 1}s infinite`
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <span
                  className="block text-[9px] font-bold uppercase tracking-[.14em] text-slate-400 dark:text-slate-500 mt-0.5 overflow-hidden whitespace-nowrap"
                  style={{ animation: 'typewriter 1.4s steps(24,end) 0.8s both' }}
                >
                  {settings.company_slogan || 'Create. Innovate. Impact.'}
                </span>
              </div>
            </button>

            <button
              onClick={() => go('/')}
              title="View public site"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── User profile card ── */}
          {user && (
            <button
              onClick={() => go('/admin/profile')}
              className={`mx-4 mt-4 p-3 rounded-2xl border text-left transition-all group ${
                currentPath === '/admin/profile'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30'
                  : 'bg-slate-50 dark:bg-white/[.03] border-slate-200 dark:border-white/[.06] hover:border-indigo-300 dark:hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                    alt={user.name}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'; }}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c0e14]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {user.name}
                  </p>
                  <div className="mt-0.5">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
              </div>
            </button>
          )}

          {/* ── Nav ── */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5 no-scrollbar">
            {sections.map((sec, si) => (
              <div key={si}>
                <span className="block px-2 mb-2 text-[9px] font-bold uppercase tracking-[.14em] text-slate-400 dark:text-slate-600">
                  {sec.title}
                </span>
                <div className="space-y-0.5">
                  {sec.items.filter(i => i.access).map(item => {
                    const Icon = item.icon;
                    const isActive = item.path === '/admin'
                      ? currentPath === '/admin'
                      : currentPath === item.path || currentPath.startsWith(item.path + '/');
                    return (
                      <button
                        key={item.path}
                        onClick={() => go(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-150 group ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[.04]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}`} />
                        <span className="truncate">{item.label}</span>
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* ── Footer ── */}
          <div className="shrink-0 px-4 py-4 border-t border-slate-100 dark:border-[var(--border-color)] flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={() => { logout(); go('/admin/login'); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">

        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0c0e14] border-b border-slate-200 dark:border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[.05] transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-bold text-[13px] text-slate-800 dark:text-white font-sans">Admin CMS</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => go('/')}
              className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              Public Site →
            </button>
          </div>
        </div>

        {/* Desktop top bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-[#0c0e14]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-[var(--border-color)] sticky top-0 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-slate-400">Admin</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
              {currentPath.split('/').filter(Boolean).slice(1).join(' / ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => go('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-[var(--border-color)] hover:border-indigo-300 dark:hover:border-indigo-500/30 bg-white dark:bg-white/[.03] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Site
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
