'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. User Types
      await queryInterface.bulkInsert('user_types', [
        { code: 'ADMIN', description: 'Administrativo' },
        { code: 'CLIENT', description: 'Cliente' }
      ], { transaction });

      // 2. Remittance Statuses
      await queryInterface.bulkInsert('remittance_statuses', [
        { code: 'PENDING', name: 'Pendiente de Revisión' },
        { code: 'APPROVED', name: 'Aprobada' },
        { code: 'COMPLETED', name: 'Completada / Pagada' },
        { code: 'REJECTED', name: 'Rechazada' },
        { code: 'CANCELLED', name: 'Cancelada' }
      ], { transaction });

      // 3. Currencies (Monedas)
      await queryInterface.bulkInsert('currencies', [
        { iso_code: 'VES', name: 'Bolívar Soberano', symbol: 'Bs' },
        { iso_code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
        { iso_code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
        { iso_code: 'CLP', name: 'Peso Chileno', symbol: '$' }
      ], { transaction });

      // Obtener IDs de monedas recién creadas
      const [currencies] = await queryInterface.sequelize.query(
        'SELECT id, iso_code FROM currencies;', { transaction }
      );
      
      const getCurrencyId = (iso) => currencies.find(c => c.iso_code === iso)?.id;

      // 4. Countries (Países) ligados a su Moneda
      await queryInterface.bulkInsert('countries', [
        { iso_code: 'VE', name: 'Venezuela', national_currency: getCurrencyId('VES') },
        { iso_code: 'US', name: 'Estados Unidos', national_currency: getCurrencyId('USD') },
        { iso_code: 'PE', name: 'Perú', national_currency: getCurrencyId('PEN') },
        { iso_code: 'CL', name: 'Chile', national_currency: getCurrencyId('CLP') }
      ], { transaction });

      const [countriesRows] = await queryInterface.sequelize.query(
        'SELECT id, iso_code FROM countries;', { transaction }
      );
      const getCountryId = (iso) => countriesRows.find(c => c.iso_code === iso)?.id;

      // 5. Banks (Internacionales y agnósticos al país)
      await queryInterface.bulkInsert('banks', [
        { name: 'Banesco', code: '0134' },
        { name: 'Mercantil', code: '0105' },
        { name: 'BCP', code: '002' },
        { name: 'Interbank', code: '003' },
        { name: 'Banco de Chile', code: '001' },
        { name: 'Zelle', code: 'ZEL' } // Tratamos a Zelle como una entidad bancaria virtual
      ], { transaction });

      const [banks] = await queryInterface.sequelize.query(
        'SELECT id, name FROM banks;', { transaction }
      );
      const getBankId = (name) => banks.find(b => b.name === name)?.id;

      // 6. Receiving Methods
      await queryInterface.bulkInsert('receiving_methods', [
        { name: 'Transferencia Bancaria', type_code: 'TRANSFER', fields_config: JSON.stringify([ {label: 'Nro. Cuenta', name: 'account-number'}, {label: 'Documento de Identidad', name: 'document-id'} ]) },
        { name: 'Pago Móvil', type_code: 'PAGO_MOVIL', fields_config: JSON.stringify([ {label: 'Teléfono', name: 'phone-number'}, {label: 'Documento de Identidad', name: 'document-id'} ]) },
        { name: 'Zelle', type_code: 'ZELLE', fields_config: JSON.stringify([ {label: 'Correo Electrónico', name: 'email'} ]) },
        { name: 'Efectivo', type_code: 'CASH', fields_config: JSON.stringify([ {label: 'Oficina de Retiro', name: 'office-id'} ]) }
      ], { transaction });

      const [methods] = await queryInterface.sequelize.query(
        'SELECT id, type_code FROM receiving_methods;', { transaction }
      );
      const getMethodId = (code) => methods.find(m => m.type_code === code)?.id;



      // 8. Bank Receiving Methods (Métodos por Banco)
      const brm = [];
      const addBRM = (bName, mCode) => {
          const bid = getBankId(bName);
          const mid = getMethodId(mCode);
          if (bid && mid) brm.push({ bank: bid, receiving_method: mid, is_active: true });
      }

      // Bancos Venezolanos
      addBRM('Banesco', 'TRANSFER');
      addBRM('Banesco', 'PAGO_MOVIL');
      addBRM('Mercantil', 'TRANSFER');
      addBRM('Mercantil', 'PAGO_MOVIL');
      // Bancos Peruanos
      addBRM('BCP', 'TRANSFER');
      addBRM('Interbank', 'TRANSFER');
      // Banco de Chile
      addBRM('Banco de Chile', 'TRANSFER');
      // Zelle
      addBRM('Zelle', 'ZELLE');

      if (brm.length > 0) {
        await queryInterface.bulkInsert('bank_receiving_methods', brm, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('bank_receiving_methods', null, { transaction });
      await queryInterface.bulkDelete('receiving_methods', null, { transaction });
      await queryInterface.bulkDelete('banks', null, { transaction });
      await queryInterface.bulkDelete('countries', null, { transaction });
      await queryInterface.bulkDelete('currencies', null, { transaction });
      await queryInterface.bulkDelete('remittance_statuses', null, { transaction });
      await queryInterface.bulkDelete('user_types', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
