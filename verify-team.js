import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function verifyTeam() {
  try {
    console.log('👥 Verifying Team Members in Database:\n');
    
    const result = await pool.query(
      `SELECT 
        id, name, email, role, title, department,
        is_leadership, is_visible, avatar
      FROM team_members 
      ORDER BY is_leadership DESC, display_order ASC`
    );
    
    console.log(`Total Team Members: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No team members in database yet.');
      console.log('Run the admin panel to add team members.');
    } else {
      result.rows.forEach((m, i) => {
        const badge = m.is_leadership ? '🔑 LEADER' : '👤 STAFF';
        const visible = m.is_visible ? '✅' : '❌';
        console.log(`${i + 1}. ${badge} ${visible} ${m.name}`);
        console.log(`   Email: ${m.email} | Role: ${m.role}`);
        console.log(`   Department: ${m.department} | Title: ${m.title}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

verifyTeam();
