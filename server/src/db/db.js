import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'itd_portfolio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// JSON Database fallback
let jsonData = null;
const dbPath = path.join(__dirname, '../../data/database.json');

function loadJsonDatabase() {
  try {
    const content = fs.readFileSync(dbPath, 'utf8');
    jsonData = JSON.parse(content);
    console.log('✅ JSON database loaded from', dbPath);
    return true;
  } catch (err) {
    console.warn('⚠️  Could not load JSON database:', err.message);
    return false;
  }
}

function saveJsonDatabase() {
  try {
    if (jsonData) {
      fs.writeFileSync(dbPath, JSON.stringify(jsonData, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('⚠️  Could not save JSON database:', err.message);
  }
}

// Helper function to evaluate WHERE clauses for JSON filtering
function evaluateWhereClause(record, whereClause, params = []) {
  if (!whereClause || whereClause.trim() === '' || whereClause === '1=1') return true;
  try {
    const andParts = whereClause.split(/\s+AND\s+/i);
    for (const part of andParts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed === '1=1') continue;

      // Handle: LOWER(col) = LOWER($N)
      const lowerMatch = trimmed.match(/LOWER\(([a-zA-Z0-9_]+)\)\s*=\s*LOWER\(\$(\d+)\)/i);
      if (lowerMatch) {
        const col = lowerMatch[1];
        const paramIdx = parseInt(lowerMatch[2]) - 1;
        if (String(record[col] || '').toLowerCase() !== String(params[paramIdx] || '').toLowerCase()) {
          return false;
        }
        continue;
      }

      // Handle: col != $N or col <> $N
      const neqMatch = trimmed.match(/([a-zA-Z0-9_]+)\s*(?:!=|<>)\s*\$(\d+)/);
      if (neqMatch) {
        const col = neqMatch[1];
        const paramIdx = parseInt(neqMatch[2]) - 1;
        if (record[col] == params[paramIdx]) {
          return false;
        }
        continue;
      }

      // Handle: col = $N
      const eqMatch = trimmed.match(/([a-zA-Z0-9_]+)\s*=\s*\$(\d+)/);
      if (eqMatch) {
        const col = eqMatch[1];
        const paramIdx = parseInt(eqMatch[2]) - 1;
        if (record[col] != params[paramIdx]) {
          return false;
        }
        continue;
      }

      // Handle literal string: col = 'val'
      const literalEqMatch = trimmed.match(/([a-zA-Z0-9_]+)\s*=\s*'([^']*)'/);
      if (literalEqMatch) {
        const col = literalEqMatch[1];
        const val = literalEqMatch[2];
        if (record[col] != val) {
          return false;
        }
        continue;
      }

      // Handle literal string: col != 'val'
      const literalNeqMatch = trimmed.match(/([a-zA-Z0-9_]+)\s*(?:!=|<>)\s*'([^']*)'/);
      if (literalNeqMatch) {
        const col = literalNeqMatch[1];
        const val = literalNeqMatch[2];
        if (record[col] == val) {
          return false;
        }
        continue;
      }
    }
    return true;
  } catch (e) {
    console.warn('WHERE clause evaluation error:', e.message);
    return true;
  }
}

// Database wrapper class
class DatabaseEngine {
  constructor() {
    this.pool = pool;
    this.useJson = false;
  }

