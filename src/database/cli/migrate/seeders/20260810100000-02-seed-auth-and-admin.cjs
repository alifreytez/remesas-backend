'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // ============================================
      // 1. CREACIÓN DE ROLES Y JERARQUÍA (HERENCIA)
      // ============================================
      await queryInterface.bulkInsert('roles', [
        { code: 'SUPERADMIN', description: 'Super Administrador del Sistema' },
        { code: 'MANAGER', description: 'Gerente' },
        { code: 'OPERATOR', description: 'Operador de Remesas' }
      ], { transaction });

      const [rolesSuperAdmin] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE code = 'SUPERADMIN'`, { transaction });
      const [rolesManager] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE code = 'MANAGER'`, { transaction });
      const [rolesOperator] = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE code = 'OPERATOR'`, { transaction });

      const roleSuperAdminId = rolesSuperAdmin[0].id;
      const roleManagerId = rolesManager[0].id;
      const roleOperatorId = rolesOperator[0].id;

      // Herencia de roles (El child hereda los permisos del parent)
      await queryInterface.bulkInsert('role_inheritances', [
        { child_role: roleSuperAdminId, parent_role: roleManagerId }, // SuperAdmin hereda de Manager
        { child_role: roleManagerId, parent_role: roleOperatorId }    // Manager hereda de Operator
      ], { transaction, ignoreDuplicates: true });

      // ============================================
      // 2. CREACIÓN DE PERMISOS BASE
      // ============================================
      await queryInterface.bulkInsert('permission_types', [
        { code: 'UI', description: 'Interfaz de Usuario' },
        { code: 'API', description: 'Rutas de API' },
        { code: 'CRUD', description: 'Operaciones de Catálogo' }
      ], { transaction, ignoreDuplicates: true });

      await queryInterface.bulkInsert('actions', [
        { code: 'VIEW', description: 'Acción de Vista' },
        { code: 'READ', description: 'Acción de Lectura' },
        { code: 'CREATE', description: 'Acción de Creación' },
        { code: 'UPDATE', description: 'Acción de Actualización' },
        { code: 'DELETE', description: 'Acción de Eliminación' },
        { code: 'RESTORE', description: 'Acción de Restauración' },
        { code: 'MANAGE', description: 'Control Total' }
      ], { transaction, ignoreDuplicates: true });

      await queryInterface.bulkInsert('resources', [
        { code: 'DASHBOARD_STATS', description: 'Ver Dashboard Estadísticas' },
        { code: 'REMITTANCES', description: 'Gestión de Remesas' },
        { code: 'USERS', description: 'Gestión de Usuarios' },
        { code: 'CONFIGS', description: 'Configuraciones del Sistema' },
        { code: 'BANK-RECEIVING-METHODS', description: 'Catálogo Métodos por Banco' },
        { code: 'BANKS', description: 'Catálogo Bancos' },
        { code: 'EXCHANGE-RATES', description: 'Catálogo Tasas de Cambio' },
        { code: 'COUNTRIES', description: 'Catálogo Países' },
        { code: 'CURRENCIES', description: 'Catálogo Monedas' },
        { code: 'RECEIVING-METHODS', description: 'Catálogo Métodos de Recepción' },
        { code: 'COUNTRY-RECEIVING-METHODS', description: 'Catálogo Métodos por País' },
        { code: 'REMITTANCE-STATUSES', description: 'Catálogo Estados de Remesa' },
        { code: 'USER-TYPES', description: 'Catálogo Tipos de Usuario' },
        { code: 'ROLES', description: 'Catálogo Roles' },
        { code: 'CONTACTS', description: 'Agenda de Contactos' }
      ], { transaction, ignoreDuplicates: true });

      const [ptUI] = await queryInterface.sequelize.query(`SELECT id FROM permission_types WHERE code = 'UI'`, { transaction });
      const [ptAPI] = await queryInterface.sequelize.query(`SELECT id FROM permission_types WHERE code = 'API'`, { transaction });
      const [ptCRUD] = await queryInterface.sequelize.query(`SELECT id FROM permission_types WHERE code = 'CRUD'`, { transaction });
      
      const ptUIId = ptUI[0].id;
      const ptAPIId = ptAPI[0].id;
      const ptCRUDId = ptCRUD[0].id;

      const [actions] = await queryInterface.sequelize.query(`SELECT id, code FROM actions`, { transaction });
      const [resources] = await queryInterface.sequelize.query(`SELECT id, code FROM resources`, { transaction });

      // Generar todas las combinaciones lógicas
      const permissionsToInsert = [];
      const permissionTypes = [{ id: ptUIId, code: 'UI' }, { id: ptAPIId, code: 'API' }, { id: ptCRUDId, code: 'CRUD' }];
      
      for (const pt of permissionTypes) {
        for (const act of actions) {
          for (const res of resources) {
            permissionsToInsert.push({
              permission_type: pt.id,
              action: act.id,
              resource: res.id
            });
          }
        }
      }

      await queryInterface.bulkInsert('permissions', permissionsToInsert, { transaction, ignoreDuplicates: true });

      const [allPerms] = await queryInterface.sequelize.query(`
        SELECT p.id, r.code as resource_code, a.code as action_code, pt.code as type_code
        FROM permissions p
        JOIN resources r ON p.resource = r.id
        JOIN actions a ON p.action = a.id
        JOIN permission_types pt ON p.permission_type = pt.id
      `, { transaction });

      // Asignar Permisos a Roles (Con la herencia, solo necesitamos asignar lo que es único o base para cada nivel)
      // - OPERATOR solo interactúa con Remesas y Dashboard
      const operatorPermIds = allPerms.filter(p => ['DASHBOARD_STATS', 'REMITTANCES'].includes(p.resource_code)).map(p => p.id);
      
      // - MANAGER ve y gestiona Usuarios adicionalmente a lo del Operator
      const managerPermIds = allPerms.filter(p => ['USERS', 'CONTACTS'].includes(p.resource_code)).map(p => p.id);
      
      // - SUPERADMIN ya no recibe asignaciones porque hace bypass global.

      const rolePermissionsToInsert = [
        ...operatorPermIds.map(id => ({ role: roleOperatorId, permission: id })),
        ...managerPermIds.map(id => ({ role: roleManagerId, permission: id }))
      ];

      await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert, { transaction, ignoreDuplicates: true });

      // ============================================
      // 3. CREACIÓN DE USUARIOS
      // ============================================
      await queryInterface.bulkInsert('people', [
        { first_name: 'Alirio', last_name: 'Freytez', document_number: '28019240', phone: '0000000000' },
        { first_name: 'Carlos', last_name: 'Gomez', document_number: '123456789', phone: '1111111111' },
        { first_name: 'Ana', last_name: 'Martinez', document_number: '987654321', phone: '2222222222' }
      ], { transaction });

      const [peopleAdmin] = await queryInterface.sequelize.query(`SELECT id FROM people WHERE document_number = '28019240'`, { transaction });
      const [peopleOperator] = await queryInterface.sequelize.query(`SELECT id FROM people WHERE document_number = '123456789'`, { transaction });
      const [peopleManager] = await queryInterface.sequelize.query(`SELECT id FROM people WHERE document_number = '987654321'`, { transaction });

      const [userTypesAdmin] = await queryInterface.sequelize.query(`SELECT id FROM user_types WHERE code = 'ADMIN'`, { transaction });
      const [userTypesClient] = await queryInterface.sequelize.query(`SELECT id FROM user_types WHERE code = 'CLIENT'`, { transaction });
      const [countryVE] = await queryInterface.sequelize.query(`SELECT id FROM countries WHERE iso_code = 'VE'`, { transaction });

      const personAdminId = peopleAdmin[0].id;
      const personOpId = peopleOperator[0].id;
      const personManId = peopleManager[0].id;
      
      const userTypeAdminId = userTypesAdmin[0].id;
      const userTypeClientId = userTypesClient[0].id;
      const veId = countryVE[0].id;

      await queryInterface.bulkInsert('employees', [
        { person: personAdminId },
        { person: personOpId },
        { person: personManId }
      ], { transaction });

      await queryInterface.bulkInsert('clients', [
        { person: personAdminId, origin_country: veId },
        { person: personOpId, origin_country: veId },
        { person: personManId, origin_country: veId }
      ], { transaction });

      const passAdmin = bcrypt.hashSync('28019240', 10);
      const passOp = bcrypt.hashSync('123456789', 10);
      const passMan = bcrypt.hashSync('987654321', 10);
      
      await queryInterface.bulkInsert('users', [
        { 
          username: 'R28019240',
          user_type: userTypeAdminId,
          person: personAdminId,
          country: veId,
          email: 'pastoralirio6589@gmail.com',
          password_hash: passAdmin
        },
        { 
          username: '28019240',
          user_type: userTypeClientId,
          person: personAdminId,
          country: veId,
          email: 'pastoralirio6589@gmail.com',
          password_hash: passAdmin
        },
        { 
          username: 'R123456789',
          user_type: userTypeAdminId, 
          person: personOpId,
          country: veId,
          email: 'operador@remesas.com',
          password_hash: passOp
        },
        { 
          username: 'R987654321',
          user_type: userTypeAdminId, 
          person: personManId,
          country: veId,
          email: 'gerente@remesas.com',
          password_hash: passMan
        }
      ], { transaction });

      const [uAdmin] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE username = 'R28019240'`, { transaction });
      const [uOp] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE username = 'R123456789'`, { transaction });
      const [uMan] = await queryInterface.sequelize.query(`SELECT id FROM users WHERE username = 'R987654321'`, { transaction });

      await queryInterface.bulkInsert('user_roles', [
        { user: uAdmin[0].id, role: roleSuperAdminId },
        { user: uOp[0].id, role: roleOperatorId },
        { user: uMan[0].id, role: roleManagerId }
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
      await queryInterface.bulkDelete('users', { 
          username: ['R28019240', '28019240', 'R123456789', 'R987654321'] 
      }, { transaction });
      await queryInterface.bulkDelete('clients', null, { transaction });
      await queryInterface.bulkDelete('employees', null, { transaction });
      await queryInterface.bulkDelete('people', { 
          document_number: ['28019240', '123456789', '987654321'] 
      }, { transaction });
      await queryInterface.bulkDelete('role_permissions', null, { transaction });
      await queryInterface.bulkDelete('permissions', null, { transaction });
      await queryInterface.bulkDelete('resources', null, { transaction });
      await queryInterface.bulkDelete('actions', null, { transaction });
      await queryInterface.bulkDelete('permission_types', null, { transaction });
      await queryInterface.bulkDelete('role_inheritances', null, { transaction });
      await queryInterface.bulkDelete('roles', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
