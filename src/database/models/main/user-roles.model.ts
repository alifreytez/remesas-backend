import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class UserRolesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            userId: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'User', order: 2, inputType: 'select' as const, relatedCatalog: 'users' } },
            role: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Role', order: 3, inputType: 'select' as const, relatedCatalog: 'roles' } }
        };
    }

    static config() {
        return {
            name: 'UserRoles',
            appRawName: 'user-roles',
            tableName: 'user_roles',
            paranoid: false,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}