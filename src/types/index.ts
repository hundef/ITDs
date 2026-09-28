export type UserRole = 'super_admin' | 'administrator' | 'project_manager' | 'content_manager' | 'viewer';
export type UserStatus = 'active' | 'suspended' | 'locked';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  department?: string;
  avatar?: string;
  status?: UserStatus;
  custom_permissions?: string[];
  two_factor_enabled?: boolean;
  failed_login_attempts?: number;
  locked_until?: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  last_password_change?: string | null;
  must_change_password?: boolean;
  phone?: string;
  bio?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  skills?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SecurityLog {
  id: number;
  user_id?: number | null;
  user_name: string;
  user_email: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical' | 'alert';
  ip_address: string;
  user_agent: string;
  details: string;
  created_at: string;
}

export interface SecurityPolicy {
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_hours: number;
  require_2fa_for_admins: boolean;
  password_min_length: number;
  password_require_special: boolean;
  password_require_number: boolean;
  password_expiry_days: number;
}

export interface SecurityStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  lockedUsers: number;
  twoFactorCount: number;
  twoFactorPercentage: number;
  failedLogins24h: number;
  recentAlerts: number;
}

export interface PermissionDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
}


export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  project_count?: number;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  category: string;
  icon: string;
  color: string;
  project_count?: number;
}

export interface ProjectCustomTechnology {
  id?: number;
  project_id?: number;
  name: string;
  category: string;
  color: string;
  display_order?: number;
}

export interface ProjectFeature {
  id?: number;
  project_id?: number;
  title: string;
  description: string;
  icon: string;
  display_order?: number;
}

export interface ProjectWorkflow {
  id?: number;
  project_id?: number;
  step_number: number;
  title: string;
  description: string;
  actor: string;
  icon: string;
  display_order?: number;
}

export interface ProjectResult {
  id?: number;
  project_id?: number;
  metric_label: string;
  metric_value: string;
  description: string;
  display_order?: number;
}

export interface ProjectMedia {
  id?: number;
  project_id?: number;
  media_type: 'image' | 'video' | 'document';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  display_order?: number;
}

export interface ProjectLink {
  id?: number;
  project_id?: number;
  link_type: 'live_demo' | 'website' | 'github' | 'documentation' | 'video' | 'other';
  url: string;
  label: string;
  display_order?: number;
}

export interface ProjectBrochure {
  id?: number;
  project_id?: number;
  file_type: 'pdf' | 'image' | 'document';
  file_url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  file_size_mb?: number;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type ProjectStatus = 'Completed' | 'Ongoing' | 'Upcoming' | 'On Hold';

export interface Project {
  id: number;
  name: string;
  slug: string;
  category_id?: number | null;
  created_by?: number;
  client_name?: string;
  status: ProjectStatus;
  is_featured: number | boolean;
  is_published: number | boolean;
  priority: number;
  start_date?: string;
  completion_date?: string | null;
  cover_image: string;
  short_description: string;
  full_description: string;
  purpose?: string;
  what_it_does?: string;
  problems_solved?: string;
  title_overview?: string;
  title_problems?: string;
  title_solution?: string;
  title_features?: string;
  category?: ProjectCategory;
  technologies?: Technology[];
  custom_technologies?: ProjectCustomTechnology[];
  features?: ProjectFeature[];
  workflows?: ProjectWorkflow[];
  results?: ProjectResult[];
  media?: ProjectMedia[];
  links?: ProjectLink[];
  brochures?: ProjectBrochure[];
  created_at?: string;
  updated_at?: string;
}

export interface ServiceMethodologyStep {
  step: number;
  title: string;
  description: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon: string;
  short_description: string;
  full_description: string;
  features_json?: string;
  methodology_json?: string;
  features?: string[];
  methodology?: ServiceMethodologyStep[];
  display_order: number;
  is_active: number | boolean;
  relatedProjects?: Partial<Project>[];
  created_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  email: string;
  linkedin_url?: string;
  github_url?: string;
  display_order: number;
  is_leadership: number | boolean;
  is_visible: number | boolean;
}

export interface Testimonial {
  id: number | string;
  client_name?: string;
  author_name?: string;
  client_role?: string;
  author_role?: string;
  client_company?: string;
  author_company?: string;
  avatar?: string;
  author_avatar?: string;
  content: string;
  rating: number;
  project_id?: number | null;
  project_name?: string | null;
  project_slug?: string | null;
  is_featured: number | boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image: string;
  tags_json?: string;
  tags?: string[];
  read_time: string;
  is_published: number | boolean;
  published_at: string;
  created_at?: string;
}

export type InquiryStatus = 'New' | 'In Progress' | 'Resolved' | 'Archived';

export interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  subject_category: string;
  message: string;
  status: InquiryStatus;
  notes?: string;
  created_at: string;
}

