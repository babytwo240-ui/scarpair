const config = require('../dist/config/database').default;
const { User, sequelize } = require('../dist/models');
const bcryptjs = require('bcryptjs');

async function createTestUser() {
  try {
    const env = process.env.NODE_ENV || 'development';
    console.log(`Creating test user in ${env} environment...`);

    const existing = await User.findOne({ where: { email: 'testbusiness@example.com' } });
    if (existing) {
      console.log('✅ Test business user already exists!');
      console.log('Email: testbusiness@example.com');
      console.log('Password: SecurePass123!');
      console.log(`ID: ${existing.id}`);
      await sequelize.close();
      process.exit(0);
    }

    const password = 'SecurePass123!';
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await User.create({
      businessName: 'Test Business Inc',
      email: 'testbusiness@example.com',
      password: hashedPassword,
      phone: '+1234567890',
      type: 'business',
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      address: '123 Industrial Ave, New York, NY 10001',
      isEmailVerified: true,
      isActive: true
    });

    console.log('✅ Test business user created successfully!');
    console.log('Email: testbusiness@example.com');
    console.log('Password: SecurePass123!');
    console.log(`ID: ${user.id}`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();

