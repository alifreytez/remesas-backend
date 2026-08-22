import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class PaymentMethodsModel extends SequelizeModelBase {
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
            isGlobal: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                enhancedData: { uiLabel: 'Es Global', order: 4 },
            },
            forcedCurrency: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Moneda Forzada (Si aplica)', 
                    order: 5,
                    inputType: 'select' as const,
                    relatedCatalog: 'currencies'
                },
            },
            fieldsConfig: {
                allowNull: true,
                type: DataTypes.JSONB,
                enhancedData: { 
                    uiLabel: 'Configuración de Campos', 
                    order: 6,
                    inputType: 'json-table' as const
                },
            }
        };
    }

    static config() {
        return {
            name: 'Métodos de Pago',
            appRawName: 'payment-methods',
            tableName: 'payment_methods',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Currencies',
                options: { foreignKey: 'forcedCurrency', as: '_ForcedCurrency' },
            },
            {
                type: 'belongsToMany',
                target: 'Countries',
                options: { through: 'CountryPaymentMethods', as: '_Countries' },
            }
        ];
    }
}

