'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('payment_methods', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        name: { type: Sequelize.STRING(100), allowNull: false },
        type_code: { type: Sequelize.STRING(50), allowNull: false },
        is_global: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        forced_currency: { 
          type: Sequelize.INTEGER, 
          allowNull: true,
          references: { model: 'currencies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        fields_config: { type: Sequelize.JSONB, allowNull: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });

      // DB Level CHECK constraint
      await queryInterface.addConstraint('payment_methods', {
        fields: ['forced_currency'],
        type: 'check',
        where: {
           [Sequelize.Op.or]: [
             { is_global: false },
             { forced_currency: { [Sequelize.Op.ne]: null } }
           ]
        },
        name: 'check_global_currency',
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
      await queryInterface.dropTable('payment_methods', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};



