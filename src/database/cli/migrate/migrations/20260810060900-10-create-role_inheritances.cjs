'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('role_inheritances', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        parent_role: { type: Sequelize.INTEGER, allowNull: false },
        child_role: { type: Sequelize.INTEGER, allowNull: false },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'role_inheritances' },
        {
          fields: ['parent_role'],
          type: 'foreign key',
          name: 'fk_role_inheritances_parent_role',
          references: { table: { tableName: 'roles' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'role_inheritances' },
        {
          fields: ['child_role'],
          type: 'foreign key',
          name: 'fk_role_inheritances_child_role',
          references: { table: { tableName: 'roles' }, field: 'id' },
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
      await queryInterface.dropTable('role_inheritances', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};