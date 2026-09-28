import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function checkPermissions() {
  try {
    console.log('👤 Checking User Permissions:\n');
    
    // Get super admin user
    const result = await pool.query(
      `SELECT id, name, email, role, custom_permissions FROM users ORDER BY id DESC`
    );
    
    console.log('All Users:');
    result.rows.forEach((user, i) => {
      console.log(`\n${i + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Custom Permissions: ${user.custom_permissions ? user.custom_permissions.join(', ') : 'None (uses role defaults)'}`);
    });
    
    console.log('\n\n📋 Role Permissions Reference:');
    console.log('  super_admin    - All permissions');
    console.log('  administrator  - All admin permissions');
    console.log('  project_manager - Projects + analytics');
    console.log('  content_manager - Content + team management');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

checkPermissions();