  // Query execution wrapper with fallback to JSON
  async query(text, params = []) {
    // If this is a SELECT from users or any table, try PostgreSQL first
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}`);
      }
      this.useJson = false;
      return result.rows;
    } catch (err) {
      // Fallback to JSON if PostgreSQL fails
      if (!jsonData) loadJsonDatabase();
      if (jsonData) {
        this.useJson = true;
        
        // Extract table name from SELECT
        const tableMatch = text.match(/FROM\s+([a-zA-Z0-9_]+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'users';
        let results = Array.isArray(jsonData[tableName]) ? [...jsonData[tableName]] : [];
        
        let whereClause = '';
        const whereMatch = text.match(/WHERE\s+([\s\S]+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (whereMatch) {
          whereClause = whereMatch[1].trim();
          results = results.filter(record => evaluateWhereClause(record, whereClause, params));
        }
        
        // Handle LIMIT
        const limitMatch = text.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          results = results.slice(0, parseInt(limitMatch[1]));
        }
        
        return results;
      }
      throw err;
    }
  }

  // Single row query
  async queryOne(text, params = []) {
    const rows = await this.query(text, params);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  // Insert and return ID
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    try {
      return await this.queryOne(query, values);
    } catch (err) {
      if (!jsonData) loadJsonDatabase();
      if (jsonData) {
        if (!Array.isArray(jsonData[table])) {
          jsonData[table] = [];
        }
        const newRecord = { ...data };
        if (!newRecord.id) {
          newRecord.id = Math.floor(Date.now() * 1000 + Math.random() * 1000);
        }
        if (!newRecord.created_at) {
          newRecord.created_at = new Date().toISOString();
        }
        if (!newRecord.updated_at) {
          newRecord.updated_at = new Date().toISOString();
        }
        jsonData[table].push(newRecord);
        saveJsonDatabase();
        return newRecord;
      }
      throw err;
    }
  }

  // Update query
  async update(table, data, whereClause, whereParams = []) {
    // Try PostgreSQL first
    const keys = Object.keys(data).filter(k => k !== 'updated_at');
    const values = keys.map(k => data[k]);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const paramCount = keys.length;
    
    const renamedWhereClause = whereClause.replace(/\$(\d+)/g, (match, num) => {
      return `$${parseInt(num) + paramCount}`;
    });
    
    const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${renamedWhereClause} RETURNING *`;
    const allParams = [...values, ...whereParams];
    
