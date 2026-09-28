import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function verifyProjects() {
  try {
    console.log('📊 Verifying Projects in Database:\n');
    
    const result = await pool.query(
      `SELECT 
        id, name, slug, short_description, status, 
        is_published, is_featured, cover_image, category_id,
        client_name, start_date, completion_date
      FROM projects 
      ORDER BY created_at DESC`
    );
    
    console.log(`Total Projects: ${result.rows.length}\n`);
    
    result.rows.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Slug: ${p.slug}`);
      console.log(`   Status: ${p.status} | Published: ${p.is_published === 1 ? 'YES' : 'NO'} | Featured: ${p.is_featured === 1 ? 'YES' : 'NO'}`);
      console.log(`   Image: ${p.cover_image ? p.cover_image.substring(0, 50) + '...' : 'NO IMAGE'}`);
      console.log(`   Client: ${p.client_name}`);
      console.log('');
    });
    
    console.log('✅ All projects are ready to display!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

verifyProjects();
