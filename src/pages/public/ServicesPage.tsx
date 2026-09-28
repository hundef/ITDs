import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Service } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import {
  Code2,
  Globe,
  Sparkles,
  Smartphone,
  Layout,
  Shield,
  CheckCircle2,
  ArrowRight,
  FolderKanban,
  FileCheck
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Code2, Globe, Sparkles, Smartphone, Layout, Shield
};

const GRADIENTS = [
  { from: 'from-indigo-500',  to: 'to-violet-500',  glow: 'rgba(99,102,241,.25)'  },
  { from: 'from-cyan-500',    to: 'to-sky-500',      glow: 'rgba(6,182,212,.25)'   },
  { from: 'from-violet-500',  to: 'to-purple-600',   glow: 'rgba(139,92,246,.25)'  },
  { from: 'from-emerald-500', to: 'to-teal-500',     glow: 'rgba(16,185,129,.25)'  },
  { from: 'from-rose-500',    to: 'to-pink-500',     glow: 'rgba(244,63,94,.25)'   },
  { from: 'from-amber-500',   to: 'to-orange-500',   glow: 'rgba(245,158,11,.25)'  },
];

export const ServicesPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [spinningId, setSpinningId] = useState<number | null>(null);

  useEffect(() => {
    api.services.getAll().then(res => {
      if (res.services) setServices(res.services);
    }).catch(err => {
      console.error('Failed to load services:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="pt-28 pb-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Code2 className="w-3.5 h-3.5" />
          <span>Core Capabilities & Practice Areas</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          {settings.services_section_title || 'Specialized Engineering Services'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {settings.services_section_desc || 'Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI.'}
        </p>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((svc, idx) => {
            const Icon = iconMap[svc.icon] || Code2;
            const g = GRADIENTS[idx % GRADIENTS.length];
            return (
              <div
                key={svc.id}
                onMouseEnter={() => setSpinningId(svc.id)}
                onMouseLeave={() => setSpinningId(null)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div style={{ perspective: '400px' }}>
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.from} ${g.to} flex items-center justify-center shadow-md`}
                        style={{
                          boxShadow: `0 6px 20px ${g.glow}`,
                          transformOrigin: 'center',
                          animation: spinningId === svc.id ? 'letterSpin 0.8s ease-in-out infinite' : 'none',
                        }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {settings.services_tier_label || 'Enterprise Tier'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
                    {svc.name}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {svc.full_description || svc.short_description}
                  </p>

                  {/* Features List */}
                  {svc.features && svc.features.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Key Capabilities & Deliverables
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {svc.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Methodology Breakdown */}
                {/* Actions & Related Projects */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => onNavigate('/contact')}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                  >
                    Request Service Proposal
                  </button>

                  <button
                    onClick={() => onNavigate('/projects')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>View Related Case Studies →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
