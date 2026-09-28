import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'itd_portfolio'
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email FROM users');
    console.log('Users in database:');
    result.rows.forEach(u => {
      console.log(`  ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
    });
    process.exit(0);
  } catch(e) { 
    console.error('Error:', e.message); 
    process.exit(1); 
  }
}

checkUsers();
