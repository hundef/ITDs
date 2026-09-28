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

    // Generate password hashes
    const hash_admin123 = await bcrypt.hash('admin123', 10);
    const hash_pm123 = await bcrypt.hash('pm123', 10);
    const hash_content123 = await bcrypt.hash('content123', 10);

    console.log('\nPassword hashes generated:');
    console.log(`admin123: ${hash_admin123}`);
    console.log(`pm123: ${hash_pm123}`);
    console.log(`content123: ${hash_content123}`);

    // Clear existing users
    console.log('\nClearing existing users...');
    await client.query('TRUNCATE users CASCADE');

    // Insert demo users
    const demoUsers = [
      {
        name: 'Tibebe Getachew',
        email: 'superadmin@insa.gov.et',
        password_hash: hash_admin123,
        role: 'super_admin',
        title: 'Principal Systems Architect & Technical Director',
        department: 'Engineering & Architecture',
        custom_permissions: ['projects.view']
      },
      {
        name: 'Elena Rostova',
        email: 'admin@nexora.io',
        password_hash: hash_admin123,
        role: 'administrator',
        title: 'Director of Engineering',
        department: 'Engineering',
        custom_permissions: ['security.audit', 'users.manage_security']
      },
      {
        name: 'Israel',
        email: 'isru@insa.gov.et',
        password_hash: hash_pm123,
        role: 'project_manager',
        title: 'Principal Project Manager',
        department: 'Engineering',
        custom_permissions: ['projects.publish']
      },
      {
        name: 'Melaku',
        email: 'mela@insa.gov.et',
        password_hash: hash_content123,
        role: 'content_manager',
        title: 'Head of Content & Communications',
        department: 'Development',
        custom_permissions: []
      }
    ];

    console.log('\nInserting demo users...');
    for (const user of demoUsers) {
      const result = await client.query(
        `INSERT INTO users (
          name, email, password_hash, role, title, department, 
          avatar, status, custom_permissions, two_factor_enabled, 
          failed_login_attempts, locked_until, last_login_at, last_login_ip,
          last_password_change, must_change_password, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        ) RETURNING id, email, role`,
        [
          user.name,
          user.email,
          user.password_hash,
          user.role,
          user.title,
          user.department,
          '/uploads/avatar_' + user.role + '.jpg',
          'active',
          user.custom_permissions, // Send as array - PostgreSQL will handle it
          false,
          0,
          null,
          null,
          null,
          new Date().toISOString(),
          false
        ]
      );
      console.log(`  ✓ Created: ${user.name} (${user.email}) - ${user.role}`);
    }

    // Verify
    console.log('\nVerifying demo users in database:');
    const verify = await client.query(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );
    verify.rows.forEach(u => {
      console.log(`  - ${u.name} (${u.email}): ${u.role}`);
    });

    console.log('\n✅ Migration complete!');
    console.log('\nDemo Credentials:');
    console.log('  Tibebe (superadmin@insa.gov.et / admin123) - Super Admin');
    console.log('  Elena (admin@nexora.io / admin123) - Administrator');
    console.log('  Israel (isru@insa.gov.et / pm123) - Project Manager');
    console.log('  Melaku (mela@insa.gov.et / content123) - Content Manager');

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
