'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('remittance_movements', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        remittance: { type: Sequelize.INTEGER, allowNull: false },
        status: { type: Sequelize.INTEGER, allowNull: false },
        changed_by: { type: Sequelize.INTEGER, allowNull: false },
        observation: { type: Sequelize.TEXT, allowNull: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'remittance_movements' },
        {
          fields: ['remittance'],
          type: 'foreign key',
          name: 'fk_remittance_movements_remittance',
          references: { table: { tableName: 'remittances' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittance_movements' },
        {
          fields: ['status'],
          type: 'foreign key',
          name: 'fk_remittance_movements_status',
          references: { table: { tableName: 'remittance_statuses' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittance_movements' },
        {
          fields: ['changed_by'],
          type: 'foreign key',
          name: 'fk_remittance_movements_changed_by',
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
      await queryInterface.dropTable('remittance_movements', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};