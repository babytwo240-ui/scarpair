const config = require('../dist/config/database').default;
const { User, WastePost, sequelize } = require('../dist/models');

async function createTestDataInDatabase() {
  try {
    const env = process.env.NODE_ENV || 'development';
    console.log(`Creating test data in ${env} database...`);

    const existingUser = await User.findOne({ where: { email: 'testbusiness@example.com' } });
    if (existingUser) {
      await WastePost.destroy({ where: { businessId: existingUser.id } });
      await User.destroy({ where: { email: 'testbusiness@example.com' } });
      console.log('✅ Cleaned up existing test data');
    }

    const user = await User.create({
      type: 'business',
      businessName: 'Test Business Inc',
      email: 'testbusiness@example.com',
      password: 'SecurePass123!',
      phone: '+1234567890',
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      isLocked: false
    });

    console.log('✅ Test business user created in database');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);

    const wastePost = await WastePost.create({
      businessId: user.id,
      title: 'Plastic Waste - High Density Polyethylene',
      description: '200 kg of clean HDPE plastic waste, sorted and ready for recycling. Good condition, stored in covered area.',
      wasteType: 'plastic',
      quantity: 200,
      unit: 'kg',
      condition: 'good',
      location: 'Industrial Area A, Building 5',
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      address: '123 Industrial Ave, New York, NY 10001',
      price: 500,
      images: ['https://example.com/plastic1.jpg'],
      status: 'draft',
      visibility: 'public'
    });

    console.log('✅ Test waste post created');
    console.log(`   ID: ${wastePost.id}`);
    console.log(`   Title: ${wastePost.title}`);

    console.log('\n📋 Test Data Summary:');
    console.log(`   Business User ID: ${user.id}`);
    console.log('   Email: testbusiness@example.com');
    console.log('   Password: SecurePass123!');
    console.log('   Business Name: Test Business Inc');
    console.log(`   Waste Post ID: ${wastePost.id}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    process.exit(1);
  }
}

createTestDataInDatabase();
