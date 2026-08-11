const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'src', 'database', 'cli', 'migrate', 'migrations');

const tables = [
  // NO DEPENDENCIES
  {
    name: 'actions',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },
        description: { type: Sequelize.STRING(255) }`
  },
  {
    name: 'resources',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },
        description: { type: Sequelize.STRING(255) }`
  },
  {
    name: 'permission_types',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },
        description: { type: Sequelize.STRING(255) }`
  },
  {
    name: 'roles',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },
        description: { type: Sequelize.STRING(255) }`
  },
  {
    name: 'user_types',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        code: { allowNull: false, type: Sequelize.STRING(50), unique: true },
        description: { type: Sequelize.STRING(255) }`
  },
  {
    name: 'countries',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        iso_code: { allowNull: false, type: Sequelize.STRING(5), unique: true },
        name: { allowNull: false, type: Sequelize.STRING(100) },
        currency_symbol: { allowNull: false, type: Sequelize.STRING(10) }`
  },
  {
    name: 'remittance_statuses',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        code: { allowNull: false, type: Sequelize.STRING(50), unique: true },
        name: { allowNull: false, type: Sequelize.STRING(100) }`
  },
  {
    name: 'people',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        first_name: { allowNull: false, type: Sequelize.STRING(100) },
        last_name: { allowNull: false, type: Sequelize.STRING(100) },
        document_number: { allowNull: false, type: Sequelize.STRING(50), unique: true },
        phone: { allowNull: true, type: Sequelize.STRING(50) }`
  },
  
  // LEVEL 1 DEPENDENCIES
  {
    name: 'permissions',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        resource: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'resources', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        action: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'actions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        permission_type: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permission_types', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  {
    name: 'role_inheritances',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        parent_role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        child_role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }`
  },
  {
    name: 'banks',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        name: { allowNull: false, type: Sequelize.STRING(100) },
        code: { allowNull: false, type: Sequelize.STRING(50) },
        country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  {
    name: 'clients',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        person: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        origin_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  {
    name: 'employees',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        person: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  {
    name: 'users',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_type: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'user_types', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        person: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        email: { allowNull: false, type: Sequelize.STRING(150), unique: true },
        password_hash: { allowNull: false, type: Sequelize.STRING(255) }`
  },

  // LEVEL 2 DEPENDENCIES
  {
    name: 'role_permissions',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        permission: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }`
  },
  {
    name: 'user_roles',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }`
  },
  {
    name: 'user_permissions',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        permission: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        is_granted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }`
  },
  {
    name: 'user_sessions',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        device: { type: Sequelize.STRING(255) },
        device_id: { type: Sequelize.STRING(255) },
        jti: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        expires_at: { type: Sequelize.DATE, allowNull: false }`
  },
  {
    name: 'platform_bank_accounts',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        bank: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'banks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        account_details: { allowNull: false, type: Sequelize.JSONB },
        is_active: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: true }`
  },
  {
    name: 'user_countries',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        country_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  {
    name: 'exchange_rates',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        initial_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        secondary_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        rate: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        created_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' }`
  },
  {
    name: 'commissions',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        origin_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        destination_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        amount: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        is_percentage: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: false },
        created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  
  // LEVEL 3 DEPENDENCIES
  {
    name: 'remittances',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        client: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        origin_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        destination_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        amount_sent: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        amount_received: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
        exchange_rate_applied: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'exchange_rates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        commission_applied: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'commissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        platform_bank_account: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'platform_bank_accounts', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        recipient_account_details: { allowNull: false, type: Sequelize.JSONB },
        payment_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        emission_receipt_url: { type: Sequelize.STRING(255), allowNull: true },
        status: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'remittance_statuses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }`
  },
  {
    name: 'remittance_movements',
    columns: `
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
        remittance: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'remittances', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        status: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'remittance_statuses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        changed_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
        observation: { type: Sequelize.TEXT, allowNull: true }`
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
  const content = \`'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('\${table.name}', {
\${table.columns},
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
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
