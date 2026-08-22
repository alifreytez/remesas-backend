import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class CountryPaymentMethodsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            country: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_country_payment_method',
                enhancedData: { 
                    uiLabel: 'País', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            paymentMethod: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_country_payment_method',
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
            name: 'Métodos de Pago por País',
            appRawName: 'country-payment-methods',
            tableName: 'country_payment_methods',
            displayField: 'id',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'country', as: '_Country' },
            },
            {
                type: 'belongsTo',
                target: 'PaymentMethods',
                options: { foreignKey: 'paymentMethod', as: '_PaymentMethod' },
            }
        ];
    }
}

