import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { TeamMember } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  Target,
  Eye,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Globe,
  Users,
  Linkedin,
  Github,
  Mail,
  ArrowRight
} from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    api.team.getAll().then(res => {
      if (res.team) setTeam(res.team);
    }).catch(err => console.error(err));
  }, []);

  const [milestones, setMilestones] = useState<Array<{year: string; title: string; description: string}>>([
    {
      year: '2018',
      title: 'Company Inception',
      description: 'Founded by senior distributed systems architects to bring deterministic engineering rigor to enterprise software.'
    },
    {
      year: '2020',
      title: 'Cloud Orchestration Expansion',
      description: 'Launched our dedicated Kubernetes and eBPF infrastructure practice, serving leading FinTech and SaaS providers.'
    },
    {
      year: '2022',
      title: 'Enterprise AI & Vector Practice',
      description: 'Pioneered custom RAG pipelines and multimodal document intelligence engines for Fortune 500 legal and research teams.'
    },
    {
      year: '2024',
      title: 'Global Delivery Expansion',
      description: 'Expanded engineering operations to San Francisco and London, surpassing 40+ enterprise deployments.'
    },
    {
      year: '2026',
      title: 'Autonomous Systems Vanguard',
      description: 'Deploying self-healing microservice meshes and next-generation neural agent architectures.'
    }
  ]);

  useEffect(() => {
    // Load milestones from settings if available
    if (settings.milestones_json) {
      try {
        const parsed = JSON.parse(settings.milestones_json);
        setMilestones(parsed);
      } catch (e) {
        console.error('Failed to parse milestones:', e);
      }
    }
  }, [settings]);

  const objectives = [
    {
      title: '99.999% Service Level Agreements',
      description: 'Architecting fault-tolerant distributed networks that survive regional datacenter failures with zero data loss.'
    },
    {
      title: 'SOC-2 & ISO-27001 Compliance by Default',
      description: 'Embedding automated compliance logging, mTLS encryption, and cryptographic audit trees into every deliverable.'
    },
    {
      title: 'Sub-Millisecond P99 Latency Standards',
      description: 'Benchmarking performance under extreme stress concurrency before committing systems to production.'
    }
  ];

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.about_hero_badge || 'Our Heritage & Vision'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            {settings.about_hero_title || 'Pioneering the Next Era of Enterprise Computing'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {settings.about_hero_subtitle ||
              settings.company_tagline ||
              'We are a team of distributed systems engineers, AI researchers, and product architects dedicated to crafting software that defines industry standards.'}
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              Our Mission
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings.mission_statement ||
                'To empower visionary global enterprises with resilient, human-centered software architectures, autonomous cloud infrastructure, and verifiable artificial intelligence that transforms complex challenges into competitive advantages.'}
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-2xs">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              Our Vision
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings.vision_statement ||
                'To be the world’s most trusted technical partner for mission-critical software innovation, setting the global benchmark for architectural elegance, security, and measurable business impact.'}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
            {settings.core_values_section_title || 'Our Core Cultural Values'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(settings.core_values || [
            { title: 'Architectural Excellence', description: 'We never compromise on code quality, mathematical precision, security boundaries, or system scalability.' },
            { title: 'Deterministic Integrity', description: 'We design software that is predictable, auditable, and transparent, avoiding black-box approximations in mission-critical workflows.' },
            { title: 'Radical Collaboration', description: 'We partner deeply with our clients engineering teams, functioning as an integrated elite extension of their technical leadership.' },
            { title: 'Continuous Innovation', description: 'We continuously adopt bleeding-edge breakthroughs in AI, eBPF, distributed ledgers, and edge computing to solve real-world problems.' }
          ]).map((val, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs font-mono">
                0{idx + 1}
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                {val.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* History & Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
            {settings.milestones_section_title || 'Company Milestones & History'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {settings.milestones_section_desc || ''}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Centre vertical line */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 hidden sm:block"
            style={{
              background: settings.milestones_timeline_color || '#6366f1',
              opacity: 0.3
            }}
          />

          {milestones.map((m, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div key={idx} className={`relative flex items-start gap-0 sm:gap-8 mb-10 ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>

                {/* Card — takes half width on desktop */}
                <div className="flex-1 sm:max-w-[calc(50%-2rem)]">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 inline-block mb-2">
                      {m.year}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                      {m.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                {/* Centre dot */}
                <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-6 w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 items-center justify-center shadow-md z-10">
                  <Calendar className="w-4 h-4" />
                </div>

                {/* Spacer for the other side */}
                <div className="flex-1 hidden sm:block" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>{settings.team_badge_text || 'Our Leadership'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
              {settings.leadership_section_title || 'Executive & Technical Leadership'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/team')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Meet Full Team</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {team.filter(m => m.is_leadership).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {team
              .filter(m => m.is_leadership)
              .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
              .map(m => (
                <div
                  key={m.id}
                  className="flex flex-col items-center text-center group"
                >
                  {m.is_visible === 1 || m.is_visible === true ? (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 mb-4 ring-2 ring-indigo-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={m.avatar || '/avatars/avatar_default.jpg'}
                        alt={m.name}
                        onError={(e) => { e.currentTarget.src = '/avatars/avatar_default.jpg'; }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative w-32 h-32 mb-4 group/hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-2xl blur-xl group-hover/hidden:from-indigo-500/20 group-hover/hidden:to-purple-500/20 transition-all duration-300" />
                      <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl flex flex-col items-center justify-center ring-2 ring-indigo-200/50 dark:ring-indigo-800/50 border border-indigo-100/50 dark:border-indigo-800/30 group-hover/hidden:ring-indigo-300 dark:group-hover/hidden:ring-indigo-700 transition-all duration-300 backdrop-blur-sm">
                        <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center opacity-60 group-hover/hidden:opacity-100 transition-opacity">
                          <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {m.is_visible === 1 || m.is_visible === true ? (
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {m.name}
                    </h3>
                  ) : null}

                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                    {m.role}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Leadership team information coming soon.</p>
          </div>
        )}
      </section>
    </div>
  );
};
