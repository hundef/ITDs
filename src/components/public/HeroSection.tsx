import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  ArrowRight, Sparkles, Zap, Globe,
  Layers, Cpu, Flame, Play
} from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (path: string) => void;
}

interface TurnTheme {
  name: string;
  color: string;
  glow: string;
  softGlow: string;
  ambientFrom: string;
  ambientTo: string;
  activeGradient: string;
  inactiveColor: string;
  beamGradient: string;
  badgeIcon: React.ElementType;
  badgeLabel: string;
}

const THEMES: TurnTheme[] = [
  {
    name: 'Create',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,.7)',
    softGlow: 'rgba(34,211,238,.12)',
    ambientFrom: '#0891b2',
    ambientTo: '#6366f1',
    activeGradient: 'from-cyan-400 via-sky-400 to-indigo-500',
    inactiveColor: 'text-slate-400 dark:text-slate-600',
    beamGradient: 'from-transparent via-cyan-400 to-transparent',
    badgeIcon: Sparkles,
    badgeLabel: '01 · ARCHITECT',
  },
  {
    name: 'Innovate',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,.7)',
    softGlow: 'rgba(167,139,250,.12)',
    ambientFrom: '#7c3aed',
    ambientTo: '#ec4899',
    activeGradient: 'from-violet-400 via-purple-400 to-pink-500',
    inactiveColor: 'text-slate-400 dark:text-slate-600',
    beamGradient: 'from-transparent via-violet-400 to-transparent',
    badgeIcon: Zap,
    badgeLabel: '02 · PIONEER',
  },
  {
    name: 'Impact',
    color: '#34d399',
    glow: 'rgba(52,211,153,.7)',
    softGlow: 'rgba(52,211,153,.12)',
    ambientFrom: '#059669',
    ambientTo: '#0891b2',
    activeGradient: 'from-emerald-400 via-teal-400 to-cyan-500',
    inactiveColor: 'text-slate-400 dark:text-slate-600',
    beamGradient: 'from-transparent via-emerald-400 to-transparent',
    badgeIcon: Globe,
    badgeLabel: '03 · DELIVER',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const sloganText = (settings.company_slogan || 'Create. Innovate. Impact.').trim();

  const words = React.useMemo(() => {
    const parts = sloganText.split(/(?<=[.,;])\s*|\s{2,}/).filter(Boolean);
    return parts.length > 0 ? parts : [sloganText];
  }, [sloganText]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [turnKey, setTurnKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(p => { const n = (p + 1) % words.length; setTurnKey(k => k + 1); return n; });
    }, 3000);
  };

  useEffect(() => {
    if (!paused) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, words.length]);

  const currentTheme = THEMES[active % THEMES.length];

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">

      {/* ── Background grid ──────────────────────────────── */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* ── Animated ambient orbs ────────────────────────── */}
      <div
        className="absolute top-[-120px] left-[-80px] w-[560px] h-[560px] rounded-full blur-[120px] pointer-events-none animate-orb1 transition-colors duration-1000"
        style={{ background: `radial-gradient(circle, ${currentTheme.ambientFrom}28 0%, transparent 70%)` }}
      />
      <div
        className="absolute bottom-[-80px] right-[-60px] w-[480px] h-[480px] rounded-full blur-[100px] pointer-events-none animate-orb2 transition-colors duration-1000"
        style={{ background: `radial-gradient(circle, ${currentTheme.ambientTo}22 0%, transparent 70%)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[340px] rounded-full blur-[140px] pointer-events-none animate-orb3 transition-colors duration-1000"
        style={{ background: `radial-gradient(ellipse, ${currentTheme.softGlow} 0%, transparent 65%)` }}
      />

      {/* ── Radial vignette ──────────────────────────────── */}
      <div className="absolute inset-0 bg-radial-at-center from-transparent to-[var(--bg-primary)]/80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">

        {/* ── Announcement chip ────────────────────────────── */}
        <div className="animate-fade-in-down" style={{ animationDelay: '.05s' }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[.08em]
            bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300
            border border-indigo-500/20 dark:border-indigo-500/25 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            {settings.hero_badge_text || 'Engineering Enterprise Software & AI Pipelines'}
            {settings.hero_badge_subtext && (
              <>
                <span className="text-indigo-400/60">·</span>
                <span className="font-mono text-indigo-400 text-[10px]">{settings.hero_badge_subtext}</span>
              </>
            )}
          </span>
        </div>

        {/* ── Kinetic slogan ───────────────────────────────── */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '.12s' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <h1 className="font-extrabold tracking-tight font-sans leading-none select-none">
            <span className="flex flex-nowrap items-center justify-center gap-x-3 sm:gap-x-5">
              {words.map((word, idx) => {
                const theme = THEMES[idx % THEMES.length];
                const isActive = idx === active;
                const clean = word.replace(/[.,;]$/, '');
                const hasDot = /[.,;]$/.test(word);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActive(idx); setTurnKey(k => k + 1); }}
                    className={`relative inline-flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-500 ease-out focus:outline-none
                      text-3xl sm:text-4xl md:text-5xl
                      ${isActive ? 'scale-105 z-10' : 'scale-95 opacity-40 hover:opacity-70 hover:scale-100'}`}
                  >
                    <span className="inline-flex items-end gap-1">
                      {/* Word */}
                      <span
                        className={`font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                          isActive
                            ? `${theme.activeGradient} animate-gradient-shimmer bg-[length:200%_auto]`
                            : 'from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700'
                        }`}
                        style={{
                          filter: isActive ? `drop-shadow(0 0 32px ${theme.glow})` : 'none',
                        }}
                      >
                        {clean}
                      </span>

                      {/* Dot */}
                      {hasDot && (
                        <span className="relative mb-2 inline-flex items-center justify-center">
                          {isActive && (
                            <span
                              className="absolute w-5 h-5 rounded-full animate-radar-wave"
                              style={{ backgroundColor: theme.color, opacity: .5 }}
                            />
                          )}
                          <span
                            className={`relative w-3 h-3 rounded-full transition-all duration-500 ${isActive ? 'scale-110' : 'scale-75 opacity-40'}`}
                            style={{
                              backgroundColor: theme.color,
                              boxShadow: isActive ? `0 0 20px ${theme.color}` : 'none',
                            }}
                          />
                        </span>
                      )}
                    </span>

                    {/* Underline beam */}
                    <span
                      className={`h-[3px] rounded-full transition-all duration-500 bg-gradient-to-r ${theme.beamGradient} ${
                        isActive ? 'w-full opacity-100 animate-beam' : 'w-0 opacity-0'
                      }`}
                      style={{ boxShadow: isActive ? `0 0 10px ${theme.color}` : 'none' }}
                    />
                  </button>
                );
              })}
            </span>
          </h1>

          {/* Step pills */}
          {words.length > 1 && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {words.map((word, idx) => {
                const theme = THEMES[idx % THEMES.length];
                const isActive = idx === active;
                const clean = word.replace(/[.,;]$/, '');
                const BadgeIcon = theme.badgeIcon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActive(idx); setTurnKey(k => k + 1); }}
                    className={`relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-[.06em] border transition-all duration-300 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-md scale-105'
                        : 'bg-transparent border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-400'
                    }`}
                    style={{ boxShadow: isActive ? `0 0 18px ${theme.softGlow}` : undefined }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300"
                      style={{ backgroundColor: theme.color, boxShadow: isActive ? `0 0 8px ${theme.color}` : 'none' }}
                    />
                    <BadgeIcon className="w-3 h-3 shrink-0" />
                    <span>{theme.badgeLabel}</span>
                    {isActive && !paused && (
                      <span
                        key={turnKey}
                        className="absolute bottom-0 left-0 h-0.5 rounded-full animate-turn-progress"
                        style={{ background: `linear-gradient(to right, transparent, ${theme.color}, transparent)` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tagline ──────────────────────────────────────── */}
        <p
          className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '.22s' }}
        >
          {settings.company_tagline ||
            'We partner with industry leaders to architect resilient distributed systems, neural AI engines, and autonomous cloud infrastructure.'}
        </p>

        {/* ── CTAs ─────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 animate-fade-in-up"
          style={{ animationDelay: '.3s' }}
        >
          <button
            onClick={() => onNavigate('/projects')}
            className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[14px] font-bold text-white
              bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
              transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Explore Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('/services')}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-[14px] font-bold
              text-slate-700 dark:text-slate-200
              bg-white/90 dark:bg-white/[.06] backdrop-blur-sm
              border border-slate-200 dark:border-white/10
              hover:border-indigo-300 dark:hover:border-indigo-500/40
              hover:bg-white dark:hover:bg-white/[.09]
              shadow-sm hover:shadow-md
              transition-all duration-300 hover:-translate-y-0.5"
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Our Services</span>
          </button>

          <button
            onClick={() => onNavigate('/contact')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[13px] font-semibold
              text-slate-500 dark:text-slate-400
              hover:text-indigo-600 dark:hover:text-indigo-400
              transition-colors duration-200"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Schedule Consultation</span>
          </button>
        </div>



      </div>

      {/* ── Bottom fade-out ──────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
    </section>
  );
};
