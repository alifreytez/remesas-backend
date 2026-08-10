'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Roles
      await queryInterface.bulkInsert('roles', [
        { code: 'SUPERADMIN', description: 'Super Administrador del Sistema' },
        { code: 'OPERATOR', description: 'Operador de Remesas' },
        { code: 'CLIENT', description: 'Cliente Regular' }
      ], { transaction });

      // 2. Persona (Admin)
      await queryInterface.bulkInsert('people', [
        { first_name: 'Admin', last_name: 'System', document_number: 'V-00000000', phone: '0000000000' }
      ], { transaction });

      // Obtener el ID de la persona, del rol de superadmin y del user_type admin
      const [people] = await queryInterface.sequelize.query(
        `SELECT id FROM people WHERE document_number = 'V-00000000'`,
        { transaction }
      );
      
      const [roles] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE code = 'SUPERADMIN'`,
        { transaction }
      );

      const [userTypes] = await queryInterface.sequelize.query(
        `SELECT id FROM user_types WHERE code = 'ADMIN'`,
        { transaction }
      );

      const personId = people[0].id;
      const roleId = roles[0].id;
      const userTypeId = userTypes[0].id;

      // 3. User
      const passwordHash = bcrypt.hashSync('Admin123$', 10);
      await queryInterface.bulkInsert('users', [
        { 
          user_type: userTypeId,
          person: personId,
          email: 'admin@remesas.com',
          password_hash: passwordHash
        }
      ], { transaction });

      // Obtener ID del usuario insertado
      const [users] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = 'admin@remesas.com'`,
        { transaction }
      );
      const userId = users[0].id;

      // 4. Asignar rol al usuario
      await queryInterface.bulkInsert('user_roles', [
        { user_id: userId, role: roleId }
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
      await queryInterface.bulkDelete('user_roles', null, { transaction });
      await queryInterface.bulkDelete('users', { email: 'admin@remesas.com' }, { transaction });
      await queryInterface.bulkDelete('people', { document_number: 'V-00000000' }, { transaction });
      await queryInterface.bulkDelete('roles', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
