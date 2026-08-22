'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('users', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        username: { type: Sequelize.STRING(255), allowNull: false },
        user_type: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'user_types', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        person: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'people', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        country: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'countries', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        email: { allowNull: false, type: Sequelize.STRING(150) },
        password_hash: { allowNull: false, type: Sequelize.STRING(255) },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addIndex({ tableName: 'users' }, ['username'], {
        unique: true,
        where: { deleted_at: null },
        name: 'uq_users_username',
        transaction
      });
      await queryInterface.addIndex({ tableName: 'users' }, ['person', 'user_type'], {
        unique: true,
        where: { deleted_at: null },
        name: 'unique_person_userType',
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
      await queryInterface.dropTable('users', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};