import pg from 'pg';
import bcrypt from 'bcryptjs';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio',
  user: 'postgres',
  password: '12345678'
});

(async () => {
  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // Generate hashes
    const h1 = await bcrypt.hash('admin123', 10);
    const h2 = await bcrypt.hash('pm123', 10);
    const h3 = await bcrypt.hash('content123', 10);

    // Clear users
    await client.query('TRUNCATE users CASCADE');
    console.log('✓ Cleared existing users');

    // Generate IDs based on timestamp
    const now = Date.now();
    const users = [
      {
        id: now * 1000 + 1,
        name: 'Tibebe Getachew',
        email: 'superadmin@insa.gov.et',
        password_hash: h1,
        role: 'super_admin',
        title: 'Principal Systems Architect',
        department: 'Engineering'
      },
      {
        id: now * 1000 + 2,
        name: 'Elena Rostova',
        email: 'admin@nexora.io',
        password_hash: h1,
        role: 'administrator',
        title: 'Director of Engineering',
        department: 'Engineering'
      },
      {
        id: now * 1000 + 3,
        name: 'Israel',
        email: 'isru@insa.gov.et',
        password_hash: h2,
        role: 'project_manager',
        title: 'Principal Project Manager',
        department: 'Engineering'
      },
      {
        id: now * 1000 + 4,
        name: 'Melaku',
        email: 'mela@insa.gov.et',
        password_hash: h3,
        role: 'content_manager',
        title: 'Head of Content',
        department: 'Development'
      }
    ];

    // Insert users
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, title, department, avatar, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [user.id, user.name, user.email, user.password_hash, user.role, user.title, user.department, '/uploads/avatar.jpg', 'active']
      );
      console.log(`✓ Created: ${user.name} (${user.email})`);
    }

    // Verify
    const result = await client.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('\n✅ Demo users in PostgreSQL:');
    result.rows.forEach(u => console.log(`  - ${u.name} (${u.email}): ${u.role}`));

    await client.end();
    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
