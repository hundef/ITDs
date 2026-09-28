import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Service } from '../../types';
import { api } from '../../services/api';
import {
  Code2, Globe, Sparkles, Smartphone, Layout,
  Shield, ArrowRight, CheckCircle2, Cpu, Cloud, Database, Layers
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Code2, Globe, Sparkles, Smartphone, Layout, Shield, Cpu, Cloud, Database, Layers,
};

// One gradient per slot – cycles if more services exist
const GRADIENTS = [
  { from: 'from-indigo-500',  to: 'to-violet-500',  glow: 'rgba(99,102,241,.25)',  soft: 'bg-indigo-500/8 dark:bg-indigo-500/10'  },
  { from: 'from-cyan-500',    to: 'to-sky-500',      glow: 'rgba(6,182,212,.25)',   soft: 'bg-cyan-500/8 dark:bg-cyan-500/10'      },
  { from: 'from-violet-500',  to: 'to-purple-600',   glow: 'rgba(139,92,246,.25)',  soft: 'bg-violet-500/8 dark:bg-violet-500/10'  },
  { from: 'from-emerald-500', to: 'to-teal-500',     glow: 'rgba(16,185,129,.25)',  soft: 'bg-emerald-500/8 dark:bg-emerald-500/10'},
  { from: 'from-rose-500',    to: 'to-pink-500',     glow: 'rgba(244,63,94,.25)',   soft: 'bg-rose-500/8 dark:bg-rose-500/10'      },
  { from: 'from-amber-500',   to: 'to-orange-500',   glow: 'rgba(245,158,11,.25)',  soft: 'bg-amber-500/8 dark:bg-amber-500/10'    },
];

interface ServicesPreviewProps {
  onNavigate: (path: string) => void;
}

export const ServicesPreview: React.FC<ServicesPreviewProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinningId, setSpinningId] = useState<number | null>(null);

  useEffect(() => {
    api.services.getAll()
      .then(res => { if (res.services) setServices(res.services); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 relative bg-slate-50/60 dark:bg-[var(--bg-elevated)]">
      {/* Top / bottom hairlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <span className="section-label bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
            <Globe className="w-3.5 h-3.5" />
            End-to-End Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {settings.services_section_title || 'Specialized Engineering Services'}
          </h2>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {settings.services_section_desc || 'End-to-end technology solutions tailored for enterprises demanding deterministic performance and measurable ROI.'}
          </p>
        </div>

        {/* ── Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {services.map((svc, idx) => {
              const Icon = iconMap[svc.icon] || Code2;
              const g = GRADIENTS[idx % GRADIENTS.length];
              return (
                <div
                  key={svc.id}
                  onMouseEnter={() => setSpinningId(svc.id)}
                  onMouseLeave={() => setSpinningId(null)}
                  className="service-card group relative bg-[var(--bg-surface)] border border-[var(--border-color)]
                    hover:border-transparent
                    rounded-2xl p-6 flex flex-col justify-between gap-5
                    shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
                    transition-all duration-300 hover:-translate-y-1.5
                    animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.06}s`, animationFillMode: 'both' }}
                >
                  {/* Gradient top bar */}
                  <span className={`absolute top-0 inset-x-0 h-[2px] rounded-t-2xl bg-gradient-to-r ${g.from} ${g.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{ borderRadius: '1rem 1rem 0 0' }} />

                  {/* Background glow blob */}
                  <span
                    className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl ${g.soft} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="space-y-4">
                    {/* Icon */}
                    <div style={{ perspective: '400px' }}>
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.from} ${g.to} flex items-center justify-center shadow-md`}
                        style={{
                          boxShadow: `0 6px 20px ${g.glow}`,
                          transformOrigin: 'center',
                          animation: spinningId === svc.id
                            ? 'letterSpin 0.8s ease-in-out infinite'
                            : 'none',
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white font-sans group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {svc.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {svc.short_description}
                    </p>

                    {/* Features */}
                    {svc.features && svc.features.length > 0 && (
                      <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[var(--border-subtle)]">
                        {svc.features.slice(0, 3).map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2 text-[12px] text-slate-600 dark:text-slate-300 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[var(--border-subtle)]">
                    <button
                      onClick={() => onNavigate('/services')}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2.5 transition-all"
                    >
                      Explore Capability
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">SLA Guaranteed</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-14 text-center">
          <button
            onClick={() => onNavigate('/services')}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-[14px] font-bold text-white
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
              transition-all duration-300 hover:-translate-y-0.5"
          >
            View All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
