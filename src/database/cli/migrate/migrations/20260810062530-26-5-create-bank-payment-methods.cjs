'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('bank_payment_methods', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        bank: { 
          type: Sequelize.INTEGER, 
          allowNull: false, 
          references: { model: 'banks', key: 'id' }, 
          onUpdate: 'CASCADE', 
          onDelete: 'CASCADE' 
        },
        payment_method: { 
          type: Sequelize.INTEGER, 
          allowNull: false, 
          references: { model: 'payment_methods', key: 'id' }, 
          onUpdate: 'CASCADE', 
          onDelete: 'CASCADE' 
        },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });

      await queryInterface.addIndex({ tableName: 'bank_payment_methods' }, ['bank', 'payment_method'], {
        unique: true,
        where: { deleted_at: null },
        name: 'unique_bank_payment_method',
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
      await queryInterface.dropTable('bank_payment_methods', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};


