$migrationsDir = "z:\home\alifreytez\remesas\backend\src\database\cli\migrate\migrations"

$tables = @(
  @{
    name = 'actions'
    cols = "        code: { allowNull: false, type: Sequelize.STRING(100) },`n        description: { type: Sequelize.STRING(255) }"
    uniques = @('code')
    fks = @()
  },
  @{
    name = 'resources'
    cols = "        code: { allowNull: false, type: Sequelize.STRING(100) },`n        description: { type: Sequelize.STRING(255) }"
    uniques = @('code')
    fks = @()
  },
  @{
    name = 'permission_types'
    cols = "        code: { allowNull: false, type: Sequelize.STRING(100) },`n        description: { type: Sequelize.STRING(255) }"
    uniques = @('code')
    fks = @()
  },
  @{
    name = 'roles'
    cols = "        code: { allowNull: false, type: Sequelize.STRING(100) },`n        description: { type: Sequelize.STRING(255) }"
    uniques = @('code')
    fks = @()
  },
  @{
    name = 'user_types'
    cols = "        code: { allowNull: false, type: Sequelize.STRING(50) },`n        description: { type: Sequelize.STRING(255) }"
    uniques = @('code')
    fks = @()
  },
  @{
    name = 'countries'
    cols = "        iso_code: { allowNull: false, type: Sequelize.STRING(5) },`n        name: { allowNull: false, type: Sequelize.STRING(100) },`n        currency_symbol: { allowNull: false, type: Sequelize.STRING(10) }"
    uniques = @('iso_code')
    fks = @()
  },
  @{
    name = 'remittance_statuses'
    cols = "        code: { allowNull: false, type: Sequelize.STRING(50) },`n        name: { allowNull: false, type: Sequelize.STRING(100) }"
    uniques = @('code')
    fks = @()
  },
  @{
    name = 'people'
    cols = "        first_name: { allowNull: false, type: Sequelize.STRING(100) },`n        last_name: { allowNull: false, type: Sequelize.STRING(100) },`n        document_number: { allowNull: false, type: Sequelize.STRING(50) },`n        phone: { allowNull: true, type: Sequelize.STRING(50) }"
    uniques = @('document_number')
    fks = @()
  },
  
  @{
    name = 'permissions'
    cols = "        resource: { type: Sequelize.INTEGER, allowNull: false },`n        action: { type: Sequelize.INTEGER, allowNull: false },`n        permission_type: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='resource'; table='resources' },
        @{ field='action'; table='actions' },
        @{ field='permission_type'; table='permission_types' }
    )
  },
  @{
    name = 'role_inheritances'
    cols = "        parent_role: { type: Sequelize.INTEGER, allowNull: false },`n        child_role: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='parent_role'; table='roles' },
        @{ field='child_role'; table='roles' }
    )
  },
  @{
    name = 'banks'
    cols = "        name: { allowNull: false, type: Sequelize.STRING(100) },`n        code: { allowNull: false, type: Sequelize.STRING(50) },`n        country: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='country'; table='countries' }
    )
  },
  @{
    name = 'clients'
    cols = "        person: { type: Sequelize.INTEGER, allowNull: false },`n        origin_country: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @('person')
    fks = @(
        @{ field='person'; table='people' },
        @{ field='origin_country'; table='countries' }
    )
  },
  @{
    name = 'employees'
    cols = "        person: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @('person')
    fks = @(
        @{ field='person'; table='people' }
    )
  },
  @{
    name = 'users'
    cols = "        user_type: { type: Sequelize.INTEGER, allowNull: false },`n        person: { type: Sequelize.INTEGER, allowNull: false },`n        email: { allowNull: false, type: Sequelize.STRING(150) },`n        password_hash: { allowNull: false, type: Sequelize.STRING(255) }"
    uniques = @('email')
    fks = @(
        @{ field='user_type'; table='user_types' },
        @{ field='person'; table='people' }
    )
  },

  @{
    name = 'role_permissions'
    cols = "        role: { type: Sequelize.INTEGER, allowNull: false },`n        permission: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='role'; table='roles' },
        @{ field='permission'; table='permissions' }
    )
  },
  @{
    name = 'user_roles'
    cols = "        user_id: { type: Sequelize.INTEGER, allowNull: false },`n        role: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='user_id'; table='users' },
        @{ field='role'; table='roles' }
    )
  },
  @{
    name = 'user_permissions'
    cols = "        user_id: { type: Sequelize.INTEGER, allowNull: false },`n        permission: { type: Sequelize.INTEGER, allowNull: false },`n        is_granted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }"
    uniques = @()
    fks = @(
        @{ field='user_id'; table='users' },
        @{ field='permission'; table='permissions' }
    )
  },
  @{
    name = 'user_sessions'
    cols = "        user_id: { type: Sequelize.INTEGER, allowNull: false },`n        device: { type: Sequelize.STRING(255) },`n        device_id: { type: Sequelize.STRING(255) },`n        jti: { type: Sequelize.STRING(255), allowNull: false },`n        expires_at: { type: Sequelize.DATE, allowNull: false }"
    uniques = @('jti')
    fks = @(
        @{ field='user_id'; table='users' }
    )
  },
  @{
    name = 'platform_bank_accounts'
    cols = "        bank: { type: Sequelize.INTEGER, allowNull: false },`n        account_details: { allowNull: false, type: Sequelize.JSONB },`n        is_active: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: true }"
    uniques = @()
    fks = @(
        @{ field='bank'; table='banks' }
    )
  },
  @{
    name = 'user_countries'
    cols = "        user_id: { type: Sequelize.INTEGER, allowNull: false },`n        country_id: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='user_id'; table='users' },
        @{ field='country_id'; table='countries' }
    )
  },
  @{
    name = 'exchange_rates'
    cols = "        initial_country: { type: Sequelize.INTEGER, allowNull: false },`n        secondary_country: { type: Sequelize.INTEGER, allowNull: false },`n        rate: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        created_by: { type: Sequelize.INTEGER, allowNull: true }"
    uniques = @()
    fks = @(
        @{ field='initial_country'; table='countries' },
        @{ field='secondary_country'; table='countries' },
        @{ field='created_by'; table='users' }
    )
  },
  @{
    name = 'commissions'
    cols = "        origin_country: { type: Sequelize.INTEGER, allowNull: false },`n        destination_country: { type: Sequelize.INTEGER, allowNull: false },`n        amount: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        is_percentage: { allowNull: false, type: Sequelize.BOOLEAN, defaultValue: false },`n        created_by: { type: Sequelize.INTEGER, allowNull: false }"
    uniques = @()
    fks = @(
        @{ field='origin_country'; table='countries' },
        @{ field='destination_country'; table='countries' },
        @{ field='created_by'; table='users' }
    )
  },
  
  @{
    name = 'remittances'
    cols = "        client: { type: Sequelize.INTEGER, allowNull: false },`n        origin_country: { type: Sequelize.INTEGER, allowNull: false },`n        destination_country: { type: Sequelize.INTEGER, allowNull: false },`n        amount_sent: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        amount_received: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },`n        exchange_rate_applied: { type: Sequelize.INTEGER, allowNull: false },`n        commission_applied: { type: Sequelize.INTEGER, allowNull: false },`n        platform_bank_account: { type: Sequelize.INTEGER, allowNull: false },`n        recipient_account_details: { allowNull: false, type: Sequelize.JSONB },`n        payment_receipt_url: { type: Sequelize.STRING(255), allowNull: true },`n        emission_receipt_url: { type: Sequelize.STRING(255), allowNull: true },`n        status: { type: Sequelize.INTEGER, allowNull: true }"
    uniques = @()
    fks = @(
        @{ field='client'; table='clients' },
        @{ field='origin_country'; table='countries' },
        @{ field='destination_country'; table='countries' },
        @{ field='exchange_rate_applied'; table='exchange_rates' },
        @{ field='commission_applied'; table='commissions' },
        @{ field='platform_bank_account'; table='platform_bank_accounts' },
        @{ field='status'; table='remittance_statuses' }
    )
  },
  @{
    name = 'remittance_movements'
    cols = "        remittance: { type: Sequelize.INTEGER, allowNull: false },`n        status: { type: Sequelize.INTEGER, allowNull: false },`n        changed_by: { type: Sequelize.INTEGER, allowNull: false },`n        observation: { type: Sequelize.TEXT, allowNull: true }"
    uniques = @()
    fks = @(
        @{ field='remittance'; table='remittances' },
        @{ field='status'; table='remittance_statuses' },
        @{ field='changed_by'; table='users' }
    )
  }
)

$baseDate = [datetime]"2026-08-10T10:00:00Z"
for ($i = 0; $i -lt $tables.Count; $i++) {
    $table = $tables[$i]
    $d = $baseDate.AddMinutes($i)
    $ts = $d.ToString("yyyyMMddHHmmss")
    $seq = ($i + 1).ToString("00")
    $filename = "${ts}-${seq}-create-$($table.name).cjs"
    
    $queries = ""
    foreach ($u in $table.uniques) {
        $queries += @"
      await queryInterface.addIndex({ tableName: '$($table.name)' }, ['$u'], {
        unique: true,
        where: { deleted_at: null },
        name: 'uq_$($table.name)_$u',
        transaction
      });
"@
    }

    foreach ($fk in $table.fks) {
        $queries += @"
      await queryInterface.addConstraint(
        { tableName: '$($table.name)' },
        {
          fields: ['$($fk.field)'],
          type: 'foreign key',
          name: 'fk_$($table.name)_$($fk.field)',
          references: { table: { tableName: '$($fk.table)' }, field: 'id' },
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
          transaction,
        }
      );
"@
    }

    $content = @"
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('$($table.name)', {
        id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
$($table.cols),
        created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: Sequelize.DATE }
      }, { transaction });
$queries
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