export type Inquiry = ContactInquiry;

export interface CoreValue {
  title: string;
  description: string;
}

export interface Insight {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order?: number;
}

export interface WebsiteSettings {
  company_name?: string;
  logo_name?: string;
  company_slogan?: string;
  company_tagline?: string;
  logo_url?: string;
  founded_year?: string;
  stats_projects_completed?: string;
  stats_projects_ongoing?: string;
  stats_clients_served?: string;
  stats_years_experience?: string;
  stats_team_members?: string;
  stats_client_satisfaction?: string;
  primary_email?: string;
  support_email?: string;
  phone_number?: string;
  office_address?: string;
  secondary_office?: string;
  business_hours?: string;
  twitter_url?: string;
  linkedin_url?: string;
  github_url?: string;
  youtube_url?: string;
  mission_statement?: string;
  vision_statement?: string;
  core_values?: CoreValue[];
  about_hero_badge?: string;
  about_hero_title?: string;
  about_hero_subtitle?: string;
  hero_badge_text?: string;
  hero_badge_subtext?: string;
  hero_title?: string;
  services_section_title?: string;
  services_section_desc?: string;
  projects_section_title?: string;
  projects_section_desc?: string;
  featured_section_title?: string;
  featured_section_desc?: string;
  team_badge_text?: string;
  team_section_title?: string;
  team_section_desc?: string;
  blog_badge_text?: string;
  blog_section_title?: string;
  blog_section_desc?: string;
  core_values_section_title?: string;
  core_values_section_desc?: string;
  milestones_section_title?: string;
  milestones_section_desc?: string;
  milestones_json?: string;
  milestones_timeline_color?: string;
  leadership_section_title?: string;
  leadership_section_desc?: string;
  featured_badge_text?: string;
  projects_badge_text?: string;
  testimonials_badge_text?: string;
  testimonials_section_title?: string;
  testimonials_section_desc?: string;
  services_tier_label?: string;
  contact_page_title?: string;
  contact_card_heading?: string;
  contact_email_label?: string;
  contact_email_sla?: string;
  contact_phone_label?: string;
  contact_phone_hours?: string;
  contact_address_label?: string;
  contact_cta_title?: string;
  contact_cta_desc?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  insights_badge_text?: string;
  insights_section_title?: string;
  insights_section_desc?: string;
  insights_json?: string;
  insights?: Insight[];
}

export interface ActivityLog {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  target_type: string;
  target_name: string;
  created_at: string;
}

export interface DashboardKPIs {
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  upcomingProjects: number;
  onHoldProjects: number;
  featuredProjects: number;
  totalServices: number;
  totalTeam: number;
  totalBlogs: number;
  totalInquiries: number;
  newInquiries: number;
  estimatedMonthlyVisitors: string;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  charts: {
    statusDistribution: { name: string; count: number; color: string }[];
    categoryDistribution: { name: string; count: number; color: string }[];
    techDistribution: { name: string; count: number; category: string; color: string }[];
    monthlyTrend: { month: string; projects: number; inquiries: number; releases: number }[];
  };
  recentActivity: ActivityLog[];
}
