import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class BankPaymentMethodsModel extends SequelizeModelBase {
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
            paymentMethod: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_bank_method',
                enhancedData: { 
                    uiLabel: 'Método de Pago', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'payment-methods'
                },
            }
        };
    }

    static config() {
        return {
            name: 'Métodos por Banco',
            appRawName: 'bank-payment-methods',
            tableName: 'bank_payment_methods',
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
                target: 'PaymentMethods',
                options: { foreignKey: 'paymentMethod', as: '_PaymentMethod' },
            }
        ];
    }
}
