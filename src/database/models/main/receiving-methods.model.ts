import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class ReceivingMethodsModel extends SequelizeModelBase {
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
                enhancedData: { uiLabel: 'Nombre del Método', order: 2 },
            },
            typeCode: {
                allowNull: false,
                type: DataTypes.STRING(50),
                unique: true,
                enhancedData: { uiLabel: 'Código Único', order: 3 },
            },
            fieldsConfig: {
                allowNull: true,
                type: DataTypes.JSONB,
                enhancedData: { uiLabel: 'Configuración de Campos', order: 4 },
            }
        };
    }

    static config() {
        return {
            name: 'Métodos de Recepción',
            appRawName: 'receiving-methods',
            tableName: 'receiving_methods',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
