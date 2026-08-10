import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class UserTypesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            code: {
                allowNull: false,
                type: DataTypes.STRING(50),
                unique: true,
                enhancedData: { uiLabel: 'Código', order: 2 },
            },
            description: {
                allowNull: false,
                type: DataTypes.STRING(255),
                enhancedData: { uiLabel: 'Descripción', order: 3 },
            },
        };
    }

    static config() {
        return {
            name: 'Tipos de Usuario',
            appRawName: 'user-types',
            tableName: 'user_types',
            displayField: 'description',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
