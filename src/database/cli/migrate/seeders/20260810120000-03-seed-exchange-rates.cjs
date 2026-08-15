'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Obtenemos los IDs de las monedas
      const [currencies] = await queryInterface.sequelize.query(
        'SELECT id, iso_code FROM currencies;', { transaction }
      );

      const getCurrencyId = (isoCode) => {
        const c = currencies.find(c => c.iso_code === isoCode);
        return c ? c.id : null;
      };

      const vesId = getCurrencyId('VES');
      const penId = getCurrencyId('PEN');
      const clpId = getCurrencyId('CLP');
      const usdId = getCurrencyId('USD');

      const now = new Date();
      const ratesToInsert = [];

      // USA a Venezuela (USD a VES)
      if (usdId && vesId) {
        ratesToInsert.push({
          initial_currency: usdId,
          secondary_currency: vesId,
          rate: 42.50, // 1 USD = 42.50 VES
          created_by: null, 
          created_at: now,
          updated_at: now,
          deleted_at: null
        });
      }

      // Perú a Venezuela (PEN a VES)
      if (penId && vesId) {
        ratesToInsert.push({
          initial_currency: penId,
          secondary_currency: vesId,
          rate: 11.20, // 1 PEN = 11.20 VES
          created_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        });
      }

      // Chile a Venezuela (CLP a VES)
      if (clpId && vesId) {
        ratesToInsert.push({
          initial_currency: clpId,
          secondary_currency: vesId,
          rate: 0.045, // 1 CLP = 0.045 VES
          created_by: null,
          created_at: now,
          updated_at: now,
          deleted_at: null
        });
      }

      if (ratesToInsert.length > 0) {
        await queryInterface.bulkInsert('exchange_rates', ratesToInsert, { transaction });
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
      await queryInterface.bulkDelete('exchange_rates', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
