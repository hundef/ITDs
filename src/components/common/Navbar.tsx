import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Menu, X, Search, LayoutDashboard, Shield, ChevronDown, Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

const navLinks = [
  { label: 'Home',     path: '/' },
  { label: 'About',    path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Projects', path: '/projects' },
  { label: 'Team',     path: '/team' },
  { label: 'Insights', path: '/blog' },
  { label: 'Contact',  path: '/contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { user, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Slide the active indicator pill under the active nav link
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;
    const container = navRef.current;
    const active = container.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (active) {
      const cr = container.getBoundingClientRect();
      const ar = active.getBoundingClientRect();
      indicatorRef.current.style.left   = `${ar.left - cr.left}px`;
      indicatorRef.current.style.width  = `${ar.width}px`;
      indicatorRef.current.style.opacity = '1';
    } else {
      indicatorRef.current.style.opacity = '0';
    }
  }, [currentPath]);

  const go = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-2 glass shadow-lg shadow-black/5'
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

          {/* ── Logo ─────────────────────────────────────────── */}
          <button onClick={() => go('/')} className="flex items-center gap-2 group shrink-0 focus:outline-none">
            <div className="leading-none" style={{ perspective: '600px' }}>
              {/* ITD — each letter flips in staggered, then spins on loop */}
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
              {/* Tagline typewriter */}
              <span
                className="block text-[9px] font-bold uppercase tracking-[.14em] text-slate-400 dark:text-slate-500 mt-0.5 overflow-hidden whitespace-nowrap"
                style={{ animation: 'typewriter 1.4s steps(24,end) 0.8s both' }}
              >
                Create. Innovate. Impact.
              </span>
            </div>
          </button>

          {/* ── Desktop Nav ──────────────────────────────────── */}
          <nav
            ref={navRef}
            className="hidden md:flex relative items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-slate-100/70 dark:bg-white/[.04] border border-slate-200/80 dark:border-white/[.06] backdrop-blur-md"
            aria-label="Main navigation"
          >
            {/* Sliding active background pill */}
            <span
              ref={indicatorRef}
              aria-hidden
              className="absolute top-1.5 h-[calc(100%-12px)] rounded-xl bg-white dark:bg-white/10 shadow-sm dark:shadow-none border border-slate-200/60 dark:border-white/10 transition-all duration-300 ease-out pointer-events-none"
              style={{ opacity: 0 }}
            />
            {navLinks.map(link => {
              const isActive = link.path === '/'
                ? currentPath === '/'
                : currentPath === link.path || currentPath.startsWith(link.path + '/');
              return (
                <button
                  key={link.path}
                  data-active={isActive ? 'true' : undefined}
                  onClick={() => go(link.path)}
                  className={`relative z-10 px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* ── Right Actions ────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-slate-400
                bg-slate-100/80 dark:bg-white/[.04] border border-slate-200 dark:border-white/[.06]
                hover:border-indigo-400/60 dark:hover:border-indigo-500/40
                hover:text-slate-700 dark:hover:text-slate-200
                transition-all duration-200 group"
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="hidden lg:inline text-[12px]">Search...</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            {/* Admin CTA */}
            {isAuthenticated ? (
              <button
                onClick={() => go('/admin')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40
                  transition-all duration-200"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            ) : (
              <button
                onClick={() => go('/admin/login')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold
                  text-slate-600 dark:text-slate-300
                  hover:text-indigo-600 dark:hover:text-indigo-400
                  bg-white/80 dark:bg-white/[.04]
                  hover:bg-indigo-50 dark:hover:bg-indigo-500/10
                  border border-slate-200 dark:border-white/[.06]
                  hover:border-indigo-300 dark:hover:border-indigo-500/30
                  transition-all duration-200"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>

          {/* ── Mobile Toggle ────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[.06] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 glass-dropdown shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/[.06]">
            <span className="font-bold text-sm text-slate-800 dark:text-white font-sans">Navigation</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[.06] transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100 dark:border-white/[.06]">
            <button
              onClick={() => { onOpenSearch(); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[.04] text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Search projects & services…</span>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navLinks.map(link => {
              const isActive = link.path === '/'
                ? currentPath === '/'
                : currentPath === link.path || currentPath.startsWith(link.path + '/');
              return (
                <button
                  key={link.path}
                  onClick={() => go(link.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[.04]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-slate-100 dark:border-white/[.06]">
            {isAuthenticated ? (
              <button
                onClick={() => go('/admin')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => go('/admin/login')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[.06] border border-slate-200 dark:border-white/[.08]"
              >
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
