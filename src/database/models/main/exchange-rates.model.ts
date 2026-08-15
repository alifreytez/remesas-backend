import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class ExchangeRatesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            initialCurrency: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Moneda Inicial', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'currencies'
                },
            },
            secondaryCurrency: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Moneda Destino', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'currencies'
                },
            },
            rate: {
                allowNull: false,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Tasa de Cambio', order: 4 },
            },
            createdBy: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Creado Por', 
                    order: 5,
                    inputType: 'select' as const,
                    relatedCatalog: 'users'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Tasas de Cambio',
            appRawName: 'exchange-rates',
            tableName: 'exchange_rates',
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Currencies',
                options: { foreignKey: 'initialCurrency', as: '_InitialCurrency' },
            },
            {
                type: 'belongsTo',
                target: 'Currencies',
                options: { foreignKey: 'secondaryCurrency', as: '_SecondaryCurrency' },
            },
            {
                type: 'belongsTo',
                target: 'Users',
                options: { foreignKey: 'createdBy', as: '_Creator' },
            }
        ];
    }
}
