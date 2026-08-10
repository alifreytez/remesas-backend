import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RolePermissionsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            role: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Role', order: 2, inputType: 'select' as const, relatedCatalog: 'roles' } },
            permission: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Permission', order: 3, inputType: 'select' as const, relatedCatalog: 'permissions' } }
        };
    }

    static config() {
        return {
            name: 'RolePermissions',
            appRawName: 'role-permissions',
            tableName: 'role_permissions',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}