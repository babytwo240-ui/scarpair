const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { Sequelize } = require('sequelize');

// Initialize database connection
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

async function setPasswordChangeRequired(username = null) {
  try {
    console.log('Connecting to database...');
    console.log(`DB: ${process.env.DB_NAME}, Host: ${process.env.DB_HOST}, Port: ${process.env.DB_PORT}`);
    
    if (username) {
      console.log(`Setting must_change_password = true for ${username}...`);

      const result = await sequelize.query(
        `UPDATE admin_users SET must_change_password = true WHERE username = :username`,
        {
          replacements: { username },
          type: sequelize.QueryTypes.UPDATE
        }
      );

      console.log(`✓ Updated ${result[1]} record(s)`);

      // Verify the change
      const admin = await sequelize.query(
        `SELECT username, must_change_password FROM admin_users WHERE username = :username`,
        {
          replacements: { username },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (admin.length > 0) {
        console.log(`\n✓ Verification: ${admin[0].username} - must_change_password: ${admin[0].must_change_password}`);
      }
    } else {
      console.log('Setting must_change_password = true for ALL admins...');

      const result = await sequelize.query(
        `UPDATE admin_users SET must_change_password = true`,
        {
          type: sequelize.QueryTypes.UPDATE
        }
      );

      console.log(`✓ Updated ${result[1]} admin record(s)`);

      // Verify the changes
      const admins = await sequelize.query(
        `SELECT username, must_change_password FROM admin_users ORDER BY username`,
        {
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log(`\n✓ Verification - All admins:`);
      admins.forEach(admin => {
        console.log(`  ${admin.username}: must_change_password = ${admin.must_change_password}`);
      });
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

const username = process.argv[2] || null;
setPasswordChangeRequired(username);
