import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function fixStaffVisibility() {
  try {
    console.log('Updating all team member visibility...\n');
    
    // Make ALL team members visible
    await pool.query(
      'UPDATE team_members SET is_visible = 1'
    );
    
    console.log('✅ All team members are now visible!\n');
    
    // Show summary
    const leaders = await pool.query(
      `SELECT COUNT(*) as count FROM team_members WHERE is_leadership = 1 AND is_visible = 1`
    );
    
    const staff = await pool.query(
      `SELECT COUNT(*) as count FROM team_members WHERE is_leadership = 0 AND is_visible = 1`
    );
    
    console.log('📊 Visibility Summary:');
    console.log(`  ✅ Leaders visible: ${leaders.rows[0].count}`);
    console.log(`  ✅ Staff visible: ${staff.rows[0].count}`);
    console.log(`  ✅ Total visible: ${leaders.rows[0].count + staff.rows[0].count}`);
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

fixStaffVisibility();
