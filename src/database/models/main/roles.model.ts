import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RolesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            code: { allowNull: false, type: DataTypes.STRING(100), unique: true, enhancedData: { uiLabel: 'Código', order: 2 } },
            description: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Descripción', order: 3 } },
            hierarchy: { allowNull: false, type: DataTypes.INTEGER, defaultValue: 100, enhancedData: { uiLabel: 'Jerarquía (1=Mayor, 100=Menor)', order: 4, inputType: 'number' as const } }
        };
    }

    static config() {
        return {
            name: 'Roles',
            appRawName: 'roles',
            tableName: 'roles',
            displayField: 'description',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
