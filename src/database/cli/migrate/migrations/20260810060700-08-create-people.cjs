'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('people', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        first_name: { allowNull: false, type: Sequelize.STRING(100) },
        last_name: { allowNull: false, type: Sequelize.STRING(100) },
        document_number: { allowNull: false, type: Sequelize.STRING(50) },
        phone: { allowNull: true, type: Sequelize.STRING(50) },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addIndex({ tableName: 'people' }, ['document_number'], {
        unique: true,
        where: { deleted_at: null },
        name: 'uq_people_document_number',
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
      await queryInterface.dropTable('people', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};