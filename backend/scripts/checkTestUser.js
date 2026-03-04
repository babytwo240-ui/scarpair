const config = require('../dist/config/database').default;
const { User, sequelize } = require('../dist/models');

async function checkTestUser() {
  try {
    const user = await User.findOne({ where: { email: 'testbusiness@example.com' } });
    
    if (!user) {
      console.log('❌ Test user NOT found in database');
      process.exit(1);
    }

    console.log('✅ Test user found in database');
    console.log('User data:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Type:', user.type);
    console.log('  businessName:', user.businessName);
    console.log('  isVerified:', user.isVerified);
    console.log('  isEmailVerified:', user.isEmailVerified);
    console.log('  isActive:', user.isActive);
    console.log('  phone:', user.phone);
    console.log('  Password hash (first 20 chars):', user.password ? user.password.substring(0, 20) : 'null');
    
    const bcryptjs = require('bcryptjs');
    const passwordMatch = await bcryptjs.compare('SecurePass123!', user.password);
    console.log('\n  Password verification: ' + (passwordMatch ? '✅ MATCHES' : '❌ NO MATCH'));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    process.exit(1);
  }
}

checkTestUser();
