'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('commissions', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        origin_country: { type: Sequelize.INTEGER, allowNull: false },
        destination_country: { type: Sequelize.INTEGER, allowNull: false },
        amount: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        is_percentage: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: false },
        created_by: { type: Sequelize.INTEGER, allowNull: false },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'commissions' },
        {
          fields: ['origin_country'],
          type: 'foreign key',
          name: 'fk_commissions_origin_country',
          references: { table: { tableName: 'countries' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'commissions' },
        {
          fields: ['destination_country'],
          type: 'foreign key',
          name: 'fk_commissions_destination_country',
          references: { table: { tableName: 'countries' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'commissions' },
        {
          fields: ['created_by'],
          type: 'foreign key',
          name: 'fk_commissions_created_by',
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
      await queryInterface.dropTable('commissions', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};