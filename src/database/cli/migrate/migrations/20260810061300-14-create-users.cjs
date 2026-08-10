'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('users', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_type: { type: Sequelize.INTEGER, allowNull: false },
        person: { type: Sequelize.INTEGER, allowNull: false },
        email: { allowNull: false, type: Sequelize.STRING(150) },
        password_hash: { allowNull: false, type: Sequelize.STRING(255) },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addIndex({ tableName: 'users' }, ['email'], {
        unique: true,
        where: { deleted_at: null },
        name: 'uq_users_email',
        transaction
      });
      await queryInterface.addConstraint(
        { tableName: 'users' },
        {
          fields: ['user_type'],
          type: 'foreign key',
          name: 'fk_users_user_type',
          references: { table: { tableName: 'user_types' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'users' },
        {
          fields: ['person'],
          type: 'foreign key',
          name: 'fk_users_person',
          references: { table: { tableName: 'people' }, field: 'id' },
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
      await queryInterface.dropTable('users', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};