'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('country_receiving_methods', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        country: { type: Sequelize.INTEGER, allowNull: false },
        receiving_method: { type: Sequelize.INTEGER, allowNull: false },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      
      await queryInterface.addConstraint(
        { tableName: 'country_receiving_methods' },
        {
          fields: ['country', 'receiving_method'],
          type: 'unique',
          name: 'unique_country_method',
          transaction,
        }
      );

      await queryInterface.addConstraint(
        { tableName: 'country_receiving_methods' },
        {
          fields: ['country'],
          type: 'foreign key',
          name: 'fk_country_receiving_methods_country',
          references: { table: { tableName: 'countries' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      
      await queryInterface.addConstraint(
        { tableName: 'country_receiving_methods' },
        {
          fields: ['receiving_method'],
          type: 'foreign key',
          name: 'fk_country_receiving_methods_receiving_method',
          references: { table: { tableName: 'receiving_methods' }, field: 'id' },
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
      await queryInterface.dropTable('country_receiving_methods', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
