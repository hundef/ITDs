import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function fixLeaderVisibility() {
  try {
    console.log('Updating leader visibility...\n');
    
    // Make all leaders visible
    await pool.query(
      'UPDATE team_members SET is_visible = 1 WHERE is_leadership = 1'
    );
    
    console.log('✅ All leaders are now visible!\n');
    
    // Show the updated leaders
    const result = await pool.query(
      `SELECT id, name, role, is_visible FROM team_members 
       WHERE is_leadership = 1 
       ORDER BY name`
    );
    
    console.log('Updated Leaders:');
    result.rows.forEach((leader, i) => {
      const badge = leader.is_visible ? '✅' : '❌';
      console.log(`${i + 1}. ${badge} ${leader.name} (${leader.role})`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

fixLeaderVisibility();
