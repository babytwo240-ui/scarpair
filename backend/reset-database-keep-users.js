/**
 * Reset Database - Clear All Data Except Users
 * Keeps all user records intact, clears everything else
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Sequelize } = require('sequelize');

async function resetDatabase() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    console.log('🔄 Resetting Database (Keeping Users)...\n');
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const tables = [
      'system_logs',
      'feedbacks',
      'post_ratings',
      'user_ratings',
      'reports',
      'post_messages',
      'messages',
      'conversations',
      'reviews',
      'notifications',
      'collections',
      'waste_posts'
    ];

    console.log('📋 Clearing the following tables:');
    tables.forEach(t => console.log(`   - ${t}`));
    console.log('');

    // Disable foreign key constraints temporarily
    await sequelize.query('SET session_replication_role = replica');

    // Delete all data from tables (in order to avoid FK conflicts)
    for (const table of tables) {
      console.log(`Clearing ${table}...`);
      await sequelize.query(`DELETE FROM "${table}"`);
      
      // Reset sequences
      await sequelize.query(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false);`
      ).catch(() => {
        // Some tables might not have sequences, that's okay
      });
    }

    // Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = default');

    console.log('\n✅ Database Reset Complete!\n');

    // Show remaining data
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Remaining Data:`);
    console.log(`   - Users: ${userCount[0][0].count}`);

    const tables_to_check = [
      'waste_posts', 'collections', 'feedbacks', 'reports',
      'user_ratings', 'post_ratings', 'notifications'
    ];

    for (const table of tables_to_check) {
      const result = await sequelize.query(`SELECT COUNT(*) as count FROM "${table}"`);
      console.log(`   - ${table}: ${result[0][0].count}`);
    }

    console.log('\n✅ All other tables cleared successfully!');
    console.log('✅ User data preserved!');
    console.log('✅ Waste categories preserved!\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

resetDatabase();
