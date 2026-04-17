const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres',
  password: '123',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

(async () => {
  try {
    const result = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Existing admin_sessions columns:');
    result[0].forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
  } catch(err) {
    console.error(err.message);
  } finally {
    await sequelize.close();
  }
})();
