module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('waste_posts');
    
    if (!tableExists) {
      console.log('⏭️  Table "waste_posts" does not exist, skipping migration...');
      return;
    }

    const table = await queryInterface.describeTable('waste_posts');
    
    const newColumns = [];
    
    if (!table.collectionStatus) {
      newColumns.push('collectionStatus');
    }
    if (!table.approvedRecyclerId) {
      newColumns.push('approvedRecyclerId');
    }
    if (!table.pickupDeadline) {
      newColumns.push('pickupDeadline');
    }
    if (!table.pickedUpAt) {
      newColumns.push('pickedUpAt');
    }

    if (newColumns.length === 0) {
      console.log('✅ Collection workflow columns already exist');
      return;
    }
    if (!table.collectionStatus) {
      await queryInterface.addColumn('waste_posts', 'collectionStatus', {
        type: Sequelize.ENUM('ACTIVE', 'APPROVED', 'PICKED_UP', 'COMPLETED'),
        defaultValue: 'ACTIVE',
        comment: 'Collection workflow status: ACTIVE -> APPROVED -> PICKED_UP -> COMPLETED'
      });
      console.log('✅ Added collectionStatus column');
    }
    if (!table.approvedRecyclerId) {
      await queryInterface.addColumn('waste_posts', 'approvedRecyclerId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'ID of the recycler approved to collect this waste'
      });
      console.log('✅ Added approvedRecyclerId column');
    }
    if (!table.pickupDeadline) {
      await queryInterface.addColumn('waste_posts', 'pickupDeadline', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Deadline for recycler to pick up (1 hour after approval)'
      });
      console.log('✅ Added pickupDeadline column');
    }
    if (!table.pickedUpAt) {
      await queryInterface.addColumn('waste_posts', 'pickedUpAt', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when recycler marked as picked up'
      });
      console.log('✅ Added pickedUpAt column');
    }
    try {
      const indexes = await queryInterface.showIndex('waste_posts');
      const indexNames = indexes.map(idx => idx.name);

      if (!indexNames.includes('waste_posts_collectionStatus')) {
        await queryInterface.addIndex('waste_posts', ['collectionStatus'], {
          name: 'waste_posts_collectionStatus'
        });
        console.log('✅ Added index on collectionStatus');
      }

      if (!indexNames.includes('waste_posts_approvedRecyclerId')) {
        await queryInterface.addIndex('waste_posts', ['approvedRecyclerId'], {
          name: 'waste_posts_approvedRecyclerId'
        });
        console.log('✅ Added index on approvedRecyclerId');
      }

      if (!indexNames.includes('waste_posts_pickupDeadline')) {
        await queryInterface.addIndex('waste_posts', ['pickupDeadline'], {
          name: 'waste_posts_pickupDeadline'
        });
        console.log('✅ Added index on pickupDeadline');
      }
    } catch (error) {
      console.warn('⚠️  Could not add indexes:', error.message);
    }

    console.log('✅ Migration completed successfully');
  },

  down: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('waste_posts');
    
    if (!tableExists) {
      console.log('⏭️  Table "waste_posts" does not exist, skipping rollback...');
      return;
    }

    const table = await queryInterface.describeTable('waste_posts');

    // Remove columns in reverse order
    if (table.pickedUpAt) {
      await queryInterface.removeColumn('waste_posts', 'pickedUpAt');
      console.log('✅ Removed pickedUpAt column');
    }

    if (table.pickupDeadline) {
      await queryInterface.removeColumn('waste_posts', 'pickupDeadline');
      console.log('✅ Removed pickupDeadline column');
    }

    if (table.approvedRecyclerId) {
      await queryInterface.removeColumn('waste_posts', 'approvedRecyclerId');
      console.log('✅ Removed approvedRecyclerId column');
    }

    if (table.collectionStatus) {
      await queryInterface.removeColumn('waste_posts', 'collectionStatus');
      console.log('✅ Removed collectionStatus column');
    }

    console.log('✅ Rollback completed successfully');
  }
};
