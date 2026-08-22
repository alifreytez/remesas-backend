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
        { name: 'Banco de Chile', code: '001' }
      ], { transaction });

      const [banks] = await queryInterface.sequelize.query(
        'SELECT id, name FROM banks;', { transaction }
      );
      const getBankId = (name) => banks.find(b => b.name === name)?.id;

      // 6. Payment Methods
      await queryInterface.bulkInsert('payment_methods', [
        { name: 'Transferencia Bancaria', type_code: 'TRANSFER', is_global: false, forced_currency: null, fields_config: JSON.stringify([ {label: 'Nro. Cuenta', name: 'account-number', type: 'text', format: 'number', required: true}, {label: 'Documento de Identidad', name: 'document-id', type: 'text', format: 'document', required: true} ]) },
        { name: 'Pago Móvil', type_code: 'PAGO_MOVIL', is_global: false, forced_currency: null, fields_config: JSON.stringify([ {label: 'Teléfono', name: 'phone-number', type: 'tel', format: 'phone', placeholder: 'Ej. 04141234567', required: true}, {label: 'Documento de Identidad', name: 'document-id', type: 'text', format: 'document', placeholder: 'Ej. V-12345678', required: true} ]) },
        { name: 'Zelle', type_code: 'ZELLE', is_global: true, forced_currency: getCurrencyId('USD'), fields_config: JSON.stringify([ {label: 'Correo Electrónico', name: 'email', type: 'email', format: 'email', placeholder: 'Ej. juan@correo.com', required: true} ]) },
        { name: 'Efectivo', type_code: 'CASH', is_global: false, forced_currency: null, fields_config: JSON.stringify([ {label: 'Oficina de Retiro', name: 'office-id', type: 'text', format: 'default', placeholder: 'Ej. Oficina Caracas', required: true} ]) },
      ], { transaction });

      const [methods] = await queryInterface.sequelize.query(
        'SELECT id, type_code FROM payment_methods;', { transaction }
      );
      const getMethodId = (code) => methods.find(m => m.type_code === code)?.id;

      // 7. Country Banks & Country Payment Methods
      const cb = [];
      const addCB = (iso, bName) => {
          const cid = getCountryId(iso);
          const bid = getBankId(bName);
          if (cid && bid) cb.push({ country: cid, bank: bid });
      }

      // Asociar bancos a países
      addCB('VE', 'Banesco');
      addCB('VE', 'Mercantil');
      addCB('PE', 'BCP');
      addCB('PE', 'Interbank');
      addCB('CL', 'Banco de Chile');

      if (cb.length > 0) {
        await queryInterface.bulkInsert('country_banks', cb, { transaction });
      }

      const cpm = [];
      const addCPM = (iso, mCode) => {
          const cid = getCountryId(iso);
          const mid = getMethodId(mCode);
          if (cid && mid) cpm.push({ country: cid, payment_method: mid });
      }

      // Asociar métodos locales a países (los globales no necesitan estar aquí)
      addCPM('VE', 'TRANSFER');
      addCPM('VE', 'PAGO_MOVIL');
      addCPM('PE', 'TRANSFER');
      addCPM('CL', 'TRANSFER');
      
      if (cpm.length > 0) {
        await queryInterface.bulkInsert('country_payment_methods', cpm, { transaction });
      }

      // 8. Bank Payment Methods (Métodos por Banco)
      const brm = [];
      const addBRM = (bName, mCode) => {
          const bid = getBankId(bName);
          const mid = getMethodId(mCode);
          if (bid && mid) brm.push({ bank: bid, payment_method: mid });
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

      if (brm.length > 0) {
        await queryInterface.bulkInsert('bank_payment_methods', brm, { transaction });
      }

      // Seed platform_bank_accounts
      const platformBankAccounts = [
        {
          id: 1,
          payment_method: 1, // Transferencia Bancaria (local)
          country: 2, // Chile
          is_global: false,
          currency: 2, // CLP
          account_details: JSON.stringify({ bankName: 'Banco Santander', accountNumber: '123456789', owner: 'Remesas SpA', rut: '76.123.456-7' }),
        },
        {
          id: 2,
          payment_method: 4, // Zelle (global)
          country: null,
          is_global: true,
          currency: 1, // USD
          account_details: JSON.stringify({ email: 'pagos@remesas.com', owner: 'Remesas LLC' }),
        }
      ];
      await queryInterface.bulkInsert('platform_bank_accounts', platformBankAccounts, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('bank_payment_methods', null, { transaction });
      await queryInterface.bulkDelete('country_payment_methods', null, { transaction });
      await queryInterface.bulkDelete('country_banks', null, { transaction });
      await queryInterface.bulkDelete('payment_methods', null, { transaction });
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

