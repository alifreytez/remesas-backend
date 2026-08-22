'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('exchange_rates', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        initial_currency: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'currencies', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        secondary_currency: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'currencies', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        rate: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        created_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
                  
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('exchange_rates', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
