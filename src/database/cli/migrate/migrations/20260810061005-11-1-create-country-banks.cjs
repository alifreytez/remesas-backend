'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('country_banks', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        country: { 
          type: Sequelize.INTEGER, 
          allowNull: false, 
          references: { model: 'countries', key: 'id' }, 
          onUpdate: 'CASCADE', 
          onDelete: 'CASCADE' 
        },
        bank: { 
          type: Sequelize.INTEGER, 
          allowNull: false, 
          references: { model: 'banks', key: 'id' }, 
          onUpdate: 'CASCADE', 
          onDelete: 'CASCADE' 
        },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });

      await queryInterface.addIndex({ tableName: 'country_banks' }, ['country', 'bank'], {
        unique: true,
        where: { deleted_at: null },
        name: 'unique_country_bank',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('country_banks', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};



