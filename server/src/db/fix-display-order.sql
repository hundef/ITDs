-- Fix missing display_order columns in project-related tables

-- Add display_order to project_features if missing
ALTER TABLE project_features 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add display_order to project_workflows if missing
ALTER TABLE project_workflows 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add display_order to project_results if missing
ALTER TABLE project_results 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add display_order to project_media if missing
ALTER TABLE project_media 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add display_order to project_links if missing
ALTER TABLE project_links 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add display_order to project_custom_technologies if missing
ALTER TABLE project_custom_technologies 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Ensure project_brochures table exists with proper schema
CREATE TABLE IF NOT EXISTS project_brochures (
  id BIGINT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL DEFAULT 'pdf',
  file_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  title VARCHAR(255),
  description TEXT,
  file_size_mb DECIMAL(10,2),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for project_brochures if not exists
CREATE INDEX IF NOT EXISTS idx_project_brochures_project ON project_brochures(project_id);
