import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2, Clock, Users, Award, Building2, ThumbsUp } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
}

function useCountUp(target: string, duration = 1200, active = false) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!active) return;
    const suffix = target.replace(/[0-9.]/g, '');
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { setDisplay(target); return; }
    const steps = 40;
    const inc = num / steps;
    let cur = 0;
    let step = 0;
    const t = setInterval(() => {
      step++;
      cur = Math.min(cur + inc, num);
      const fmt = Number.isInteger(num) ? Math.round(cur).toString() : cur.toFixed(1);
      setDisplay(fmt + suffix);
      if (step >= steps) { setDisplay(target); clearInterval(t); }
    }, duration / steps);
    return () => clearInterval(t);
  }, [active, target, duration]);
  return display;
}

const StatCard: React.FC<{ stat: StatItem; delay: number }> = ({ stat, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const Icon = stat.icon;
  const displayValue = useCountUp(stat.value, 1400, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative flex flex-col items-center text-center p-5 rounded-2xl
        bg-white dark:bg-[var(--bg-surface)] border border-slate-200/70 dark:border-[var(--border-color)]
        hover:border-transparent shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
        transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      {/* Gradient top border */}
      <span className={`absolute top-0 inset-x-0 h-[2px] rounded-t-2xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl mb-3.5 flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-sm transition-transform duration-300 group-hover:scale-110`}
        style={{ boxShadow: `0 4px 14px ${stat.glow}` }}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Value */}
      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans leading-none">
        {visible ? displayValue : '0'}
      </span>

      {/* Label */}
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1.5">
        {stat.label}
      </span>

      {/* Sub */}
      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 hidden sm:block leading-tight">
        {stat.subtext}
      </span>

      {/* Hover glow bg */}
      <span
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[.04] transition-opacity duration-300`}
      />
    </div>
  );
};

export const StatsBar: React.FC = () => {
  const { settings } = useSettings();

  const stats: StatItem[] = [
    {
      label: 'Projects Completed',
      value: settings.stats_projects_completed || '48+',
      subtext: '',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'rgba(16,185,129,.3)',
    },
    {
      label: 'Projects Ongoing',
      value: settings.stats_projects_ongoing || '12',
      subtext: '',
      icon: Clock,
      gradient: 'from-indigo-500 to-violet-500',
      glow: 'rgba(99,102,241,.3)',
    },
    {
      label: 'Clients Served',
      value: settings.stats_clients_served || '35+',
      subtext: '',
      icon: Building2,
      gradient: 'from-cyan-500 to-sky-500',
      glow: 'rgba(6,182,212,.3)',
    },
    {
      label: 'Years Experience',
      value: settings.stats_years_experience || '8+',
      subtext: '',
      icon: Award,
      gradient: 'from-amber-500 to-orange-500',
      glow: 'rgba(245,158,11,.3)',
    },
    {
      label: 'Team Members',
      value: settings.stats_team_members || '60+',
      subtext: '',
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      glow: 'rgba(139,92,246,.3)',
    },
    {
      label: 'Client Satisfaction',
      value: settings.stats_client_satisfaction || '99.4%',
      subtext: '',
      icon: ThumbsUp,
      gradient: 'from-rose-500 to-pink-500',
      glow: 'rgba(244,63,94,.3)',
    },
  ];

  return (
    <section className="py-14 relative">
      {/* Subtle divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
};
