'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('platform_bank_accounts', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        payment_method: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'payment_methods', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        country: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'countries', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        is_global: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        account_details: { allowNull: false, type: Sequelize.JSONB },
        currency: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'currencies', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });

      await queryInterface.addConstraint('platform_bank_accounts', {
        fields: ['is_global', 'country'],
        type: 'check',
        name: 'check_platform_account_global_country',
        where: {
          [Sequelize.Op.or]: [
            { is_global: true, country: null },
            { is_global: false, country: { [Sequelize.Op.ne]: null } }
          ]
        },
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
      await queryInterface.dropTable('platform_bank_accounts', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};


