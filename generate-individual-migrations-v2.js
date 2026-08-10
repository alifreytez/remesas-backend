const fs = require('fs');
const path = require('path');

const migrationsDir = path.join('/home/alifreytez/remesas/backend/src/database/cli/migrate/migrations');

const tables = [
  // NO DEPENDENCIES
  {
    name: 'actions',
    columns: `        code: { allowNull: false, type: Sequelize.STRING(100) },
        description: { type: Sequelize.STRING(255) }`,
    uniques: ['code'],
    fks: []
  },
  {
    name: 'resources',
    columns: `        code: { allowNull: false, type: Sequelize.STRING(100) },
        description: { type: Sequelize.STRING(255) }`,
    uniques: ['code'],
    fks: []
  },
  {
    name: 'permission_types',
    columns: `        code: { allowNull: false, type: Sequelize.STRING(100) },
        description: { type: Sequelize.STRING(255) }`,
    uniques: ['code'],
    fks: []
  },
  {
    name: 'roles',
    columns: `        code: { allowNull: false, type: Sequelize.STRING(100) },
        description: { type: Sequelize.STRING(255) }`,
    uniques: ['code'],
    fks: []
  },
  {
    name: 'user_types',
    columns: `        code: { allowNull: false, type: Sequelize.STRING(50) },
        description: { type: Sequelize.STRING(255) }`,
    uniques: ['code'],
    fks: []
  },
  {
    name: 'countries',
    columns: `        iso_code: { allowNull: false, type: Sequelize.STRING(5) },
        name: { allowNull: false, type: Sequelize.STRING(100) },
        currency_symbol: { allowNull: false, type: Sequelize.STRING(10) }`,
    uniques: ['iso_code'],
    fks: []
  },
  {
    name: 'remittance_statuses',
    columns: `        code: { allowNull: false, type: Sequelize.STRING(50) },
        name: { allowNull: false, type: Sequelize.STRING(100) }`,
    uniques: ['code'],
    fks: []
  },
  {
    name: 'people',
    columns: `        first_name: { allowNull: false, type: Sequelize.STRING(100) },
        last_name: { allowNull: false, type: Sequelize.STRING(100) },
        document_number: { allowNull: false, type: Sequelize.STRING(50) },
        phone: { allowNull: true, type: Sequelize.STRING(50) }`,
    uniques: ['document_number'],
    fks: []
  },
  
  // LEVEL 1 DEPENDENCIES
  {
    name: 'permissions',
    columns: `        resource: { type: Sequelize.INTEGER, allowNull: false },
        action: { type: Sequelize.INTEGER, allowNull: false },
        permission_type: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'resource', table: 'resources' },
        { field: 'action', table: 'actions' },
        { field: 'permission_type', table: 'permission_types' }
    ]
  },
  {
    name: 'role_inheritances',
    columns: `        parent_role: { type: Sequelize.INTEGER, allowNull: false },
        child_role: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'parent_role', table: 'roles' },
        { field: 'child_role', table: 'roles' }
    ]
  },
  {
    name: 'banks',
    columns: `        name: { allowNull: false, type: Sequelize.STRING(100) },
        code: { allowNull: false, type: Sequelize.STRING(50) },
        country: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'country', table: 'countries' }
    ]
  },
  {
    name: 'clients',
    columns: `        person: { type: Sequelize.INTEGER, allowNull: false },
        origin_country: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: ['person'], // A person can only be one client
    fks: [
        { field: 'person', table: 'people' },
        { field: 'origin_country', table: 'countries' }
    ]
  },
  {
    name: 'employees',
    columns: `        person: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: ['person'],
    fks: [
        { field: 'person', table: 'people' }
    ]
  },
  {
    name: 'users',
    columns: `        user_type: { type: Sequelize.INTEGER, allowNull: false },
        person: { type: Sequelize.INTEGER, allowNull: false },
        email: { allowNull: false, type: Sequelize.STRING(150) },
        password_hash: { allowNull: false, type: Sequelize.STRING(255) }`,
    uniques: ['email'],
    fks: [
        { field: 'user_type', table: 'user_types' },
        { field: 'person', table: 'people' }
    ]
  },

  // LEVEL 2 DEPENDENCIES
  {
    name: 'role_permissions',
    columns: `        role: { type: Sequelize.INTEGER, allowNull: false },
        permission: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'role', table: 'roles' },
        { field: 'permission', table: 'permissions' }
    ]
  },
  {
    name: 'user_roles',
    columns: `        user_id: { type: Sequelize.INTEGER, allowNull: false },
        role: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'user_id', table: 'users' },
        { field: 'role', table: 'roles' }
    ]
  },
  {
    name: 'user_permissions',
    columns: `        user_id: { type: Sequelize.INTEGER, allowNull: false },
        permission: { type: Sequelize.INTEGER, allowNull: false },
        is_granted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }`,
    uniques: [],
    fks: [
        { field: 'user_id', table: 'users' },
        { field: 'permission', table: 'permissions' }
    ]
  },
  {
    name: 'user_sessions',
    columns: `        user_id: { type: Sequelize.INTEGER, allowNull: false },
        device: { type: Sequelize.STRING(255) },
        device_id: { type: Sequelize.STRING(255) },
        jti: { type: Sequelize.STRING(255), allowNull: false },
        expires_at: { type: Sequelize.DATE, allowNull: false }`,
    uniques: ['jti'],
    fks: [
        { field: 'user_id', table: 'users' }
    ]
  },
  {
    name: 'platform_bank_accounts',
    columns: `        bank: { type: Sequelize.INTEGER, allowNull: false },
        account_details: { allowNull: false, type: Sequelize.JSONB },
        is_active: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: true }`,
    uniques: [],
    fks: [
        { field: 'bank', table: 'banks' }
    ]
  },
  {
    name: 'user_countries',
    columns: `        user_id: { type: Sequelize.INTEGER, allowNull: false },
        country_id: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'user_id', table: 'users' },
        { field: 'country_id', table: 'countries' }
    ]
  },
  {
    name: 'exchange_rates',
    columns: `        initial_country: { type: Sequelize.INTEGER, allowNull: false },
        secondary_country: { type: Sequelize.INTEGER, allowNull: false },
        rate: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        created_by: { type: Sequelize.INTEGER, allowNull: true }`,
    uniques: [],
    fks: [
        { field: 'initial_country', table: 'countries' },
        { field: 'secondary_country', table: 'countries' },
        { field: 'created_by', table: 'users' }
    ]
  },
  {
    name: 'commissions',
    columns: `        origin_country: { type: Sequelize.INTEGER, allowNull: false },
        destination_country: { type: Sequelize.INTEGER, allowNull: false },
        amount: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        is_percentage: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: false },
        created_by: { type: Sequelize.INTEGER, allowNull: false }`,
    uniques: [],
    fks: [
        { field: 'origin_country', table: 'countries' },
        { field: 'destination_country', table: 'countries' },
        { field: 'created_by', table: 'users' }
    ]
  },
  
  // LEVEL 3 DEPENDENCIES
  {
    name: 'remittances',
    columns: `        client: { type: Sequelize.INTEGER, allowNull: false },
        origin_country: { type: Sequelize.INTEGER, allowNull: false },
        destination_country: { type: Sequelize.INTEGER, allowNull: false },
        amount_sent: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        amount_received: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        exchange_rate_applied: { type: Sequelize.INTEGER, allowNull: false },
        commission_applied: { type: Sequelize.INTEGER, allowNull: false },
        platform_bank_account: { type: Sequelize.INTEGER, allowNull: false },
        recipient_account_details: { allowNull: false, type: Sequelize.JSONB },
        payment_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        emission_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        status: { type: Sequelize.INTEGER, allowNull: true }`,
    uniques: [],
    fks: [
        { field: 'client', table: 'clients' },
        { field: 'origin_country', table: 'countries' },
        { field: 'destination_country', table: 'countries' },
        { field: 'exchange_rate_applied', table: 'exchange_rates' },
        { field: 'commission_applied', table: 'commissions' },
        { field: 'platform_bank_account', table: 'platform_bank_accounts' },
        { field: 'status', table: 'remittance_statuses' }
    ]
  },
  {
    name: 'remittance_movements',
    columns: `        remittance: { type: Sequelize.INTEGER, allowNull: false },
        status: { type: Sequelize.INTEGER, allowNull: false },
        changed_by: { type: Sequelize.INTEGER, allowNull: false },
        observation: { type: Sequelize.TEXT, allowNull: true }`,
    uniques: [],
    fks: [
        { field: 'remittance', table: 'remittances' },
        { field: 'status', table: 'remittance_statuses' },
        { field: 'changed_by', table: 'users' }
    ]
  }
];

