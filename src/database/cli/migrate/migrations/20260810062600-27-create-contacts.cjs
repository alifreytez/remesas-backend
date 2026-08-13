'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('contacts', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        client: { type: Sequelize.INTEGER, allowNull: false },
        name: { type: Sequelize.STRING(255), allowNull: false },
        document: { type: Sequelize.STRING(100), allowNull: false },
        country: { type: Sequelize.INTEGER, allowNull: false },
        contact_data: { type: Sequelize.JSONB, allowNull: false },
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
      
      await queryInterface.addConstraint(
        { tableName: 'contacts' },
        {
          fields: ['client'],
          type: 'foreign key',
          name: 'fk_contacts_client',
          references: { table: { tableName: 'clients' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );      
      
      await queryInterface.addConstraint(
        { tableName: 'contacts' },
        {
          fields: ['country'],
          type: 'foreign key',
          name: 'fk_contacts_country',
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
      await queryInterface.dropTable('contacts', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
