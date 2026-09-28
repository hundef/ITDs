import { db } from './server/src/db/db.js';

async function fixPasswords() {
  try {
    const testHash = '$2a$10$GNLB7EDXMQBjRuLtWa10wu5PqdxMh3eEdxQWbs1TNa5usW.t5DaZm';
    const adminHash = '$2a$10$GYKXrD98o3p1bCuJ6xq5cuWkx6eNuW3SxfPOX4WFDy//EDJvPlcHa';
    const pmHash = '$2a$10$eYQ/NPrgeLSoVAJ2kWYx2udJT1K17fUkIgFnHfH3y6SlbVXBwLYpy';
    const contentHash = '$2a$10$2a7EketJMm1gVIV4vz.AkuEbM7PNrtvQrsUp9xe6sEUkvlkN5WKGG';

    await db.update('users', { password_hash: testHash }, 'id = $1', [999]);
    console.log('✅ Test user (test@example.com) password updated');

    await db.update('users', { password_hash: adminHash }, 'email = $1', ['admin@nexora.io']);
    console.log('✅ Admin user (admin@nexora.io) password updated');

    await db.update('users', { password_hash: adminHash }, 'email = $1', ['superadmin@nexora.io']);
    console.log('✅ Super Admin user (superadmin@nexora.io) password updated');

    await db.update('users', { password_hash: pmHash }, 'email = $1', ['pm@nexora.io']);
    console.log('✅ PM user (pm@nexora.io) password updated');

    await db.update('users', { password_hash: contentHash }, 'email = $1', ['content@nexora.io']);
    console.log('✅ Content user (content@nexora.io) password updated');

    console.log('\n✅ All passwords fixed! You can now login with:');
    console.log('  Email: test@example.com');
    console.log('  Password: test123');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixPasswords();
