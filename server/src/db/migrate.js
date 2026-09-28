import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initializeDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON database
function loadJsonDatabase() {
  const jsonPath = path.resolve(__dirname, '../../data/database.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  return jsonData;
}

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from JSON to PostgreSQL...\n');

    // Initialize database schema
    console.log('📋 Initializing database schema...');
    await initializeDatabase();

    // Load JSON data
    console.log('📂 Loading JSON database...');
    const jsonData = loadJsonDatabase();

    // Migrate users
    if (jsonData.users && jsonData.users.length > 0) {
      console.log(`👥 Migrating ${jsonData.users.length} users...`);
      await db.bulkInsert('users', jsonData.users);
    }

    // Migrate project categories
    if (jsonData.project_categories && jsonData.project_categories.length > 0) {
      console.log(`📁 Migrating ${jsonData.project_categories.length} project categories...`);
      await db.bulkInsert('project_categories', jsonData.project_categories);
    }

    // Migrate technologies
    if (jsonData.technologies && jsonData.technologies.length > 0) {
      console.log(`🔧 Migrating ${jsonData.technologies.length} technologies...`);
      await db.bulkInsert('technologies', jsonData.technologies);
    }

    // Migrate projects
    if (jsonData.projects && jsonData.projects.length > 0) {
      console.log(`📈 Migrating ${jsonData.projects.length} projects...`);
      const categories = jsonData.project_categories || [];
      const validCategoryIds = new Set(categories.map(c => c.id));
      
      const sanitizedProjects = jsonData.projects.map(p => ({
        ...p,
        start_date: p.start_date && p.start_date.trim() ? p.start_date : null,
        completion_date: p.completion_date && p.completion_date.trim() ? p.completion_date : null,
        category_id: p.category_id && validCategoryIds.has(p.category_id) ? p.category_id : null
      }));
      await db.bulkInsert('projects', sanitizedProjects);
    }

    // Migrate project technologies (only needed fields)
    if (jsonData.project_technologies && jsonData.project_technologies.length > 0) {
      console.log(`🔗 Migrating ${jsonData.project_technologies.length} project technology relationships...`);
      // Remove duplicates by keeping first occurrence
      const seen = new Set();
      const sanitized = jsonData.project_technologies
        .filter(pt => {
          if (seen.has(pt.id)) return false;
          seen.add(pt.id);
          return true;
        })
        .map(pt => ({
          id: pt.id,
          project_id: pt.project_id,
          technology_id: pt.technology_id,
          proficiency_level: pt.proficiency_level || null,
          created_at: pt.created_at
        }));
      await db.bulkInsert('project_technologies', sanitized);
    }

    // Migrate project features
    if (jsonData.project_features && jsonData.project_features.length > 0) {
      console.log(`✨ Migrating ${jsonData.project_features.length} project features...`);
      await db.bulkInsert('project_features', jsonData.project_features);
    }

    // Migrate project workflows
    if (jsonData.project_workflows && jsonData.project_workflows.length > 0) {
      console.log(`⚙️  Migrating ${jsonData.project_workflows.length} project workflows...`);
      const sanitized = jsonData.project_workflows.map(pw => ({
        id: pw.id,
        project_id: pw.project_id,
        step_number: pw.step_number,
        title: pw.title,
        description: pw.description,
        duration: pw.duration,
        icon: pw.icon,
        display_order: pw.display_order,
        created_at: pw.created_at,
        updated_at: pw.updated_at
      }));
      await db.bulkInsert('project_workflows', sanitized);
    }

    // Migrate project results
    if (jsonData.project_results && jsonData.project_results.length > 0) {
      console.log(`📊 Migrating ${jsonData.project_results.length} project results...`);
      await db.bulkInsert('project_results', jsonData.project_results);
    }

    // Migrate project media
    if (jsonData.project_media && jsonData.project_media.length > 0) {
      console.log(`📸 Migrating ${jsonData.project_media.length} project media files...`);
      await db.bulkInsert('project_media', jsonData.project_media);
    }

    // Migrate project links
    if (jsonData.project_links && jsonData.project_links.length > 0) {
      console.log(`🔗 Migrating ${jsonData.project_links.length} project links...`);
      await db.bulkInsert('project_links', jsonData.project_links);
    }

    // Migrate project custom technologies
    if (jsonData.project_custom_technologies && jsonData.project_custom_technologies.length > 0) {
      console.log(`🛠️  Migrating ${jsonData.project_custom_technologies.length} custom technologies...`);
      await db.bulkInsert('project_custom_technologies', jsonData.project_custom_technologies);
    }

    // Migrate services
    if (jsonData.services && jsonData.services.length > 0) {
      console.log(`📋 Migrating ${jsonData.services.length} services...`);
      await db.bulkInsert('services', jsonData.services);
    }

    // Migrate team members
    if (jsonData.team_members && jsonData.team_members.length > 0) {
      console.log(`👨‍💼 Migrating ${jsonData.team_members.length} team members...`);
      const sanitized = jsonData.team_members.map(tm => ({
        id: tm.id,
        name: tm.name,
        role: tm.role,
        department: tm.department,
        title: tm.title,
        bio: tm.bio,
        avatar: tm.avatar,
        email: tm.email,
        phone: tm.phone,
        linkedin_url: tm.linkedin_url,
        github_url: tm.github_url,
        twitter_url: tm.twitter_url,
        display_order: tm.display_order,
        is_active: tm.is_active || 1,
        created_at: tm.created_at,
        updated_at: tm.updated_at
      }));
      await db.bulkInsert('team_members', sanitized);
    }

    // Migrate testimonials
    if (jsonData.testimonials && jsonData.testimonials.length > 0) {
      console.log(`⭐ Migrating ${jsonData.testimonials.length} testimonials...`);
      const sanitized = jsonData.testimonials
        .filter(t => t.author_name) // Filter out NULL author_name
        .map(t => ({
          id: t.id,
          project_id: t.project_id || null,
          author_name: t.author_name,
          author_role: t.author_role,
          author_company: t.author_company,
          author_avatar: t.author_avatar,
          content: t.content,
          rating: t.rating,
          is_featured: t.is_featured || 1,
          display_order: t.display_order,
          created_at: t.created_at,
          updated_at: t.updated_at
        }));
      if (sanitized.length > 0) {
        await db.bulkInsert('testimonials', sanitized);
      }
    }

    // Migrate blog posts
    if (jsonData.blog_posts && jsonData.blog_posts.length > 0) {
      console.log(`📝 Migrating ${jsonData.blog_posts.length} blog posts...`);
      const sanitized = jsonData.blog_posts.map(bp => ({
        id: bp.id,
        title: bp.title,
        slug: bp.slug,
        content: bp.content,
        summary: bp.summary || bp.excerpt || '',
        author_id: bp.author_id || null,
        cover_image: bp.cover_image || bp.featured_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        category: bp.category || '',
        tags_json: bp.tags_json ? (typeof bp.tags_json === 'string' ? bp.tags_json : JSON.stringify(bp.tags_json)) : (bp.tags ? JSON.stringify(bp.tags) : '[]'),
        read_time: bp.read_time || '5 min read',
        is_published: bp.is_published || 1,
        published_at: bp.published_at,
        created_at: bp.created_at,
        updated_at: bp.updated_at
      }));
      if (sanitized.length > 0) {
        await db.bulkInsert('blog_posts', sanitized);
      }
    }

    // Migrate contact inquiries
    if (jsonData.contact_inquiries && jsonData.contact_inquiries.length > 0) {
      console.log(`📧 Migrating ${jsonData.contact_inquiries.length} contact inquiries...`);
      const sanitized = jsonData.contact_inquiries
        .filter(ci => ci.name && ci.email && ci.message) // Filter out incomplete records
        .map(ci => ({
          id: ci.id,
          full_name: ci.name || ci.full_name,
          email: ci.email,
          phone: ci.phone || '',
          subject_category: ci.subject || ci.subject_category || 'General Inquiry',
          message: ci.message,
          company: ci.company || '',
          notes: ci.notes || '',
          status: ci.status || 'New',
          created_at: ci.created_at,
          updated_at: ci.updated_at
        }));
      if (sanitized.length > 0) {
        await db.bulkInsert('contact_inquiries', sanitized);
      }
    }

    // Migrate website settings
    if (jsonData.website_settings && Object.keys(jsonData.website_settings).length > 0) {
      console.log(`⚙️  Migrating website settings...`);
      const settings = Object.entries(jsonData.website_settings).map(([key, value], index) => ({
        id: (index + 1),
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        data_type: typeof value
      }));
      // Only insert specific settings, skip IDs
      for (const setting of settings) {
        await db.query(
          'INSERT INTO website_settings (id, key, value, data_type) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING',
          [setting.id, setting.key, setting.value, setting.data_type]
        );
      }
    }

    // Migrate activity logs
    if (jsonData.activity_logs && jsonData.activity_logs.length > 0) {
      console.log(`📋 Migrating ${jsonData.activity_logs.length} activity logs...`);
      const sanitized = jsonData.activity_logs.map(al => ({
        id: al.id,
        user_name: al.user_name,
        user_role: al.user_role,
        action: al.action,
        target_type: al.target_type,
        target_name: al.target_name,
        ip_address: al.ip_address,
        user_agent: al.user_agent,
        details: al.details,
        created_at: al.created_at
      }));
      await db.bulkInsert('activity_logs', sanitized);
    }

    // Migrate security logs
    if (jsonData.security_logs && jsonData.security_logs.length > 0) {
      console.log(`🔒 Migrating ${jsonData.security_logs.length} security logs...`);
      const sanitized = jsonData.security_logs.map(sl => ({
        id: sl.id,
        user_id: sl.user_id,
        user_name: sl.user_name,
        user_email: sl.user_email,
        event_type: sl.event_type,
        severity: sl.severity,
        ip_address: sl.ip_address,
        user_agent: sl.user_agent,
        details: sl.details,
        created_at: sl.created_at
      }));
      await db.bulkInsert('security_logs', sanitized);
    }

    // Migrate security policy
    if (jsonData.security_policy) {
      console.log(`🔐 Migrating security policy...`);
      await db.query(
        'INSERT INTO security_policy (id, max_failed_attempts, lockout_duration_minutes, session_timeout_hours, require_2fa_for_admins, password_min_length, password_require_special, password_require_number, password_expiry_days) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [
          1,
          jsonData.security_policy.max_failed_attempts || 5,
          jsonData.security_policy.lockout_duration_minutes || 15,
          jsonData.security_policy.session_timeout_hours || 168,
          jsonData.security_policy.require_2fa_for_admins || false,
          jsonData.security_policy.password_min_length || 8,
          jsonData.security_policy.password_require_special || true,
          jsonData.security_policy.password_require_number || true,
          jsonData.security_policy.password_expiry_days || 90
        ]
      );
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 All data has been migrated from JSON to PostgreSQL.');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run migration
migrateData();
