'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('remittance_price_modifiers', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        remittance: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'remittances', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        price_modifier: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'price_modifiers', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        applied_amount: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        snapshot: { allowNull: false, type: Sequelize.JSONB },
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
      await queryInterface.dropTable('remittance_price_modifiers', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