const pad = (num) => num.toString().padStart(2, '0');
const generateTimestamp = (index) => {
  const d = new Date('2026-08-10T10:00:00Z');
  d.setMinutes(d.getMinutes() + index);
  return \`\${d.getFullYear()}\${pad(d.getMonth() + 1)}\${pad(d.getDate())}\${pad(d.getHours())}\${pad(d.getMinutes())}00\`;
};

tables.forEach((table, i) => {
  const filename = \`\${generateTimestamp(i)}-\${pad(i+1)}-create-\${table.name}.cjs\`;
  
  let queries = \`\`;
  
  // 1. Uniques (addIndex)
  table.uniques.forEach(u => {
      queries += \`
      await queryInterface.addIndex({ tableName: '\${table.name}' }, ['\${u}'], {
        unique: true,
        where: { deleted_at: null },
        name: 'uq_\${table.name}_\${u}',
        transaction
      });\`;
  });

  // 2. FKs (addConstraint)
  table.fks.forEach(fk => {
      queries += \`
      await queryInterface.addConstraint({ tableName: '\${table.name}' }, {
        fields: ['\${fk.field}'],
        type: 'foreign key',
        name: 'fk_\${table.name}_\${fk.field}',
        references: { table: { tableName: '\${fk.table}' }, field: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        transaction,
      });\`;
  });

  const content = \`'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('\${table.name}', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
\${table.columns},
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
\${queries}
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('\${table.name}', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
\`;
  
  fs.writeFileSync(path.join(migrationsDir, filename), content);
  console.log(\`Created \${filename}\`);
});
