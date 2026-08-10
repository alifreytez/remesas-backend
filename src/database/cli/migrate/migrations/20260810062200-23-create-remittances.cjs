'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('remittances', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        client: { type: Sequelize.INTEGER, allowNull: false },
        origin_country: { type: Sequelize.INTEGER, allowNull: false },
        destination_country: { type: Sequelize.INTEGER, allowNull: false },
        amount_sent: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        amount_received: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        exchange_rate_applied: { type: Sequelize.INTEGER, allowNull: false },
        commission_applied: { type: Sequelize.INTEGER, allowNull: false },
        platform_bank_account: { type: Sequelize.INTEGER, allowNull: false },
        recipient_account_details: { allowNull: false, type: Sequelize.JSONB },
        payment_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        emission_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        status: { type: Sequelize.INTEGER, allowNull: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['client'],
          type: 'foreign key',
          name: 'fk_remittances_client',
          references: { table: { tableName: 'clients' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['origin_country'],
          type: 'foreign key',
          name: 'fk_remittances_origin_country',
          references: { table: { tableName: 'countries' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['destination_country'],
          type: 'foreign key',
          name: 'fk_remittances_destination_country',
          references: { table: { tableName: 'countries' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['exchange_rate_applied'],
          type: 'foreign key',
          name: 'fk_remittances_exchange_rate_applied',
          references: { table: { tableName: 'exchange_rates' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['commission_applied'],
          type: 'foreign key',
          name: 'fk_remittances_commission_applied',
          references: { table: { tableName: 'commissions' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['platform_bank_account'],
          type: 'foreign key',
          name: 'fk_remittances_platform_bank_account',
          references: { table: { tableName: 'platform_bank_accounts' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      await queryInterface.addConstraint(
        { tableName: 'remittances' },
        {
          fields: ['status'],
          type: 'foreign key',
          name: 'fk_remittances_status',
          references: { table: { tableName: 'remittance_statuses' }, field: 'id' },
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
      await queryInterface.dropTable('remittances', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};