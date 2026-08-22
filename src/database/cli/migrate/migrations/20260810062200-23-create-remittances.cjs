'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('remittances', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        client: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'clients', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        origin_country: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'countries', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        destination_country: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'countries', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        amount_sent: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        amount_received: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        exchange_rate_applied: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'exchange_rates', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        platform_bank_account: { type: Sequelize.INTEGER, allowNull: false , references: { model: 'platform_bank_accounts', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
        recipient_account_details: { allowNull: false, type: Sequelize.JSONB },
        payment_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        emission_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        status: { type: Sequelize.INTEGER, allowNull: true , references: { model: 'remittance_statuses', key: 'id' }, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
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
      await queryInterface.dropTable('remittances', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
