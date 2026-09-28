import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { DashboardStats, Project, Inquiry } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Briefcase,
  Users,
  Eye,
  MessageSquare,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Settings,
  ShieldCheck,
  FileText,
  Edit3,
  Save,
  Check,
  Star,
  Sliders,
  Bell,
  Trash2,
  ExternalLink,
  Globe,
  Share2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Target,
  Compass
} from 'lucide-react';

export const AdminDashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, hasPermission } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { success, error } = useToast();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editable Company Profile & Tagline Form State
  const [companyForm, setCompanyForm] = useState({
    company_name: settings.company_name || 'Technical Intelligence Directorate',
    logo_name: settings.logo_name || 'ITD',
    logo_url: settings.logo_url || '',
    company_slogan: settings.company_slogan || 'Pioneering the Next Era of Enterprise Computing',
    company_tagline: settings.company_tagline || 'We architect, build, and scale mission-critical software, generative AI pipelines, and cloud platforms for forward-thinking organizations worldwide.',
    mission_statement: settings.mission_statement || 'To empower visionary global enterprises with resilient, human-centered software architectures, autonomous cloud infrastructure, and verifiable artificial intelligence.',
    vision_statement: settings.vision_statement || 'To be the world’s most trusted technical partner for mission-critical software innovation, setting the global benchmark for architectural elegance, security, and measurable business impact.',
    services_section_title: settings.services_section_title || 'Specialized Engineering Services',
    services_section_desc: settings.services_section_desc || 'Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI.',
    projects_section_title: settings.projects_section_title || 'Engineering Showcase & Case Studies',
    projects_section_desc: settings.projects_section_desc || '',
    team_section_title: settings.team_section_title || 'The Architects & Developers Behind TID',
    team_section_desc: settings.team_section_desc || 'An elite collective of distributed systems pioneers, AI researchers, and UX architects building mission-critical platforms.',
    contact_cta_title: settings.contact_cta_title || "Let's Discuss Your Architecture",
    contact_cta_desc: settings.contact_cta_desc || 'Whether you require a dedicated AI vector intelligence platform, cloud modernization, or high-throughput ledgers, our team is ready to assist.',
    stats_projects_completed: settings.stats_projects_completed || '48+',
    stats_projects_ongoing: settings.stats_projects_ongoing || '12',
    stats_clients_served: settings.stats_clients_served || '35+',
    stats_client_satisfaction: settings.stats_client_satisfaction || '99.4%',
    primary_email: settings.primary_email || 'contact@insa.gov.et',
    phone_number: settings.phone_number || '+251-0135685458',
    office_address: settings.office_address || 'Addis Ababa, Ethiopia',
    github_url: settings.github_url || 'https://github.com',
    linkedin_url: settings.linkedin_url || 'https://linkedin.com',
    twitter_url: settings.twitter_url || 'https://twitter.com',
    youtube_url: settings.youtube_url || 'https://youtube.com'
  });

  const [isEditingCompanyProfile, setIsEditingCompanyProfile] = useState(false);
  const [isSavingCompanyProfile, setIsSavingCompanyProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Update local form state when settings load
  useEffect(() => {
    if (settings) {
      setCompanyForm({
        company_name: settings.company_name || 'Technical Intelligence Directorate',
        logo_name: settings.logo_name || 'ITD',
        logo_url: settings.logo_url || '',
        company_slogan: settings.company_slogan || 'Pioneering the Next Era of Enterprise Computing',
        company_tagline: settings.company_tagline || 'We architect, build, and scale mission-critical software, generative AI pipelines, and cloud platforms for forward-thinking organizations worldwide.',
        mission_statement: settings.mission_statement || 'To empower visionary global enterprises with resilient, human-centered software architectures, autonomous cloud infrastructure, and verifiable artificial intelligence.',
        vision_statement: settings.vision_statement || 'To be the world’s most trusted technical partner for mission-critical software innovation, setting the global benchmark for architectural elegance, security, and measurable business impact.',
        services_section_title: settings.services_section_title || 'Specialized Engineering Services',
        services_section_desc: settings.services_section_desc || 'Comprehensive, end-to-end technology solutions tailored for enterprises demanding deterministic performance, high availability, and measurable ROI.',
        projects_section_title: settings.projects_section_title || 'Engineering Showcase & Case Studies',
        projects_section_desc: settings.projects_section_desc || '',
        team_section_title: settings.team_section_title || 'The Architects & Developers Behind TID',
        team_section_desc: settings.team_section_desc || 'An elite collective of distributed systems pioneers, AI researchers, and UX architects building mission-critical platforms.',
        contact_cta_title: settings.contact_cta_title || "Let's Discuss Your Architecture",
        contact_cta_desc: settings.contact_cta_desc || 'Whether you require a dedicated AI vector intelligence platform, cloud modernization, or high-throughput ledgers, our team is ready to assist.',
        stats_projects_completed: settings.stats_projects_completed || '48+',
        stats_projects_ongoing: settings.stats_projects_ongoing || '12',
        stats_clients_served: settings.stats_clients_served || '35+',
        stats_client_satisfaction: settings.stats_client_satisfaction || '99.4%',
        primary_email: settings.primary_email || 'contact@insa.gov.et',
        phone_number: settings.phone_number || '+251-0135685458',
        office_address: settings.office_address || 'Addis Ababa, Ethiopia',
        github_url: settings.github_url || 'https://github.com',
        linkedin_url: settings.linkedin_url || 'https://linkedin.com',
        twitter_url: settings.twitter_url || 'https://twitter.com',
        youtube_url: settings.youtube_url || 'https://youtube.com'
      });
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setCompanyForm(prev => ({ ...prev, logo_url: res.url }));
        success('Logo image uploaded successfully!');
      } else {
        error(res.message || 'Failed to upload logo image.');
      }
    } catch (err: any) {
      error(err.message || 'Logo upload failed.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompanyProfile(true);
    try {
      const ok = await updateSettings(companyForm);
      if (ok) {
        success('Global company profile, slogan & mission saved live across website!');
        setIsEditingCompanyProfile(false);
      } else {
        error('Failed to save company settings.');
      }
    } catch (err: any) {
      error(err.message || 'Error saving company settings.');
    } finally {
      setIsSavingCompanyProfile(false);
    }
  };

  // Editable Dashboard Announcement / Note State
  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem('nexora_dash_announcement') || '🚀 Q3 Portfolio Review & Infrastructure Deployment Cycle is active.';
  });
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState(announcement);

  // Editable Featured Projects & Recent Inquiries List State
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.stats.getDashboard();
      if (res.success) {
        setData(res);
      }

      // Fetch featured projects for direct inline editing
      const projectsRes = await api.projects.getAll({ is_featured: 'true', published: 'all' });
      if (projectsRes.success) {
        setFeaturedProjects(projectsRes.projects || []);
      }

      // Fetch recent inquiries for direct status editing
      const inquiriesRes = await api.inquiries.getAll();
      if (inquiriesRes.success) {
        setRecentInquiries((inquiriesRes.inquiries || []).slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveNotice = () => {
    setAnnouncement(noticeDraft);
    localStorage.setItem('nexora_dash_announcement', noticeDraft);
    setIsEditingNotice(false);
    success('Dashboard announcement updated successfully!');
  };

  const handleToggleProjectFeatured = async (project: Project) => {
    setIsUpdatingId(project.id);
    try {
      const updated = !project.is_featured;
      const res = await api.projects.update(project.id, { ...project, is_featured: updated });
      if (res.success) {
        success(`Project "${project.name}" ${updated ? 'featured on homepage' : 'removed from homepage'}.`);
        fetchDashboardData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update project status');
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleChangeProjectStatus = async (project: Project, newStatus: any) => {
    setIsUpdatingId(project.id);
    try {
      const res = await api.projects.update(project.id, { ...project, status: newStatus });
      if (res.success) {
        success(`Project status updated to ${newStatus}!`);
        fetchDashboardData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update project status');
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleChangeInquiryStatus = async (inquiryId: number, newStatus: any) => {
    try {
      const res = await api.inquiries.updateStatus(inquiryId, newStatus);
      if (res.success) {
        success(`Inquiry #${inquiryId} status set to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update inquiry status');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, charts, recentActivity } = data;

  return (
    <div className="space-y-10">
      {/* Top Banner with Welcome, Editable Broadcast Note & Actions */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authenticated Workspace ({user?.role})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Interactive CMS dashboard — edit content, update project states, and manage incoming inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasPermission('projects.create') && (
              <button
                onClick={() => onNavigate('/admin/projects/new')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ New Project</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              <span>View Live Site</span>
            </button>
          </div>
        </div>

        {/* EDITABLE DASHBOARD ANNOUNCEMENT BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Bell className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="w-full space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Dashboard Broadcast Note</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Editable</span>
              </div>
              {isEditingNotice ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={noticeDraft}
                    onChange={e => setNoticeDraft(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveNotice}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-200 font-medium">
                  {announcement}
                </p>
              )}
            </div>
          </div>

          {!isEditingNotice && (
            <button
              onClick={() => { setNoticeDraft(announcement); setIsEditingNotice(true); }}
              className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold shrink-0 flex items-center gap-1"
              title="Edit Dashboard Broadcast Note"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Note</span>
            </button>
          )}
        </div>
      </div>

      {/* EDITABLE GLOBAL COMPANY INFORMATION & SLOGAN CARD */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-sans">
                  Global Company Profile & Slogan Editor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure brand title, tagline slogans, mission/vision, live stat counters, and social links.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingCompanyProfile(!isEditingCompanyProfile)}
            disabled={!hasPermission('settings.manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto ${
              hasPermission('settings.manage')
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800'
                : 'text-slate-400 bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{!hasPermission('settings.manage') ? 'No Permission' : isEditingCompanyProfile ? 'Close Editor' : 'Edit Company Branding'}</span>
          </button>
        </div>

        {isEditingCompanyProfile ? (
          <form onSubmit={handleSaveCompanyProfile} className="space-y-6 animate-fade-in">
            {/* Brand Logo & Company Name Header Block */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
              <span className="block text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                🖼️ Brand Logo & Company Identifier
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Logo Preview */}
                <div className="sm:col-span-3 flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  {companyForm.logo_url ? (
                    <img
                      src={companyForm.logo_url}
                      alt="Company Logo Preview"
                      className="w-16 h-16 object-contain rounded-lg shadow-xs mb-1"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-1">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">Logo Preview</span>
                </div>

                {/* Upload & Logo URL */}
                <div className="sm:col-span-9 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Logo Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png or /uploads/logo.png"
                        value={companyForm.logo_url}
                        onChange={e => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                      />
                      <label className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 shadow-xs">
                        <span>{isUploadingLogo ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Logo Brand Name / Acronym (e.g. ITD)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITD"
                  value={companyForm.logo_name}
                  onChange={e => setCompanyForm({ ...companyForm, logo_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.company_name}
                  onChange={e => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-Slogan Title
                </label>
                <input
                  type="text"
                  value={companyForm.company_slogan}
                  onChange={e => setCompanyForm({ ...companyForm, company_slogan: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hero Tagline Slogan (Main Homepage Subtitle)
              </label>
              <textarea
                rows={2}
                required
                value={companyForm.company_tagline}
                onChange={e => setCompanyForm({ ...companyForm, company_tagline: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mission Statement</span>
                </label>
                <textarea
                  rows={3}
                  value={companyForm.mission_statement}
                  onChange={e => setCompanyForm({ ...companyForm, mission_statement: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Vision Statement</span>
                </label>
                <textarea
                  rows={3}
                  value={companyForm.vision_statement}
                  onChange={e => setCompanyForm({ ...companyForm, vision_statement: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Global Page Section Titles & Descriptions */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                📝 Global Page Section Headings & Descriptions
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Services Section */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wider">Services Section</span>
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={companyForm.services_section_title}
                    onChange={e => setCompanyForm({ ...companyForm, services_section_title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Section Description"
                    value={companyForm.services_section_desc}
                    onChange={e => setCompanyForm({ ...companyForm, services_section_desc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Projects Showcase Section */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block uppercase tracking-wider">Projects Catalog Section</span>
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={companyForm.projects_section_title}
                    onChange={e => setCompanyForm({ ...companyForm, projects_section_title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Section Description"
                    value={companyForm.projects_section_desc}
                    onChange={e => setCompanyForm({ ...companyForm, projects_section_desc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Team Section */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">Team & Architects Section</span>
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={companyForm.team_section_title}
                    onChange={e => setCompanyForm({ ...companyForm, team_section_title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Section Description"
                    value={companyForm.team_section_desc}
                    onChange={e => setCompanyForm({ ...companyForm, team_section_desc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Contact CTA Section */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block uppercase tracking-wider">Contact CTA Section</span>
                  <input
                    type="text"
                    placeholder="Section Title"
                    value={companyForm.contact_cta_title}
                    onChange={e => setCompanyForm({ ...companyForm, contact_cta_title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Section Description"
                    value={companyForm.contact_cta_desc}
                    onChange={e => setCompanyForm({ ...companyForm, contact_cta_desc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Live Stats Counters Inputs */}
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                📊 Live Homepage Stats Counters
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Delivered Systems</label>
                  <input
                    type="text"
                    value={companyForm.stats_projects_completed}
                    onChange={e => setCompanyForm({ ...companyForm, stats_projects_completed: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Active Ongoing</label>
                  <input
                    type="text"
                    value={companyForm.stats_projects_ongoing}
                    onChange={e => setCompanyForm({ ...companyForm, stats_projects_ongoing: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Global Clients</label>
                  <input
                    type="text"
                    value={companyForm.stats_clients_served}
                    onChange={e => setCompanyForm({ ...companyForm, stats_clients_served: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Satisfaction SLA %</label>
                  <input
                    type="text"
                    value={companyForm.stats_client_satisfaction}
                    onChange={e => setCompanyForm({ ...companyForm, stats_client_satisfaction: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Social Links & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={companyForm.primary_email}
                  onChange={e => setCompanyForm({ ...companyForm, primary_email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={companyForm.phone_number}
                  onChange={e => setCompanyForm({ ...companyForm, phone_number: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Office Address</span>
                </label>
                <input
                  type="text"
                  value={companyForm.office_address}
                  onChange={e => setCompanyForm({ ...companyForm, office_address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingCompanyProfile(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCompanyProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingCompanyProfile ? 'Saving Settings...' : 'Save Global Profile & Tagline'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                {settings.company_slogan || 'Technical Intelligence Directorate'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
                {settings.company_name || 'Technical Intelligence Directorate'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic max-w-3xl leading-relaxed">
                "{settings.company_tagline || 'We architect, build, and scale mission-critical software, generative AI pipelines, and cloud platforms for forward-thinking organizations worldwide.'}"
              </p>
            </div>

            {/* Quick Stat Pill Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Delivered Systems</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{settings.stats_projects_completed || '48+'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Active Ongoing</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{settings.stats_projects_ongoing || '12'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Global Clients</span>
                <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">{settings.stats_clients_served || '35+'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Client SLA</span>
                <span className="text-base font-extrabold text-amber-500">{settings.stats_client_satisfaction || '99.4%'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK CONTENT EDIT TOOLBAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-indigo-500" />
          <span>Quick Content Editor Shortcuts:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/projects')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
          >
            ✏️ Edit Projects ({kpis.totalProjects})
          </button>
          <button
            onClick={() => onNavigate('/admin/services')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
          >
            ✏️ Edit Services ({kpis.totalServices})
          </button>
          <button
            onClick={() => onNavigate('/admin/team')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
          >
            ✏️ Edit Team ({kpis.totalTeam})
          </button>
          <button
            onClick={() => onNavigate('/admin/blogs')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 transition-colors"
          >
            ✏️ Edit Articles ({kpis.totalBlogs})
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div
          onClick={() => onNavigate('/admin/projects')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 cursor-pointer transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
              {kpis.totalProjects}
            </div>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:underline">
              {kpis.featuredProjects} Featured on Homepage →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Projects */}
        <div
          onClick={() => onNavigate('/admin/projects')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Projects</span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-sans">
              {kpis.completedProjects}
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-emerald-400">
              {kpis.totalProjects > 0 ? Math.round((kpis.completedProjects / kpis.totalProjects) * 100) : 0}% of Total Portfolio
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Ongoing Projects */}
        <div
          onClick={() => onNavigate('/admin/projects')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/50 cursor-pointer transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Ongoing</span>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-sans">
              {kpis.ongoingProjects}
            </div>
            <span className="text-[11px] text-slate-400">
              +{kpis.upcomingProjects} Upcoming Scheduled
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Inquiries & Visitors */}
        <div
          onClick={() => onNavigate('/admin/inquiries')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-cyan-500/50 cursor-pointer transition-all flex items-start justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Inquiries</span>
            <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-sans">
              {kpis.totalInquiries}
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold group-hover:underline">
              {kpis.newInquiries} New Unread Messages →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* EDITABLE FEATURED PROJECTS DIRECT DASHBOARD SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Direct Editable Featured Homepage Projects</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle homepage visibility, edit lifecycle status, or jump into full project editor directly from this dashboard table.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/admin/projects')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            All Projects ({kpis.totalProjects}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Project Title</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Lifecycle Status</th>
                <th className="py-2.5 px-3 text-center">Featured State</th>
                <th className="py-2.5 px-3 text-right">Quick Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {featuredProjects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{proj.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">/{proj.slug}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {proj.client_name || 'N/A'}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={proj.status}
                      disabled={isUpdatingId === proj.id}
                      onChange={e => handleChangeProjectStatus(proj, e.target.value as any)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggleProjectFeatured(proj)}
                      disabled={isUpdatingId === proj.id}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                        proj.is_featured
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${proj.is_featured ? 'fill-amber-400' : ''}`} />
                      <span>{proj.is_featured ? 'Featured' : 'Not Featured'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate(`/admin/projects/${proj.id}`)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Full Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDITABLE RECENT INQUIRIES QUEUE DIRECT DASHBOARD SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              <span>Direct Editable Incoming Inquiry Queue</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update client inquiry status directly from your dashboard without leaving the page.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/admin/inquiries')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            All Inquiries ({kpis.totalInquiries}) →
          </button>
        </div>

        <div className="space-y-3">
          {recentInquiries.length > 0 ? (
            recentInquiries.map(inq => (
              <div
                key={inq.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">{inq.full_name}</span>
                    <span className="text-slate-400 font-mono">({inq.email})</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                      {inq.subject_category || 'General Inquiry'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                    "{inq.message}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono mr-2">Status:</span>
                  <select
                    value={inq.status}
                    onChange={e => handleChangeInquiryStatus(inq.id, e.target.value as any)}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-hidden"
                  >
                    <option value="New">🟡 New</option>
                    <option value="In Progress">🔵 In Progress</option>
                    <option value="Resolved">🟢 Resolved</option>
                    <option value="Archived">⚪ Archived</option>
                  </select>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No incoming client inquiries yet.</p>
          )}
        </div>
      </div>

      {/* Visual Analytics & Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project Status Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
              Projects by Lifecycle Status
            </h3>
            <span className="text-xs text-slate-400 font-mono">100% Tracked</span>
          </div>

          {/* Custom Status Progress Bars */}
          <div className="space-y-4">
            {charts.statusDistribution.map((item, idx) => {
              const pct = kpis.totalProjects > 0 ? Math.round((item.count / kpis.totalProjects) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-slate-500 font-mono">{item.count} projects ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Active Services: <strong>{kpis.totalServices}</strong></span>
            <span>Total Team: <strong>{kpis.totalTeam}</strong></span>
            <span>Articles: <strong>{kpis.totalBlogs}</strong></span>
          </div>
        </div>

        {/* Top Technologies Frequency (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
              Technology Stack Adoption in Showcase
            </h3>
            <button
              onClick={() => onNavigate('/admin/technologies')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Stack →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {charts.techDistribution.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1"
              >
                <span className="text-[10px] text-slate-400 font-mono block truncate">{t.category}</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.name}</div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {t.count} {t.count === 1 ? 'project' : 'projects'}
                </div>
              </div>
            ))}
          </div>

          {/* Quick CMS Shortcuts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onNavigate('/admin/services')}
              className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-500 mb-1" />
              Manage Services
            </button>
            <button
              onClick={() => onNavigate('/admin/blogs')}
              className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500 mb-1" />
              Manage Blog
            </button>
            <button
              onClick={() => onNavigate('/admin/settings')}
              className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-indigo-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-500 mb-1" />
              Website Settings
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Trail */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Recent Activity Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Operations</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 8).map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 dark:text-white">{log.user_name}</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{log.action}:</span>
                    <span className="text-slate-600 dark:text-slate-300 ml-1 truncate">{log.target_name}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4">No recent activity logged.</p>
          )}
        </div>
      </div>
    </div>
  );
};
