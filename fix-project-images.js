import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function fixProjectImages() {
  try {
    console.log('Updating project images with placeholders...\n');
    
    // Use placeholder images from a free image service
    const placeholders = {
      'enterprise-ai-pipeline': 'https://images.unsplash.com/photo-1677442d019cecf8571637a7cdee016672a2806a7? w=800&q=80',
      'kubernetes-mesh': 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&q=80'
    };
    
    for (const [slug, imageUrl] of Object.entries(placeholders)) {
      await pool.query(
        'UPDATE projects SET cover_image = $1 WHERE slug = $2',
        [imageUrl, slug]
      );
      console.log(`✅ Updated: ${slug}`);
    }
    
    console.log('\n📸 Project images updated successfully!');
    
    // Verify
    const result = await pool.query('SELECT name, slug, cover_image FROM projects WHERE slug IN (\'enterprise-ai-pipeline\', \'kubernetes-mesh\')');
    console.log('\nVerification:');
    result.rows.forEach(p => {
      console.log(`${p.name}: ${p.cover_image}`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

fixProjectImages();
