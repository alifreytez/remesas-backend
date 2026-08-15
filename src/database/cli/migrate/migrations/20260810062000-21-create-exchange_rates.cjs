'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('exchange_rates', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        initial_currency: { type: Sequelize.INTEGER, allowNull: false },
        secondary_currency: { type: Sequelize.INTEGER, allowNull: false },
        rate: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        created_by: { type: Sequelize.INTEGER, allowNull: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'exchange_rates' },
        {
          fields: ['initial_currency'],
          type: 'foreign key',
          name: 'fk_exchange_rates_initial_currency',
          references: { table: { tableName: 'currencies' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'exchange_rates' },
        {
          fields: ['secondary_currency'],
          type: 'foreign key',
          name: 'fk_exchange_rates_secondary_currency',
          references: { table: { tableName: 'currencies' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'exchange_rates' },
        {
          fields: ['created_by'],
          type: 'foreign key',
          name: 'fk_exchange_rates_created_by',
          references: { table: { tableName: 'users' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );
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