import bcrypt from 'bcryptjs';

(async () => {
  const passwords = {
    'admin123': 'Tibebe, Elena',
    'pm123': 'Israel', 
    'content123': 'Melaku'
  };
  
  console.log('Generating password hashes:\n');
  for (const [pwd, users] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(pwd, 10);
    console.log(`Password: ${pwd}`);
    console.log(`Users: ${users}`);
    console.log(`Hash: ${hash}\n`);
  }
})();
