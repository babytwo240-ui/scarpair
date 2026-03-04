module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const columns = await queryInterface.describeTable('users');
      
      if (columns.passwordHistory) {
        console.log('⏭️  Column "passwordHistory" already exists, skipping...');
        return;
      }

      await queryInterface.addColumn('users', 'passwordHistory', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of last 5 hashed passwords for reuse prevention'
      });

      console.log('✓ Added passwordHistory column to users table');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('users', 'passwordHistory');
      console.log('✓ Removed passwordHistory column from users table');
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
