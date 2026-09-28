import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = '$2a$10$mNIq9J/jwAgD7cpZcyS5SeaClGKX9ycJ8elHe6WrMKEM3D4Y8k6oK';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Password "admin123" matches hash:', result);
  if (result) {
    console.log('✅ SUCCESS! The password will work.');
  } else {
    console.log('❌ FAILED! The password will NOT work.');
  }
});
