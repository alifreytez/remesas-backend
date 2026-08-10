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
            initialCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Inicial', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            secondaryCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Secundario', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
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
                target: 'Countries',
                options: { foreignKey: 'initialCountry', as: '_InitialCountry' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'secondaryCountry', as: '_SecondaryCountry' },
            },
            {
                type: 'belongsTo',
                target: 'Users',
                options: { foreignKey: 'createdBy', as: '_Creator' },
            }
        ];
    }
}
