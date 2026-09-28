import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function checkProjects() {
  try {
    const result = await pool.query('SELECT id, name, slug, is_published, status, created_at FROM projects ORDER BY created_at DESC LIMIT 20');
    console.log('\n📋 Projects in Database:');
    console.log('================================');
    
    if (result.rows.length === 0) {
      console.log('❌ No projects found in database');
    } else {
      result.rows.forEach((p, i) => {
        const status = p.is_published ? '✅ PUBLISHED' : '📝 DRAFT';
        console.log(`${i+1}. ${status} - ${p.name}`);
        console.log(`   ID: ${p.id}, Slug: ${p.slug}, Status: ${p.status}`);
      });
    }
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

checkProjects();
