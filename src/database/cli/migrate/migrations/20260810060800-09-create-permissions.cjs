'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('permissions', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        resource: { type: Sequelize.INTEGER, allowNull: false },
        action: { type: Sequelize.INTEGER, allowNull: false },
        permission_type: { type: Sequelize.INTEGER, allowNull: false },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'permissions' },
        {
          fields: ['resource'],
          type: 'foreign key',
          name: 'fk_permissions_resource',
          references: { table: { tableName: 'resources' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'permissions' },
        {
          fields: ['action'],
          type: 'foreign key',
          name: 'fk_permissions_action',
          references: { table: { tableName: 'actions' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'permissions' },
        {
          fields: ['permission_type'],
          type: 'foreign key',
          name: 'fk_permissions_permission_type',
          references: { table: { tableName: 'permission_types' }, field: 'id' },
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
      await queryInterface.dropTable('permissions', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};