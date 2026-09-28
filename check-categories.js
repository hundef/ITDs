import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function checkCategories() {
  try {
    const result = await pool.query('SELECT id, name, slug FROM project_categories');
    console.log('Project Categories:');
    if (result.rows.length === 0) {
      console.log('  No categories found');
    } else {
      result.rows.forEach(c => {
        console.log(`  ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`);
      });
    }
    process.exit(0);
  } catch(e) { 
    console.error('Error:', e.message); 
    process.exit(1); 
  }
}

checkCategories();
