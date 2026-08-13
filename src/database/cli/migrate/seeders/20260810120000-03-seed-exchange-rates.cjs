'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Obtenemos los IDs de los países
      const [countries] = await queryInterface.sequelize.query(
        'SELECT id, iso_code FROM countries;'
      );

      const getCountryId = (isoCode) => {
        const country = countries.find(c => c.iso_code === isoCode);
        return country ? country.id : null;
      };

      const veId = getCountryId('VE');
      const coId = getCountryId('CO');
      const usId = getCountryId('US');

      const now = new Date();

      const ratesToInsert = [];

      // Si tenemos los países requeridos
      if (usId && veId) {
        ratesToInsert.push({
          initial_country: usId,
          secondary_country: veId,
          rate: 42.50, // Ejemplo: 1 USD = 42.50 VES
          created_by: 1, // Suponiendo que el Admin (ID 1) lo creó
          created_at: now,
          updated_at: now
        });
      }

      if (coId && veId) {
        ratesToInsert.push({
          initial_country: coId,
          secondary_country: veId,
          rate: 0.0095, // Ejemplo: 1 COP = 0.0095 VES
          created_by: 1,
          created_at: now,
          updated_at: now
        });
      }

      if (usId && coId) {
        ratesToInsert.push({
          initial_country: usId,
          secondary_country: coId,
          rate: 4050.00, // Ejemplo: 1 USD = 4050 COP
          created_by: 1,
          created_at: now,
          updated_at: now
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
