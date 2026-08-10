import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class PermissionsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            resource: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Resource', order: 2, inputType: 'select' as const, relatedCatalog: 'resources' } },
            action: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Action', order: 3, inputType: 'select' as const, relatedCatalog: 'actions' } },
            permissionType: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Permission Type', order: 4, inputType: 'select' as const, relatedCatalog: 'permission-types' } }
        };
    }

    static config() {
        return {
            name: 'Permissions',
            appRawName: 'permissions',
            tableName: 'permissions',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}