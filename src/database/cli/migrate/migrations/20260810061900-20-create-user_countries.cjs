'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('user_countries', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_id: { type: Sequelize.INTEGER, allowNull: false },
        country_id: { type: Sequelize.INTEGER, allowNull: false },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'user_countries' },
        {
          fields: ['user_id'],
          type: 'foreign key',
          name: 'fk_user_countries_user_id',
          references: { table: { tableName: 'users' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'user_countries' },
        {
          fields: ['country_id'],
          type: 'foreign key',
          name: 'fk_user_countries_country_id',
          references: { table: { tableName: 'countries' }, field: 'id' },
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
      await queryInterface.dropTable('user_countries', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};