import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class ResourcesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            code: { allowNull: false, type: DataTypes.STRING(100), unique: true, enhancedData: { uiLabel: 'Code', order: 2 } },
            description: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Description', order: 3 } }
        };
    }

    static config() {
        return {
            name: 'Resources',
            appRawName: 'resources',
            tableName: 'resources',
            displayField: 'description',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
