$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"

$tables = @(
    @{ name='actions'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },`n        description: { type: Sequelize.STRING(255) }" },
    @{ name='resources'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },`n        description: { type: Sequelize.STRING(255) }" },
    @{ name='permission_types'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },`n        description: { type: Sequelize.STRING(255) }" },
    @{ name='roles'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        code: { allowNull: false, type: Sequelize.STRING(100), unique: true },`n        description: { type: Sequelize.STRING(255) }" },
    @{ name='user_types'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        code: { allowNull: false, type: Sequelize.STRING(50), unique: true },`n        description: { type: Sequelize.STRING(255) }" },
    @{ name='countries'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        iso_code: { allowNull: false, type: Sequelize.STRING(5), unique: true },`n        name: { allowNull: false, type: Sequelize.STRING(100) },`n        currency_symbol: { allowNull: false, type: Sequelize.STRING(10) }" },
    @{ name='remittance_statuses'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        code: { allowNull: false, type: Sequelize.STRING(50), unique: true },`n        name: { allowNull: false, type: Sequelize.STRING(100) }" },
    @{ name='people'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        first_name: { allowNull: false, type: Sequelize.STRING(100) },`n        last_name: { allowNull: false, type: Sequelize.STRING(100) },`n        document_number: { allowNull: false, type: Sequelize.STRING(50), unique: true },`n        phone: { allowNull: true, type: Sequelize.STRING(50) }" },
    
    @{ name='permissions'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        resource: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'resources', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        action: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'actions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        permission_type: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permission_types', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    @{ name='role_inheritances'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        parent_role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },`n        child_role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }" },
    @{ name='banks'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        name: { allowNull: false, type: Sequelize.STRING(100) },`n        code: { allowNull: false, type: Sequelize.STRING(50) },`n        country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    @{ name='clients'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        person: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        origin_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    @{ name='employees'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        person: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    @{ name='users'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        user_type: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'user_types', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        person: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'people', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        email: { allowNull: false, type: Sequelize.STRING(150), unique: true },`n        password_hash: { allowNull: false, type: Sequelize.STRING(255) }" },
    
    @{ name='role_permissions'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },`n        permission: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }" },
    @{ name='user_roles'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },`n        role: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' }" },
    @{ name='user_permissions'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },`n        permission: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },`n        is_granted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: `$true }" },
    @{ name='user_sessions'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },`n        device: { type: Sequelize.STRING(255) },`n        device_id: { type: Sequelize.STRING(255) },`n        jti: { type: Sequelize.STRING(255), allowNull: false, unique: true },`n        expires_at: { type: Sequelize.DATE, allowNull: false }" },
    @{ name='platform_bank_accounts'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        bank: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'banks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        account_details: { allowNull: false, type: Sequelize.JSONB },`n        is_active: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: `$true }" },
    @{ name='user_countries'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        country_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    @{ name='exchange_rates'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        initial_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        secondary_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        rate: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        created_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' }" },
    @{ name='commissions'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        origin_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        destination_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        amount: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        is_percentage: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: `$false },`n        created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    
    @{ name='remittances'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        client: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clients', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        origin_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        destination_country: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        amount_sent: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        amount_received: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        exchange_rate_applied: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'exchange_rates', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        commission_applied: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'commissions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        platform_bank_account: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'platform_bank_accounts', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        recipient_account_details: { allowNull: false, type: Sequelize.JSONB },`n        payment_receipt_url: { type: Sequelize.STRING(255), allowNull: true },`n        emission_receipt_url: { type: Sequelize.STRING(255), allowNull: true },`n        status: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'remittance_statuses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' }" },
    @{ name='remittance_movements'; columns="        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },`n        remittance: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'remittances', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        status: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'remittance_statuses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        changed_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },`n        observation: { type: Sequelize.TEXT, allowNull: true }" }
)

$baseDate = [datetime]"2026-08-10T10:00:00Z"
for ($i = 0; $i -lt $tables.Count; $i++) {
    $table = $tables[$i]
    $d = $baseDate.AddMinutes($i)
    $ts = $d.ToString("yyyyMMddHHmmss")
    $seq = ($i + 1).ToString("00")
    $filename = "${ts}-${seq}-create-$($table.name).cjs"
    
    # We replace the JS boolean values injected from PS strings
    $cols = $table.columns.Replace("`$true", "true").Replace("`$false", "false")
    
    $content = @"
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('$($table.name)', {
$cols,
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
      await queryInterface.dropTable('$($table.name)', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
"@
    
    $outPath = Join-Path $migrationsDir $filename
    [System.IO.File]::WriteAllText($outPath, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output "Created $filename"
}
