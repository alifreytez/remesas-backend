'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Modifier Types
      await queryInterface.bulkInsert('modifier_types', [
        { name: 'Recargo (Fee)', created_at: new Date(), updated_at: new Date() },
        { name: 'Descuento (Discount)', created_at: new Date(), updated_at: new Date() },
        { name: 'Impuesto (Tax)', created_at: new Date(), updated_at: new Date() }
      ], { transaction });

      // Get types
      const [types] = await queryInterface.sequelize.query(
        'SELECT id, name FROM modifier_types;', { transaction }
      );
      const getTypeId = (name) => types.find(t => t.name === name)?.id;
      const feeId = getTypeId('Recargo (Fee)');
      const discountId = getTypeId('Descuento (Discount)');

      // Get admin user
      const [users] = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE email = 'admin@admin.com';", { transaction }
      );
      const adminId = users[0]?.id || 1;

      // 2. Price Modifiers
      if (feeId && discountId) {
        await queryInterface.bulkInsert('price_modifiers', [
          { 
            name: 'Tarifa Base Global', 
            modifier_type: feeId,
            amount: 5.00,
            is_percentage: false,
            created_by: adminId,
            created_at: new Date(),
            updated_at: new Date()
          },
          { 
            name: 'Descuento Promocional 10%', 
            modifier_type: discountId,
            amount: 10.00,
            is_percentage: true,
            created_by: adminId,
            created_at: new Date(),
            updated_at: new Date()
          }
        ], { transaction });
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
      await queryInterface.bulkDelete('price_modifiers', null, { transaction });
      await queryInterface.bulkDelete('modifier_types', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