    try {
      return await this.queryOne(query, allParams);
    } catch (err) {
      if (!jsonData) loadJsonDatabase();
      if (jsonData && Array.isArray(jsonData[table])) {
        for (let i = 0; i < jsonData[table].length; i++) {
          if (evaluateWhereClause(jsonData[table][i], whereClause, whereParams)) {
            jsonData[table][i] = {
              ...jsonData[table][i],
              ...data,
              updated_at: new Date().toISOString()
            };
            saveJsonDatabase();
            return jsonData[table][i];
          }
        }
        throw new Error(`Record not found for update in ${table}`);
      }
      throw err;
    }
  }

  // Delete query
  async delete(table, whereClause, whereParams = []) {
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    try {
      return await this.query(query, whereParams);
    } catch (err) {
      if (!jsonData) loadJsonDatabase();
      if (jsonData && Array.isArray(jsonData[table])) {
        const initialLen = jsonData[table].length;
        jsonData[table] = jsonData[table].filter(item => !evaluateWhereClause(item, whereClause, whereParams));
        if (jsonData[table].length !== initialLen) {
          saveJsonDatabase();
        }
        return jsonData[table];
      }
      throw err;
    }
  }

  // Find multiple records
  async find(table, whereClause = '', whereParams = [], orderBy = '', limit = null, offset = null) {
    let query = `SELECT * FROM ${table}`;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    if (offset !== null && offset !== undefined) {
      query += ` OFFSET ${offset}`;
    }
    
    return this.query(query, whereParams);
  }

  // Find one record
  async findOne(table, whereClause = '', whereParams = []) {
    let query = `SELECT * FROM ${table}`;
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    query += ` LIMIT 1`;
    return this.queryOne(query, whereParams);
  }

  // Count records
  async count(table, whereClause = '', whereParams = []) {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    const result = await this.queryOne(query, whereParams);
    return result?.count || 0;
  }

  // Bulk insert
  async bulkInsert(table, records) {
    if (records.length === 0) return [];
    
    const keys = Object.keys(records[0]);
    const placeholders = records.map((_, rowIdx) => {
      const placeholderList = keys.map((_, colIdx) => `$${rowIdx * keys.length + colIdx + 1}`).join(', ');
      return `(${placeholderList})`;
    }).join(', ');
    
    const values = records.flatMap(r => keys.map(k => r[k]));
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${placeholders} RETURNING *`;
    
    return this.query(query, values);
  }

  // Get security policy
  async getSecurityPolicy() {
    const policy = await this.queryOne('SELECT * FROM security_policy WHERE id = 1');
    return policy || {
      max_failed_attempts: 5,
      lockout_duration_minutes: 15,
      session_timeout_hours: 168,
      require_2fa_for_admins: false,
      password_min_length: 8,
      password_require_special: true,
      password_require_number: true,
      password_expiry_days: 90
    };
  }

  // Get all website settings
  async getAllSettings() {
    const settings = await this.find('website_settings');
    const result = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    return result;
  }

  // Set multiple settings
  async setMultipleSettings(settings) {
    const updates = {};
    for (const [key, value] of Object.entries(settings)) {
      // Generate unique BIGINT ID for new rows
      const id = Math.floor(Date.now() * 1000 + Math.random() * 1000);
      const dataType = typeof value === 'string' ? 'string' : 'json';
      const storedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      await this.query(
        'INSERT INTO website_settings (id, key, value, data_type, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value = $3, data_type = $4, updated_at = CURRENT_TIMESTAMP',
        [id, key, storedValue, dataType]
      );
      updates[key] = value;
    }
    return updates;
  }

  // Log activity
  async logActivity(userName, userRole, action, targetType, targetName) {
    return this.insert('activity_logs', {
      id: Math.floor(Date.now() * 1000 + Math.random() * 1000), // Generate unique BIGINT ID
      user_name: userName,
      user_role: userRole,
      action,
      target_type: targetType,
      target_name: targetName,
      ip_address: '127.0.0.1',
      user_agent: 'API',
      details: `${action}: ${targetName}`,
      created_at: new Date().toISOString()
    });
  }

  // Log security event
  async logSecurityEvent(userId, userName, userEmail, eventType, severity, ipAddress, userAgent, details) {
    return this.insert('security_logs', {
      id: Math.floor(Date.now() * 1000 + Math.random() * 1000), // Generate unique BIGINT ID
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      event_type: eventType,
      severity,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      created_at: new Date().toISOString()
    });
  }

  // Close connection pool
  async close() {
    await this.pool.end();
  }
}

export const db = new DatabaseEngine();

// Initialize database (create tables if they don't exist)
export async function initializeDatabase() {
  try {
    // Load JSON database as fallback
    loadJsonDatabase();
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute each one
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        await db.pool.query(statement);
      } catch (err) {
        // Schema may already exist, continue
        console.warn('⚠️  Schema statement failed (likely already exists):', err.message.substring(0, 100));
      }
    }
    
    console.log('✅ Database schema initialized successfully');
    
    // Apply any missing columns (for existing databases)
    await applyMigrations();
    
    // Seed demo users if they don't exist
    await seedDemoUsers();
  } catch (err) {
    console.error('❌ Error initializing database schema:', err.message);
    // Don't throw - allow app to start with JSON fallback
    console.warn('⚠️  Will use JSON database as fallback');
  }
}

async function applyMigrations() {
  try {
    console.log('🔧 Checking for missing database columns...');
    
    // Check and add missing columns in projects table
    const projectCols = await db.pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY column_name
    `);
    
    const existingProjectCols = projectCols.rows.map(r => r.column_name);
    console.log('📋 Existing columns in projects table:', existingProjectCols);
    
    const requiredProjectColumns = [
      { column: 'description', type: 'TEXT' },
      { column: 'created_by', type: 'BIGINT REFERENCES users(id)' },
      { column: 'short_description', type: 'TEXT NOT NULL DEFAULT \'\'' },
      { column: 'full_description', type: 'TEXT' },
      { column: 'cover_image', type: 'VARCHAR(500)' }
    ];
    
    for (const col of requiredProjectColumns) {
      if (!existingProjectCols.includes(col.column)) {
        try {
          await db.pool.query(`ALTER TABLE projects ADD COLUMN ${col.column} ${col.type}`);
          console.log(`✅ Added ${col.column} column to projects table`);
        } catch (addErr) {
          console.warn(`⚠️  Failed to add ${col.column}:`, addErr.message);
        }
      } else {
        console.log(`✓  Column ${col.column} already exists`);
      }
    }
    
    // Check and add missing columns in team_members table
    const teamCols = await db.pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'team_members'
      ORDER BY column_name
    `);
    
    const existingTeamCols = teamCols.rows.map(r => r.column_name);
    console.log('📋 Existing columns in team_members table:', existingTeamCols);
    
    const requiredTeamColumns = [
      { column: 'is_visible', type: 'INT DEFAULT 1' }
    ];
    
    for (const col of requiredTeamColumns) {
      if (!existingTeamCols.includes(col.column)) {
        try {
          await db.pool.query(`ALTER TABLE team_members ADD COLUMN ${col.column} ${col.type}`);
          console.log(`✅ Added ${col.column} column to team_members table`);
        } catch (addErr) {
          console.warn(`⚠️  Failed to add ${col.column}:`, addErr.message);
        }
      } else {
        console.log(`✓  Column ${col.column} already exists`);
      }
    }

    // Add display_order columns to project-related tables
    const projectRelatedTables = [
      'project_features',
      'project_workflows', 
      'project_results',
      'project_media',
      'project_links',
      'project_custom_technologies'
    ];

    for (const table of projectRelatedTables) {
      try {
        const cols = await db.pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = '${table}'
        `);
        const existingCols = cols.rows.map(r => r.column_name);
        
        if (!existingCols.includes('display_order')) {
          await db.pool.query(`ALTER TABLE ${table} ADD COLUMN display_order INT DEFAULT 0`);
          console.log(`✅ Added display_order column to ${table}`);
        } else {
          console.log(`✓  Column display_order already exists in ${table}`);
        }
      } catch (err) {
        console.warn(`⚠️  Failed to process ${table}:`, err.message);
      }
    }

    // Ensure project_brochures table exists
    try {
      const brochureCheck = await db.pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'project_brochures'
        )
      `);
      
      if (!brochureCheck.rows[0].exists) {
        console.log('📦 Creating project_brochures table...');
        await db.pool.query(`
          CREATE TABLE project_brochures (
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
          )
        `);
        
        // Create index
        await db.pool.query(`
          CREATE INDEX IF NOT EXISTS idx_project_brochures_project ON project_brochures(project_id)
        `);
        console.log('✅ Created project_brochures table with index');
      } else {
        console.log('✓  project_brochures table already exists');
        
        // Drop any invalid UNIQUE constraint on project_id
        try {
          await db.pool.query(`
            ALTER TABLE project_brochures 
            DROP CONSTRAINT IF EXISTS project_brochures_project_id_key
          `);
          console.log('  ✅ Removed invalid unique constraint on project_id');
        } catch (dropErr) {
          // It's okay if this fails - constraint might not exist
          console.log('  ℹ️  No unique constraint to remove');
        }
        
        // Check if columns exist and add them if missing
        try {
          // Get all columns in the table
          const columnsResult = await db.pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'project_brochures'
            ORDER BY ordinal_position
          `);
          
          const existingColumns = columnsResult.rows.map(r => r.column_name);
          console.log('  📋 Existing columns:', existingColumns);
          
          const requiredColumns = [
            { name: 'file_type', type: "VARCHAR(50) NOT NULL DEFAULT 'pdf'" },
            { name: 'file_url', type: 'VARCHAR(500) NOT NULL' },
            { name: 'thumbnail_url', type: 'VARCHAR(500)' },
            { name: 'title', type: 'VARCHAR(255)' },
            { name: 'description', type: 'TEXT' },
            { name: 'file_size_mb', type: 'DECIMAL(10,2)' },
            { name: 'display_order', type: 'INT DEFAULT 0' },
            { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
            { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
          ];
          
          for (const col of requiredColumns) {
            if (!existingColumns.includes(col.name)) {
              console.log(`  ➕ Adding ${col.name} column to project_brochures...`);
              await db.pool.query(`ALTER TABLE project_brochures ADD COLUMN ${col.name} ${col.type}`);
              console.log(`  ✅ Added ${col.name} column`);
            }
          }
        } catch (colErr) {
          console.warn('  ⚠️  Error checking/adding columns:', colErr.message);
        }
      }
    } catch (err) {
      console.warn('⚠️  Failed to ensure project_brochures table:', err.message);
    }
    
    console.log('✅ Migration check completed');
  } catch (err) {
    console.warn('⚠️  Migration check failed (non-fatal):', err.message);
    // Non-fatal, continue anyway
  }
}

