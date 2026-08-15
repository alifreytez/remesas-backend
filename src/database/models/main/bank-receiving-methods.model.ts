import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class BankReceivingMethodsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            bank: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_bank_method',
                enhancedData: { 
                    uiLabel: 'Banco', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'banks'
                },
            },
            receivingMethod: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_bank_method',
                enhancedData: { 
                    uiLabel: 'Método de Recepción', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'receiving-methods'
                },
            },
            isActive: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                enhancedData: { uiLabel: 'Activo', order: 4 },
            }
        };
    }

    static config() {
        return {
            name: 'Métodos por Banco',
            appRawName: 'bank-receiving-methods',
            tableName: 'bank_receiving_methods',
            displayField: 'id',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Banks',
                options: { foreignKey: 'bank', as: '_Bank' },
            },
            {
                type: 'belongsTo',
                target: 'ReceivingMethods',
                options: { foreignKey: 'receivingMethod', as: '_ReceivingMethod' },
            }
        ];
    }
}
