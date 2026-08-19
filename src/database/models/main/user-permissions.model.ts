import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class UserPermissionsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            userId: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'User', order: 2, inputType: 'select' as const, relatedCatalog: 'users' } },
            permission: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Permission', order: 3, inputType: 'select' as const, relatedCatalog: 'permissions' } },
            isGranted: { allowNull: false, type: DataTypes.BOOLEAN, defaultValue: true, enhancedData: { uiLabel: '¿Está Concedido?', order: 4 } }
        };
    }

    static config() {
        return {
            name: 'UserPermissions',
            appRawName: 'user-permissions',
            tableName: 'user_permissions',
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}