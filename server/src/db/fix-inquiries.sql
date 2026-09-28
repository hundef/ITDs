-- Contact Inquiries Table
CREATE TABLE contact_inquiries (
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
