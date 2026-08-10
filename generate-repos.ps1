$reposDir = "z:\home\alifreytez\remesas\backend\src\database\repositories\main"

$repos = @(
  @{ file = 'actions.repository.ts'; class = 'ActionsRepository'; modelClass = 'ActionsModel'; modelFile = 'actions.model.js' },
  @{ file = 'resources.repository.ts'; class = 'ResourcesRepository'; modelClass = 'ResourcesModel'; modelFile = 'resources.model.js' },
  @{ file = 'permission-types.repository.ts'; class = 'PermissionTypesRepository'; modelClass = 'PermissionTypesModel'; modelFile = 'permission-types.model.js' },
  @{ file = 'roles.repository.ts'; class = 'RolesRepository'; modelClass = 'RolesModel'; modelFile = 'roles.model.js' },
  @{ file = 'permissions.repository.ts'; class = 'PermissionsRepository'; modelClass = 'PermissionsModel'; modelFile = 'permissions.model.js' },
  @{ file = 'role-inheritances.repository.ts'; class = 'RoleInheritancesRepository'; modelClass = 'RoleInheritancesModel'; modelFile = 'role-inheritances.model.js' },
  @{ file = 'role-permissions.repository.ts'; class = 'RolePermissionsRepository'; modelClass = 'RolePermissionsModel'; modelFile = 'role-permissions.model.js' },
  @{ file = 'user-roles.repository.ts'; class = 'UserRolesRepository'; modelClass = 'UserRolesModel'; modelFile = 'user-roles.model.js' },
  @{ file = 'user-permissions.repository.ts'; class = 'UserPermissionsRepository'; modelClass = 'UserPermissionsModel'; modelFile = 'user-permissions.model.js' },
  @{ file = 'user-sessions.repository.ts'; class = 'UserSessionsRepository'; modelClass = 'UserSessionsModel'; modelFile = 'user-sessions.model.js' }
)

foreach ($r in $repos) {
    $content = @"
import { injectable } from 'inversify';
import $($r.modelClass) from '@database/models/main/$($r.modelFile)';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

@injectable()
export default class $($r.class) extends SequelizeRepositoryBase {
    constructor() {
        super($($r.modelClass));
    }
}
"@
    $outPath = Join-Path $reposDir $r.file
    [System.IO.File]::WriteAllText($outPath, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output "Created $($r.file)"
}
