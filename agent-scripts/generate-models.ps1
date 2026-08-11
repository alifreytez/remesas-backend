$modelsDir = "z:\home\alifreytez\remesas\backend\src\database\models\main"

$models = @(
  @{
    file = 'actions.model.ts'
    class = 'ActionsModel'
    name = 'Actions'
    appRawName = 'actions'
    tableName = 'actions'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            code: { allowNull: false, type: DataTypes.STRING(100), unique: true, enhancedData: { uiLabel: 'Code', order: 2 } },
            description: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Description', order: 3 } }
"@
  },
  @{
    file = 'resources.model.ts'
    class = 'ResourcesModel'
    name = 'Resources'
    appRawName = 'resources'
    tableName = 'resources'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            code: { allowNull: false, type: DataTypes.STRING(100), unique: true, enhancedData: { uiLabel: 'Code', order: 2 } },
            description: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Description', order: 3 } }
"@
  },
  @{
    file = 'permission-types.model.ts'
    class = 'PermissionTypesModel'
    name = 'PermissionTypes'
    appRawName = 'permission-types'
    tableName = 'permission_types'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            code: { allowNull: false, type: DataTypes.STRING(100), unique: true, enhancedData: { uiLabel: 'Code', order: 2 } },
            description: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Description', order: 3 } }
"@
  },
  @{
    file = 'roles.model.ts'
    class = 'RolesModel'
    name = 'Roles'
    appRawName = 'roles'
    tableName = 'roles'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            code: { allowNull: false, type: DataTypes.STRING(100), unique: true, enhancedData: { uiLabel: 'Code', order: 2 } },
            description: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Description', order: 3 } }
"@
  },
  @{
    file = 'permissions.model.ts'
    class = 'PermissionsModel'
    name = 'Permissions'
    appRawName = 'permissions'
    tableName = 'permissions'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            resource: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Resource', order: 2, inputType: 'select', relatedCatalog: 'resources' } },
            action: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Action', order: 3, inputType: 'select', relatedCatalog: 'actions' } },
            permissionType: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Permission Type', order: 4, inputType: 'select', relatedCatalog: 'permission-types' } }
"@
  },
  @{
    file = 'role-inheritances.model.ts'
    class = 'RoleInheritancesModel'
    name = 'RoleInheritances'
    appRawName = 'role-inheritances'
    tableName = 'role_inheritances'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            parentRole: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Parent Role', order: 2, inputType: 'select', relatedCatalog: 'roles' } },
            childRole: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Child Role', order: 3, inputType: 'select', relatedCatalog: 'roles' } }
"@
  },
  @{
    file = 'role-permissions.model.ts'
    class = 'RolePermissionsModel'
    name = 'RolePermissions'
    appRawName = 'role-permissions'
    tableName = 'role_permissions'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            role: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Role', order: 2, inputType: 'select', relatedCatalog: 'roles' } },
            permission: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Permission', order: 3, inputType: 'select', relatedCatalog: 'permissions' } }
"@
  },
  @{
    file = 'user-roles.model.ts'
    class = 'UserRolesModel'
    name = 'UserRoles'
    appRawName = 'user-roles'
    tableName = 'user_roles'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            userId: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'User', order: 2, inputType: 'select', relatedCatalog: 'users' } },
            role: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Role', order: 3, inputType: 'select', relatedCatalog: 'roles' } }
"@
  },
  @{
    file = 'user-permissions.model.ts'
    class = 'UserPermissionsModel'
    name = 'UserPermissions'
    appRawName = 'user-permissions'
    tableName = 'user_permissions'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            userId: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'User', order: 2, inputType: 'select', relatedCatalog: 'users' } },
            permission: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Permission', order: 3, inputType: 'select', relatedCatalog: 'permissions' } },
            isGranted: { allowNull: false, type: DataTypes.BOOLEAN, defaultValue: true, enhancedData: { uiLabel: 'Is Granted', order: 4, inputType: 'checkbox' } }
"@
  },
  @{
    file = 'user-sessions.model.ts'
    class = 'UserSessionsModel'
    name = 'UserSessions'
    appRawName = 'user-sessions'
    tableName = 'user_sessions'
    cols = @"
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            userId: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'User', order: 2, inputType: 'select', relatedCatalog: 'users' } },
            device: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Device', order: 3 } },
            deviceId: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Device ID', order: 4 } },
            jti: { allowNull: false, type: DataTypes.STRING(255), unique: true, enhancedData: { uiLabel: 'JTI', order: 5 } },
            expiresAt: { allowNull: false, type: DataTypes.DATE, enhancedData: { uiLabel: 'Expires At', order: 6, inputType: 'date' } }
"@
  }
)

foreach ($m in $models) {
    $content = @"
import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class $($m.class) extends SequelizeModelBase {
    static definition() {
        return {
$($m.cols)
        };
    }

    static config() {
        return {
            name: '$($m.name)',
            appRawName: '$($m.appRawName)',
            tableName: '$($m.tableName)',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
"@
    $outPath = Join-Path $modelsDir $m.file
    [System.IO.File]::WriteAllText($outPath, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output "Created $($m.file)"
}
