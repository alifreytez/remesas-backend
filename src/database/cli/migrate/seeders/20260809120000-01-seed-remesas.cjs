'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // User Types
      await queryInterface.bulkInsert('user_types', [
        { code: 'ADMIN', description: 'Administrador del Sistema' },
        { code: 'OPERATOR', description: 'Operador de Sucursal' },
        { code: 'CLIENT', description: 'Cliente Regular' }
      ], { transaction });

      // Remittance Statuses
      await queryInterface.bulkInsert('remittance_statuses', [
        { code: 'PENDING', name: 'Pendiente de Revisión' },
        { code: 'APPROVED', name: 'Aprobada' },
        { code: 'COMPLETED', name: 'Completada / Pagada' },
        { code: 'REJECTED', name: 'Rechazada' },
        { code: 'CANCELLED', name: 'Cancelada' }
      ], { transaction });

      // Countries
      await queryInterface.bulkInsert('countries', [
        { iso_code: 'VE', name: 'Venezuela', currency_symbol: 'VES' },
        { iso_code: 'CO', name: 'Colombia', currency_symbol: 'COP' },
        { iso_code: 'US', name: 'Estados Unidos', currency_symbol: 'USD' }
      ], { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('countries', null, { transaction });
      await queryInterface.bulkDelete('remittance_statuses', null, { transaction });
      await queryInterface.bulkDelete('user_types', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
