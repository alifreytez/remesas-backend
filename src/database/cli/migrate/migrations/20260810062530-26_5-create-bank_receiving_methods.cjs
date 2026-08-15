'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('bank_receiving_methods', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        bank: { type: Sequelize.INTEGER, allowNull: false },
        receiving_method: { type: Sequelize.INTEGER, allowNull: false },
        is_active: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      
      await queryInterface.addConstraint(
        { tableName: 'bank_receiving_methods' },
        {
          fields: ['bank'],
          type: 'foreign key',
          name: 'fk_brm_bank',
          references: { table: { tableName: 'banks' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );
      
      await queryInterface.addConstraint(
        { tableName: 'bank_receiving_methods' },
        {
          fields: ['receiving_method'],
          type: 'foreign key',
          name: 'fk_brm_receiving_method',
          references: { table: { tableName: 'receiving_methods' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );
      
      await queryInterface.addIndex({ tableName: 'bank_receiving_methods' }, ['bank', 'receiving_method'], {
        unique: true,
        where: { deleted_at: null },
        name: 'unique_bank_method',
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
      await queryInterface.dropTable('bank_receiving_methods', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
