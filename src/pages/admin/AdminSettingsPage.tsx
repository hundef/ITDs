import React, { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../components/common/Toast';
import { AdminInsightsEditor } from '../../components/admin/AdminInsightsEditor';
import { WebsiteSettings, Insight } from '../../types';
import {
  Settings,
  Save,
  Building2,
  BarChart,
  Target,
  Eye,
  Mail,
  Share2,
  CheckCircle2,
  Sliders,
  Heart,
  Plus,
  Trash2,
  Sparkles,
  Lightbulb
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { success, error } = useToast();

  const [form, setForm] = useState<WebsiteSettings>({});
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewTurn, setPreviewTurn] = useState(0);

  useEffect(() => {
    setForm(settings);
    setInsights(settings.insights || []);
  }, [settings]);

  useEffect(() => {
    const text = (form.company_slogan || 'Create. Innovate. Impact.').trim();
    const parts = text.split(/(?<=[.,;])\s*|\s{2,}/).filter(Boolean);
    if (parts.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewTurn(p => (p + 1) % parts.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [form.company_slogan]);

  const handleAddCoreValue = () => {
    const current = form.core_values || [];
    setForm({
      ...form,
      core_values: [
        ...current,
        { title: 'New Core Value', description: 'Describe this principle and its impact.' }
      ]
    });
  };

  const handleUpdateCoreValue = (index: number, field: 'title' | 'description', val: string) => {
    const current = [...(form.core_values || [])];
    current[index] = { ...current[index], [field]: val };
    setForm({ ...form, core_values: current });
  };

  const handleRemoveCoreValue = (index: number) => {
    const current = [...(form.core_values || [])];
    current.splice(index, 1);
    setForm({ ...form, core_values: current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Include insights in the form
      const formWithInsights = {
        ...form,
        insights: insights,
        insights_json: JSON.stringify(insights)
      };
      
      const ok = await updateSettings(formWithInsights);
      if (ok) {
        success('Website CMS & branding settings saved successfully!');
        await refreshSettings();
      } else {
        error('Failed to update settings.');
      }
    } catch (err: any) {
      error(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInsights = async () => {
    setIsSaving(true);
    try {
      const formWithInsights = {
        ...form,
        insights: insights,
        insights_json: JSON.stringify(insights)
      };
      
      const ok = await updateSettings(formWithInsights);
      if (ok) {
        success('Insights updated successfully!');
        await refreshSettings();
      } else {
        error('Failed to update insights.');
      }
    } catch (err: any) {
      error(err.message || 'Error updating insights');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Website CMS & Branding Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Configure global company information, slogans, live stats counters, mission/vision, and socials.</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* 1. General Company Branding */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
          <Building2 className="w-5 h-5 text-indigo-500" />
          <span>General Company Identity & Brand</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
            <input
              type="text"
              value={form.company_name || ''}
              onChange={e => setForm({ ...form, company_name: e.target.value })}
              placeholder="Technical Intelligence Directorate"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand Logo Acronym</label>
            <input
              type="text"
              value={form.logo_name || ''}
              onChange={e => setForm({ ...form, logo_name: e.target.value })}
              placeholder="ITD"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Founded Year</label>
            <input
              type="text"
              value={form.founded_year || ''}
              onChange={e => setForm({ ...form, founded_year: e.target.value })}
              placeholder="2018"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Homepage Hero Section & Main Slogan */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Homepage Hero Section & Main Slogan</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize the primary headline, hero slogan, announcement badge, and value proposition shown to public visitors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Homepage Main Slogan (Hero Headline) *
            </label>
            <input
              type="text"
              value={form.company_slogan || ''}
              onChange={e => setForm({ ...form, company_slogan: e.target.value })}
              placeholder="e.g. Pioneering the Next Era of Enterprise Computing"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Top Announcement Badge Title
            </label>
            <input
              type="text"
              value={form.hero_badge_text || ''}
              onChange={e => setForm({ ...form, hero_badge_text: e.target.value })}
              placeholder="e.g. Architecting ITD Enterprise Software & AI Pipelines"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Badge Verification Tag
            </label>
            <input
              type="text"
              value={form.hero_badge_subtext || ''}
              onChange={e => setForm({ ...form, hero_badge_subtext: e.target.value })}
              placeholder="e.g. SOC-2 & ISO-27001"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Company Tagline / Hero Subtitle Description
            </label>
            <textarea
              rows={3}
              value={form.company_tagline || ''}
              onChange={e => setForm({ ...form, company_tagline: e.target.value })}
              placeholder="We partner with industry pioneers to architect resilient distributed systems, sub-second RAG neural engines, and autonomous Kubernetes cloud infrastructure."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white leading-relaxed"
            />
          </div>
        </div>

        {/* Live Hero Preview Box */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Live Homepage Hero Preview
          </span>
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-center space-y-4 shadow-inner relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{form.hero_badge_text || 'Architecting ITD Enterprise Software & AI Pipelines'}</span>
              <span className="text-indigo-400">•</span>
              <span className="font-mono text-[10px]">{form.hero_badge_subtext || 'SOC-2 & ISO-27001'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {(() => {
                const text = (form.company_slogan || 'Create. Innovate. Impact.').trim();
                const dotParts = text.split(/(?<=[.,;])\s*|\s{2,}/).filter(Boolean);
                if (dotParts.length > 1) {
                  const themes = [
                    {
                      activeGrad: 'from-cyan-300 via-sky-400 to-blue-400',
                      inactiveGrad: 'from-cyan-400/50 via-sky-400/50 to-blue-400/50',
                      glow: 'rgba(6, 182, 212, 0.65)',
                      dotColor: '#06b6d4',
                      beam: 'from-transparent via-cyan-400 to-transparent'
                    },
                    {
                      activeGrad: 'from-fuchsia-300 via-purple-300 to-pink-400',
                      inactiveGrad: 'from-fuchsia-400/50 via-purple-400/50 to-pink-400/50',
                      glow: 'rgba(217, 70, 239, 0.65)',
                      dotColor: '#d946ef',
                      beam: 'from-transparent via-fuchsia-400 to-transparent'
                    },
                    {
                      activeGrad: 'from-emerald-300 via-teal-300 to-cyan-300',
                      inactiveGrad: 'from-emerald-400/50 via-teal-400/50 to-cyan-400/50',
                      glow: 'rgba(16, 185, 129, 0.65)',
                      dotColor: '#10b981',
                      beam: 'from-transparent via-emerald-400 to-transparent'
                    },
                    {
                      activeGrad: 'from-amber-300 via-orange-300 to-rose-400',
                      inactiveGrad: 'from-amber-400/50 via-orange-400/50 to-rose-400/50',
                      glow: 'rgba(245, 158, 11, 0.65)',
                      dotColor: '#f59e0b',
                      beam: 'from-transparent via-amber-400 to-transparent'
                    }
                  ];

                  return (
                    <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                      {dotParts.map((part, idx) => {
                        const theme = themes[idx % themes.length];
                        const isActive = idx === (previewTurn % dotParts.length);
                        const isDotEnd = part.endsWith('.');
                        const clean = isDotEnd ? part.slice(0, -1) : part;

                        return (
                          <span
                            key={idx}
                            onClick={() => setPreviewTurn(idx)}
                            className={`relative inline-flex flex-col items-center cursor-pointer transition-all duration-400 ${
                              isActive ? 'scale-105 -translate-y-0.5' : 'opacity-60 hover:opacity-90'
                            }`}
                          >
                            <span className="inline-flex items-baseline">
                              <span
                                className={`bg-gradient-to-r ${
                                  isActive ? theme.activeGrad : theme.inactiveGrad
                                } bg-clip-text text-transparent font-extrabold transition-all duration-400 ${
                                  isActive ? 'animate-gradient-shimmer bg-[length:200%_auto]' : ''
                                }`}
                                style={{
                                  filter: isActive ? `drop-shadow(0 0 15px ${theme.glow})` : 'none'
                                }}
                              >
                                {clean}
                              </span>
                              {isDotEnd && (
                                <span className="relative inline-flex items-center justify-center ml-1 align-baseline">
                                  {isActive && (
                                    <span
                                      className="absolute w-3.5 h-3.5 rounded-full animate-radar-wave"
                                      style={{ backgroundColor: theme.dotColor, opacity: 0.6 }}
                                    />
                                  )}
                                  <span
                                    className={`relative inline-block w-2 h-2 rounded-full transition-all duration-300 ${
                                      isActive ? 'scale-110' : 'scale-90 opacity-70'
                                    }`}
                                    style={{
                                      backgroundColor: theme.dotColor,
                                      boxShadow: `0 0 8px ${theme.dotColor}`
                                    }}
                                  />
                                </span>
                              )}
                            </span>
                            <span
                              className={`mt-1 h-0.5 rounded-full transition-all duration-400 ${
                                isActive
                                  ? `w-full bg-gradient-to-r ${theme.beam} opacity-100 animate-beam`
                                  : 'w-0 opacity-0'
                              }`}
                            />
                          </span>
                        );
                      })}
                    </span>
                  );
                }
                return (
                  <span className="bg-gradient-to-r from-white via-indigo-300 to-cyan-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shimmer">
                    {text}
                  </span>
                );
              })()}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              {form.company_tagline ||
                'We partner with industry pioneers to architect resilient distributed systems, sub-second RAG neural engines, and autonomous Kubernetes cloud infrastructure.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Live Homepage Statistics Counters */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
          <BarChart className="w-5 h-5 text-indigo-500" />
          <span>Homepage Statistics Bar Counters</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Projects Completed</label>
            <input
              type="text"
              value={form.stats_projects_completed || ''}
              onChange={e => setForm({ ...form, stats_projects_completed: e.target.value })}
              placeholder="e.g. 48+"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Projects Ongoing</label>
            <input
              type="text"
              value={form.stats_projects_ongoing || ''}
              onChange={e => setForm({ ...form, stats_projects_ongoing: e.target.value })}
              placeholder="e.g. 12"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Clients Served</label>
            <input
              type="text"
              value={form.stats_clients_served || ''}
              onChange={e => setForm({ ...form, stats_clients_served: e.target.value })}
              placeholder="e.g. 35+"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Years Experience</label>
            <input
              type="text"
              value={form.stats_years_experience || ''}
              onChange={e => setForm({ ...form, stats_years_experience: e.target.value })}
              placeholder="e.g. 8+"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Team Members</label>
            <input
              type="text"
              value={form.stats_team_members || ''}
              onChange={e => setForm({ ...form, stats_team_members: e.target.value })}
              placeholder="e.g. 60+"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Satisfaction Rating</label>
            <input
              type="text"
              value={form.stats_client_satisfaction || ''}
              onChange={e => setForm({ ...form, stats_client_satisfaction: e.target.value })}
              placeholder="e.g. 99.4%"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Live Preview of Stats Cards */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">
            Live Stats Preview
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/30 text-center">
              <span className="block text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{form.stats_projects_completed || '48+'}</span>
              <span className="block text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-semibold mt-1">Projects Completed</span>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 dark:border-indigo-500/30 text-center">
              <span className="block text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{form.stats_projects_ongoing || '12'}</span>
              <span className="block text-[10px] text-indigo-600/70 dark:text-indigo-400/70 font-semibold mt-1">Projects Ongoing</span>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20 dark:border-cyan-500/30 text-center">
              <span className="block text-lg sm:text-xl font-extrabold text-cyan-600 dark:text-cyan-400">{form.stats_clients_served || '35+'}</span>
              <span className="block text-[10px] text-cyan-600/70 dark:text-cyan-400/70 font-semibold mt-1">Clients Served</span>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 dark:border-amber-500/30 text-center">
              <span className="block text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400">{form.stats_years_experience || '8+'}</span>
              <span className="block text-[10px] text-amber-600/70 dark:text-amber-400/70 font-semibold mt-1">Years Experience</span>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 dark:border-violet-500/30 text-center">
              <span className="block text-lg sm:text-xl font-extrabold text-violet-600 dark:text-violet-400">{form.stats_team_members || '60+'}</span>
              <span className="block text-[10px] text-violet-600/70 dark:text-violet-400/70 font-semibold mt-1">Team Members</span>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 dark:border-rose-500/30 text-center">
              <span className="block text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400">{form.stats_client_satisfaction || '99.4%'}</span>
              <span className="block text-[10px] text-rose-600/70 dark:text-rose-400/70 font-semibold mt-1">Client Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. About Page Hero, Mission & Vision Statements */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Target className="w-5 h-5 text-indigo-500" />
            <span>About Us Page, Mission & Vision Statements</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize the primary headline, vision badge, and cultural statements displayed on the public About page.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              About Page Main Headline (Hero Title) *
            </label>
            <input
              type="text"
              value={form.about_hero_title || ''}
              onChange={e => setForm({ ...form, about_hero_title: e.target.value })}
              placeholder="e.g. Pioneering the Next Era of Enterprise Computing"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              About Page Badge Tag
            </label>
            <input
              type="text"
              value={form.about_hero_badge || ''}
              onChange={e => setForm({ ...form, about_hero_badge: e.target.value })}
              placeholder="e.g. Our Heritage & Vision"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              About Page Intro Subtitle
            </label>
            <textarea
              rows={2}
              value={form.about_hero_subtitle || ''}
              onChange={e => setForm({ ...form, about_hero_subtitle: e.target.value })}
              placeholder="We are a team of distributed systems engineers, AI researchers, and product architects dedicated to crafting software that defines industry standards."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Milestones Section Heading
            </label>
            <input
              type="text"
              value={form.milestones_section_title || ''}
              onChange={e => setForm({ ...form, milestones_section_title: e.target.value })}
              placeholder="Company Milestones & History"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Milestones Section Subtitle
            </label>
            <input
              type="text"
              value={form.milestones_section_desc || ''}
              onChange={e => setForm({ ...form, milestones_section_desc: e.target.value })}
              placeholder="From an initial boutique consultancy to an international enterprise engineering powerhouse."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Timeline Line Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.milestones_timeline_color || '#6366f1'}
                onChange={e => setForm({ ...form, milestones_timeline_color: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={form.milestones_timeline_color || '#6366f1'}
                onChange={e => setForm({ ...form, milestones_timeline_color: e.target.value })}
                placeholder="#6366f1"
                className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Company Milestones</label>
            <div className="space-y-4">
              {(() => {
                try {
                  const milestones = JSON.parse(form.milestones_json || '[]');
                  return milestones.map((m: any, idx: number) => (
                    <div key={idx} className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={m.year}
                          onChange={e => {
                            const updated = JSON.parse(form.milestones_json || '[]');
                            updated[idx].year = e.target.value;
                            setForm({ ...form, milestones_json: JSON.stringify(updated) });
                          }}
                          placeholder="Year (e.g., 2018)"
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                        />
                        <input
                          type="text"
                          value={m.title}
                          onChange={e => {
                            const updated = JSON.parse(form.milestones_json || '[]');
                            updated[idx].title = e.target.value;
                            setForm({ ...form, milestones_json: JSON.stringify(updated) });
                          }}
                          placeholder="Title (e.g., Company Inception)"
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            const updated = JSON.parse(form.milestones_json || '[]');
                            updated.splice(idx, 1);
                            setForm({ ...form, milestones_json: JSON.stringify(updated) });
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-xs font-bold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        value={m.description}
                        onChange={e => {
                          const updated = JSON.parse(form.milestones_json || '[]');
                          updated[idx].description = e.target.value;
                          setForm({ ...form, milestones_json: JSON.stringify(updated) });
                        }}
                        placeholder="Description"
                        rows={2}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  ));
                } catch (e) {
                  return <div className="text-red-600 text-xs">Invalid JSON format</div>;
                }
              })()}
            </div>
            <button
              onClick={() => {
                try {
                  const updated = JSON.parse(form.milestones_json || '[]');
                  updated.push({ year: '', title: '', description: '' });
                  setForm({ ...form, milestones_json: JSON.stringify(updated) });
                } catch (e) {
                  console.error('Invalid JSON');
                }
              }}
              className="mt-3 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              + Add Milestone
            </button>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Mission Statement</label>
            <textarea
              rows={3}
              value={form.mission_statement || ''}
              onChange={e => setForm({ ...form, mission_statement: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Vision Statement</label>
            <textarea
              rows={3}
              value={form.vision_statement || ''}
              onChange={e => setForm({ ...form, vision_statement: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Services & Showcase Section Headlines */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <span>Public Section Headlines & Introductions</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize the main section titles and intro descriptions displayed across the public pages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Services Page Main Title
            </label>
            <input
              type="text"
              value={form.services_section_title || ''}
              onChange={e => setForm({ ...form, services_section_title: e.target.value })}
              placeholder="Specialized Engineering Services"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Projects Showcase Section Title
            </label>
            <input
              type="text"
              value={form.projects_section_title || ''}
              onChange={e => setForm({ ...form, projects_section_title: e.target.value })}
              placeholder="Engineering Showcase & Case Studies"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Featured Projects Section Title
            </label>
            <input
              type="text"
              value={form.featured_section_title || ''}
              onChange={e => setForm({ ...form, featured_section_title: e.target.value })}
              placeholder="Featured Projects & Engineering Milestones"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Services Section Intro Description
            </label>
            <textarea
              rows={2}
              value={form.services_section_desc || ''}
              onChange={e => setForm({ ...form, services_section_desc: e.target.value })}
              placeholder="Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Projects Showcase Intro Description
            </label>
            <textarea
              rows={2}
              value={form.projects_section_desc || ''}
              onChange={e => setForm({ ...form, projects_section_desc: e.target.value })}
              placeholder="Add description for projects section"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Featured Projects Section Description
            </label>
            <textarea
              rows={2}
              value={form.featured_section_desc || ''}
              onChange={e => setForm({ ...form, featured_section_desc: e.target.value })}
              placeholder="Add description for featured projects section"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Featured Projects Badge Label
            </label>
            <input
              type="text"
              value={form.featured_badge_text || ''}
              onChange={e => setForm({ ...form, featured_badge_text: e.target.value })}
              placeholder="Showcase Portfolio"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Projects Page Badge Label
            </label>
            <input
              type="text"
              value={form.projects_badge_text || ''}
              onChange={e => setForm({ ...form, projects_badge_text: e.target.value })}
              placeholder="Central Project Portfolio"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Executive Leadership Section Title
            </label>
            <input
              type="text"
              value={form.leadership_section_title || ''}
              onChange={e => setForm({ ...form, leadership_section_title: e.target.value })}
              placeholder="Executive Leadership"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Executive Leadership Section Subtitle
            </label>
            <input
              type="text"
              value={form.leadership_section_desc || ''}
              onChange={e => setForm({ ...form, leadership_section_desc: e.target.value })}
              placeholder="Led by seasoned industry veterans and technical innovators."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Leadership & Team Section Title *
            </label>
            <input
              type="text"
              value={form.team_section_title || ''}
              onChange={e => setForm({ ...form, team_section_title: e.target.value })}
              placeholder="e.g. The Architects & Developers Behind TID"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact CTA Section Title
            </label>
            <input
              type="text"
              value={form.contact_cta_title || ''}
              onChange={e => setForm({ ...form, contact_cta_title: e.target.value })}
              placeholder="e.g. Let's Discuss Your Architecture"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Leadership & Team Section Description
            </label>
            <textarea
              rows={2}
              value={form.team_section_desc || ''}
              onChange={e => setForm({ ...form, team_section_desc: e.target.value })}
              placeholder="An elite collective of distributed systems pioneers, AI researchers, and UX architects building mission-critical platforms."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact CTA Description
            </label>
            <textarea
              rows={2}
              value={form.contact_cta_desc || ''}
              onChange={e => setForm({ ...form, contact_cta_desc: e.target.value })}
              placeholder="Whether you require a dedicated AI vector intelligence platform, cloud modernization, or high-throughput ledgers, our team is ready to assist."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Page Card Heading
            </label>
            <input
              type="text"
              value={form.contact_card_heading || ''}
              onChange={e => setForm({ ...form, contact_card_heading: e.target.value })}
              placeholder="Contact Coordinates"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Email Label
            </label>
            <input
              type="text"
              value={form.contact_email_label || ''}
              onChange={e => setForm({ ...form, contact_email_label: e.target.value })}
              placeholder="Email"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email SLA / Note
            </label>
            <input
              type="text"
              value={form.contact_email_sla || ''}
              onChange={e => setForm({ ...form, contact_email_sla: e.target.value })}
              placeholder="SLA: Replies within 4-12 hours"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Label
            </label>
            <input
              type="text"
              value={form.contact_phone_label || ''}
              onChange={e => setForm({ ...form, contact_phone_label: e.target.value })}
              placeholder="Telephone"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Hours / Note
            </label>
            <input
              type="text"
              value={form.contact_phone_hours || ''}
              onChange={e => setForm({ ...form, contact_phone_hours: e.target.value })}
              placeholder="Mon–Fri: 8:00 AM – 7:00 PM"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Address Label
            </label>
            <input
              type="text"
              value={form.contact_address_label || ''}
              onChange={e => setForm({ ...form, contact_address_label: e.target.value })}
              placeholder="Headquarters"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Blog & Whitepapers Section Title *
            </label>
            <input
              type="text"
              value={form.blog_section_title || ''}
              onChange={e => setForm({ ...form, blog_section_title: e.target.value })}
              placeholder="e.g. Technical Perspectives & Architecture Whitepapers"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Blog & Whitepapers Badge Tag
            </label>
            <input
              type="text"
              value={form.blog_badge_text || ''}
              onChange={e => setForm({ ...form, blog_badge_text: e.target.value })}
              placeholder="e.g. Research & Engineering Insights"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Blog & Whitepapers Section Intro Description
            </label>
            <textarea
              rows={2}
              value={form.blog_section_desc || ''}
              onChange={e => setForm({ ...form, blog_section_desc: e.target.value })}
              placeholder="Deep-dive analysis on real-world engineering challenges, vector retrieval, eBPF telemetry, and high-throughput financial ledgers."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Key Insights & Findings */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Key Insights & Findings</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Featured insights and key findings from your work.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveInsights}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Insights'}</span>
          </button>
        </div>
        
        <AdminInsightsEditor
          insights={insights}
          onInsightsChange={setInsights}
        />
      </div>

      {/* 4. Testimonials Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Testimonials Badge Label
            </label>
            <input
              type="text"
              value={form.testimonials_badge_text || ''}
              onChange={e => setForm({ ...form, testimonials_badge_text: e.target.value })}
              placeholder="Client Endorsements"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Testimonials Section Title
            </label>
            <input
              type="text"
              value={form.testimonials_section_title || ''}
              onChange={e => setForm({ ...form, testimonials_section_title: e.target.value })}
              placeholder="Trusted by Leaders at Scale"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Testimonials Section Description
            </label>
            <input
              type="text"
              value={form.testimonials_section_desc || ''}
              onChange={e => setForm({ ...form, testimonials_section_desc: e.target.value })}
              placeholder="What CTOs, CIOs, and engineering directors say about partnering with ITD."
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Services Page Tier Badge Label
            </label>
            <input
              type="text"
              value={form.services_tier_label || ''}
              onChange={e => setForm({ ...form, services_tier_label: e.target.value })}
              placeholder="Enterprise Tier"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Core Cultural Values Manager */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Our Core Cultural Values</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure the core principles and descriptions displayed on the public About Us page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCoreValue}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Core Value</span>
          </button>
        </div>

        {/* Section heading & subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Section Heading
            </label>
            <input
              type="text"
              value={form.core_values_section_title || ''}
              onChange={e => setForm({ ...form, core_values_section_title: e.target.value })}
              placeholder="Our Core Cultural Values"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Section Subtitle
            </label>
            <input
              type="text"
              value={form.core_values_section_desc || ''}
              onChange={e => setForm({ ...form, core_values_section_desc: e.target.value })}
              placeholder="Enter core values section description (or leave blank)"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(form.core_values || []).map((val, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs font-mono">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Value #{idx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCoreValue(idx)}
                  className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Core Value"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Value Title</label>
                <input
                  type="text"
                  value={val.title}
                  onChange={e => handleUpdateCoreValue(idx, 'title', e.target.value)}
                  placeholder="e.g. Architectural Excellence"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Value Description</label>
                <textarea
                  rows={2}
                  value={val.description}
                  onChange={e => handleUpdateCoreValue(idx, 'description', e.target.value)}
                  placeholder="Describe this core principle..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Contact & Social Channels */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
          <Mail className="w-5 h-5 text-indigo-500" />
          <span>Contact Coordinates & Social Media Links</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={form.primary_email || ''}
              onChange={e => setForm({ ...form, primary_email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Support Email</label>
            <input
              type="email"
              value={form.support_email || ''}
              onChange={e => setForm({ ...form, support_email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={form.phone_number || ''}
              onChange={e => setForm({ ...form, phone_number: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Business Hours</label>
            <input
              type="text"
              value={form.business_hours || ''}
              onChange={e => setForm({ ...form, business_hours: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Headquarters Address</label>
            <input
              type="text"
              value={form.office_address || ''}
              onChange={e => setForm({ ...form, office_address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Twitter / X URL</label>
            <input
              type="url"
              value={form.twitter_url || ''}
              onChange={e => setForm({ ...form, twitter_url: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">LinkedIn URL</label>
            <input
              type="url"
              value={form.linkedin_url || ''}
              onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">GitHub URL</label>
            <input
              type="url"
              value={form.github_url || ''}
              onChange={e => setForm({ ...form, github_url: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">YouTube URL</label>
            <input
              type="url"
              value={form.youtube_url || ''}
              onChange={e => setForm({ ...form, youtube_url: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all"
        >
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
};
