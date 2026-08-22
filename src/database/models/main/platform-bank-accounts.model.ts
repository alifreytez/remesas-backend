import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class PlatformBankAccountsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            paymentMethod: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Método de Pago', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'payment-methods'
                },
            },
            country: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País (Nulo si es Global)', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            isGlobal: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                enhancedData: { uiLabel: 'Es método global?', order: 4 },
            },
            accountDetails: {
                allowNull: false,
                type: DataTypes.JSONB,
                enhancedData: { uiLabel: 'Detalles de la Cuenta', order: 5 },
            },
            currency: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Moneda', 
                    order: 6,
                    inputType: 'select' as const,
                    relatedCatalog: 'currencies'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Cuentas Recaudadoras',
            appRawName: 'platform-bank-accounts',
            tableName: 'platform_bank_accounts',
            displayField: 'id',
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'PaymentMethods',
                options: { foreignKey: 'paymentMethod', as: '_PaymentMethod' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'country', as: '_Country' },
            },
            {
                type: 'belongsTo',
                target: 'Currencies',
                options: { foreignKey: 'currency', as: '_Currency' },
            }
        ];
    }
}
