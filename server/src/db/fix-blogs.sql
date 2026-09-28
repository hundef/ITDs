-- Blog Posts Table
CREATE TABLE blog_posts (
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

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
