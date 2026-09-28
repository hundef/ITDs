import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Zap, Cpu, Scale, Activity } from 'lucide-react';

const pillars = [
  {
    icon: Cpu,
    title: 'Deterministic Architectural Rigor',
    description:
      'Zero black-box approximations. Every pipeline is engineered for mathematical consistency, strict type safety, and verifiable correctness.',
    badge: 'Engineering',
    gradient: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,.35)',
    border: 'hover:border-indigo-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Trust Defense in Depth',
    description:
      'Security is baked into every layer — mTLS inter-service encryption, automated runtime isolation, and SOC-2 compliance out of the box.',
    badge: 'Security',
    gradient: 'from-cyan-500 to-sky-600',
    glow: 'rgba(6,182,212,.35)',
    border: 'hover:border-cyan-500/30',
  },
  {
    icon: Zap,
    title: 'Sub-Millisecond Low Latency',
    description:
      'Optimized at the kernel and network layer using eBPF probes, edge CDN execution, and Redis ring buffers for microsecond throughput.',
    badge: 'Performance',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,.35)',
    border: 'hover:border-amber-500/30',
  },
  {
    icon: Scale,
    title: 'Autonomous Elastic Scalability',
    description:
      'Kubernetes controllers and reactive stream brokers auto-scale compute workloads seamlessly under unpredictable traffic spikes.',
    badge: 'Cloud',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,.35)',
    border: 'hover:border-emerald-500/30',
  },
];

const PillarCard: React.FC<{ pillar: typeof pillars[0]; delay: number }> = ({ pillar, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const Icon = pillar.icon;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative bg-[var(--bg-surface)] border border-[var(--border-color)] ${pillar.border}
        rounded-2xl p-6 flex flex-col gap-5
        shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]
        transition-all duration-350 hover:-translate-y-2 overflow-hidden
        ${vis ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      {/* Gradient glow blob */}
      <span
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${pillar.glow} 0%, transparent 70%)` }}
      />

      {/* Top section */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-md
            transition-transform duration-300 group-hover:scale-110 shrink-0`}
          style={{ boxShadow: `0 6px 20px ${pillar.glow}` }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
          bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent
          border border-[var(--border-color)] font-mono`}>
          {pillar.badge}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-slate-900 dark:text-white font-sans leading-snug">
        {pillar.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
        {pillar.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-[var(--border-subtle)]">
        <Activity className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Verified Benchmark</span>
      </div>

      {/* Inset ring on hover */}
      <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-white/10 dark:group-hover:ring-white/5 transition pointer-events-none" />
    </div>
  );
};

export const ValueProposition: React.FC = () => (
  <section className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((p, i) => (
          <PillarCard key={i} pillar={p} delay={i * 0.09} />
        ))}
      </div>
    </div>
  </section>
);
