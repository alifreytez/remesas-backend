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

      // 2. Persona (Alirio)
      await queryInterface.bulkInsert('people', [
        { first_name: 'Alirio', last_name: 'Freytez', document_number: '28019240', phone: '0000000000' }
      ], { transaction });

      // Obtener IDs
      const [people] = await queryInterface.sequelize.query(
        `SELECT id FROM people WHERE document_number = '28019240'`,
        { transaction }
      );
      
      const [rolesAdmin] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE code = 'SUPERADMIN'`,
        { transaction }
      );

      const [userTypesAdmin] = await queryInterface.sequelize.query(
        `SELECT id FROM user_types WHERE code = 'ADMIN'`,
        { transaction }
      );

      const [userTypesClient] = await queryInterface.sequelize.query(
        `SELECT id FROM user_types WHERE code = 'CLIENT'`,
        { transaction }
      );

      const [countryVE] = await queryInterface.sequelize.query(
        `SELECT id FROM countries WHERE iso_code = 'VE'`,
        { transaction }
      );

      const personId = people[0].id;
      const roleAdminId = rolesAdmin[0].id;
      const userTypeAdminId = userTypesAdmin[0].id;
      const userTypeClientId = userTypesClient[0].id;
      const veId = countryVE[0].id;

      // 3. Insertar Clients y Employees
      await queryInterface.bulkInsert('employees', [
        { person: personId }
      ], { transaction });

      await queryInterface.bulkInsert('clients', [
        { person: personId, origin_country: veId }
      ], { transaction });

      // 4. Users (Admin and Client)
      const passwordHash = bcrypt.hashSync('28019240', 10);
      await queryInterface.bulkInsert('users', [
        { 
          username: '28019240R', // Admin username
          user_type: userTypeAdminId,
          person: personId,
          email: 'pastoralirio6589@gmail.com',
          password_hash: passwordHash
        },
        { 
          username: '28019240', // Client username
          user_type: userTypeClientId,
          person: personId,
          email: 'pastoralirio6589@gmail.com',
          password_hash: passwordHash
        }
      ], { transaction });

      // Obtener ID del usuario insertado (Admin) para asignarle el rol SUPERADMIN
      const [users] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE username = '28019240R'`,
        { transaction }
      );
      const userAdminId = users[0].id;

      // 5. Asignar rol al usuario admin
      await queryInterface.bulkInsert('user_roles', [
        { user_id: userAdminId, role: roleAdminId }
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
      await queryInterface.bulkDelete('users', { email: 'pastoralirio6589@gmail.com' }, { transaction });
      await queryInterface.bulkDelete('clients', null, { transaction });
      await queryInterface.bulkDelete('employees', null, { transaction });
      await queryInterface.bulkDelete('people', { document_number: '28019240' }, { transaction });
      await queryInterface.bulkDelete('roles', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
