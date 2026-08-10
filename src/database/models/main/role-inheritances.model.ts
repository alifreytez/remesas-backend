import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RoleInheritancesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            parentRole: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Parent Role', order: 2, inputType: 'select' as const, relatedCatalog: 'roles' } },
            childRole: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'Child Role', order: 3, inputType: 'select' as const, relatedCatalog: 'roles' } }
        };
    }

    static config() {
        return {
            name: 'RoleInheritances',
            appRawName: 'role-inheritances',
            tableName: 'role_inheritances',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}