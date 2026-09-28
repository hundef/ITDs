-- PostgreSQL Schema for ITD Portfolio CMS

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  avatar VARCHAR(500),
  title VARCHAR(255),
  department VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  location VARCHAR(255),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  twitter_url VARCHAR(500),
  skills TEXT[],
  custom_permissions TEXT[],
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  two_factor_recovery_codes TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  locked_until TIMESTAMP,
  failed_login_attempts INT DEFAULT 0,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  last_password_change TIMESTAMP,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Categories Table
CREATE TABLE IF NOT EXISTS project_categories (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technologies Table
CREATE TABLE IF NOT EXISTS technologies (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255),
  color VARCHAR(50),
  icon VARCHAR(255),
  proficiency_level VARCHAR(50),
  years_experience INT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id BIGINT REFERENCES project_categories(id),
  created_by BIGINT REFERENCES users(id),
  client_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Ongoing',
  is_featured INT DEFAULT 0,
  is_published INT DEFAULT 1,
  priority INT DEFAULT 10,
  start_date DATE,
  completion_date DATE,
  cover_image VARCHAR(500),
  description TEXT,
  short_description TEXT NOT NULL,
  full_description TEXT,
  purpose TEXT,
  what_it_does TEXT,
  problems_solved TEXT,
  title_overview VARCHAR(255),
  title_problems VARCHAR(255),
  title_solution VARCHAR(255),
  title_features VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Technologies Junction Table
CREATE TABLE IF NOT EXISTS project_technologies (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id BIGINT NOT NULL REFERENCES technologies(id),
  proficiency_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Features Table
CREATE TABLE IF NOT EXISTS project_features (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Workflows Table
CREATE TABLE IF NOT EXISTS project_workflows (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number INT,
  title VARCHAR(255),
  description TEXT,
  duration VARCHAR(100),
  icon VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Results Table
CREATE TABLE IF NOT EXISTS project_results (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric_label VARCHAR(255),
  metric_value VARCHAR(255),
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Media Table
CREATE TABLE IF NOT EXISTS project_media (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type VARCHAR(50) DEFAULT 'image',
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Links Table
CREATE TABLE IF NOT EXISTS project_links (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  link_type VARCHAR(50),
  url VARCHAR(500) NOT NULL,
  label VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Custom Technologies Table
CREATE TABLE IF NOT EXISTS project_custom_technologies (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255),
  category VARCHAR(255),
  color VARCHAR(50),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(255),
  short_description TEXT,
  full_description TEXT,
  features_json TEXT,
  methodology_json TEXT,
  display_order INT DEFAULT 0,
  is_active INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  department VARCHAR(255) REFERENCES departments(name),
  title VARCHAR(255),
  bio TEXT,
  avatar VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(20),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  twitter_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_leadership INT DEFAULT 0,
  is_active INT DEFAULT 1,
  is_visible INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGINT PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id),
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255),
  author_company VARCHAR(255),
  author_avatar VARCHAR(500),
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  is_featured INT DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  author_id BIGINT REFERENCES users(id),
  summary TEXT,
  content TEXT,
  cover_image VARCHAR(500),
  category VARCHAR(255),
  tags_json TEXT,
  read_time VARCHAR(50),
  published_at TIMESTAMP,
  view_count INT DEFAULT 0,
  is_published INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject_category VARCHAR(255),
  message TEXT NOT NULL,
  company VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
  id BIGINT PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  data_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT PRIMARY KEY,
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(255),
  target_type VARCHAR(255),
  target_name VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
  id BIGINT PRIMARY KEY,
  user_id BIGINT,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  event_type VARCHAR(100),
  severity VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Policy Table
CREATE TABLE IF NOT EXISTS security_policy (
  id BIGINT PRIMARY KEY,
  max_failed_attempts INT DEFAULT 5,
  lockout_duration_minutes INT DEFAULT 15,
  session_timeout_hours INT DEFAULT 168,
  require_2fa_for_admins BOOLEAN DEFAULT false,
  password_min_length INT DEFAULT 8,
  password_require_special BOOLEAN DEFAULT true,
  password_require_number BOOLEAN DEFAULT true,
  password_expiry_days INT DEFAULT 90,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_project ON testimonials(project_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON security_logs(created_at);