async function seedDemoUsers() {
  try {
    // Check if demo users already exist
    const existingUsers = await db.find('users', '', [], '', null, null);
    if (existingUsers && existingUsers.length >= 3) {
      console.log('✅ Demo users already exist - preserving custom_permissions');
      // Do NOT reset custom_permissions - preserve admin's permission assignments
      return;
    }
    
    const bcrypt = await import('bcryptjs');
    const passwordHashAdmin = await bcrypt.default.hash('admin123', 10);
    const passwordHashPM = await bcrypt.default.hash('pm123', 10);
    const passwordHashViewer = await bcrypt.default.hash('viewer123', 10);
    
    console.log('🌱 Seeding demo users for each role...');
    
    // Check if each role demo user exists, if not create it
    const roles = [
      {
        role: 'super_admin',
        name: 'Tibebe Getachew',
        email: 'superadmin@insa.gov.et',
        password_hash: passwordHashAdmin,
        custom_permissions: ['projects.view']
      },
      {
        role: 'administrator',
        name: 'Elena Rostova',
        email: 'admin@nexora.io',
        password_hash: passwordHashAdmin,
        custom_permissions: ['security.audit', 'users.manage_security']
      },
      {
        role: 'project_manager',
        name: 'Israel',
        email: 'isru@insa.gov.et',
        password_hash: passwordHashPM,
        custom_permissions: ['projects.publish']
      },
      {
        role: 'content_manager',
        name: 'Melaku',
        email: 'mela@insa.gov.et',
        password_hash: passwordHashPM,
        custom_permissions: []
      }
    ];
    
    for (const roleUser of roles) {
      const existing = await db.findOne('users', 'email = $1', [roleUser.email]);
      if (!existing) {
        const userId = Math.floor(Date.now() * 1000 + Math.random() * 1000);
        await db.insert('users', {
          id: userId,
          name: roleUser.name,
          email: roleUser.email,
          password_hash: roleUser.password_hash,
          role: roleUser.role,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          title: roleUser.role === 'viewer' ? 'Viewer' : 'Staff Member',
          department: 'Engineering',
          status: 'active',
          custom_permissions: roleUser.custom_permissions,
          two_factor_enabled: false,
          failed_login_attempts: 0,
          locked_until: null,
          last_login_at: null,
          last_login_ip: null,
          last_password_change: new Date().toISOString(),
          must_change_password: false
        });
        console.log(`✅ Created demo user for role: ${roleUser.role}`);
      }
    }
  } catch (err) {
    console.warn('⚠️  Warning: Could not seed demo users:', err.message);
    // Don't throw - allow initialization to proceed even if demo seed fails
  }
}

export default db;
