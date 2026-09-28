import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'itd_portfolio',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345678'
});

async function updatePasswords() {
  try {
    console.log('Generating password hash for "admin123"...');
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Hash generated:', hash);
    
    console.log('\nUpdating all users with new password hash...');
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL, status = $2',
      [hash, 'active']
    );
    
    console.log(`✅ Updated ${result.rowCount} users`);
    
    // Verify one user
    const user = await pool.query('SELECT email, password_hash FROM users WHERE email = $1', ['superadmin@insa.gov.et']);
    if (user.rows.length > 0) {
      console.log('\nVerifying password for superadmin@insa.gov.et...');
      const match = await bcrypt.compare('admin123', user.rows[0].password_hash);
      console.log('Password verification:', match ? '✅ SUCCESS' : '❌ FAILED');
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updatePasswords();
