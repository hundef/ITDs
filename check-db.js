import pg from 'pg';

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
    
    // Check if users table exists
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('Users in database:', result.rows[0].count);
    
    // Get users
    const users = await client.query('SELECT id, name, email, role FROM users');
    users.rows.forEach(u => console.log(`  - ${u.name} (${u.email}): ${u.role}`));
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
