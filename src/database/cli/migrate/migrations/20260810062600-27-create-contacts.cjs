'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('contacts', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        client: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'clients', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        name: { type: Sequelize.STRING(255), allowNull: false },
        country: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'countries', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        contact_data: { type: Sequelize.JSONB, allowNull: false },
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
      await queryInterface.dropTable('contacts', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
