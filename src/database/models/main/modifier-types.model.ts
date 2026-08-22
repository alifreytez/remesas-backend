import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class ModifierTypesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING(100),
                unique: true,
                enhancedData: { uiLabel: 'Nombre del Tipo', order: 2 },
            },
        };
    }

    static config() {
        return {
            name: 'Tipos de Modificadores',
            appRawName: 'modifier-types',
            tableName: 'modifier_types',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
