-- Add Project Brochures Table for storing project brochures (PDF, images, etc.)
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

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_project_brochures_project ON project_brochures(project_id);
