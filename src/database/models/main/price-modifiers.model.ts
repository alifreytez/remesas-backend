import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class PriceModifiersModel extends SequelizeModelBase {
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
                enhancedData: { uiLabel: 'Nombre', order: 2 },
            },
            modifierType: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Tipo de Modificador', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'modifier-types'
                },
            },
            amount: {
                allowNull: false,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto/Porcentaje', order: 4 },
            },
            isPercentage: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                enhancedData: { uiLabel: 'Es Porcentaje', order: 5 },
            },
            originCountry: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Origen', 
                    order: 6,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            destinationCountry: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Destino', 
                    order: 7,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            currency: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Moneda', 
                    order: 8,
                    inputType: 'select' as const,
                    relatedCatalog: 'currencies'
                },
            },
            paymentMethod: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Método de Pago', 
                    order: 9,
                    inputType: 'select' as const,
                    relatedCatalog: 'payment-methods'
                },
            },
            bank: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Banco', 
                    order: 10,
                    inputType: 'select' as const,
                    relatedCatalog: 'banks'
                },
            },
            minAmount: {
                allowNull: true,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto Mínimo', order: 11 },
            },
            maxAmount: {
                allowNull: true,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto Máximo', order: 12 },
            },
            createdBy: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Creado Por', 
                    order: 13,
                    inputType: 'select' as const,
                    relatedCatalog: 'users'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Modificadores de Precio',
            appRawName: 'price-modifiers',
            tableName: 'price_modifiers',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'ModifierTypes',
                options: { foreignKey: 'modifierType', as: '_ModifierType' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'originCountry', as: '_OriginCountry' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'destinationCountry', as: '_DestinationCountry' },
            },
            {
                type: 'belongsTo',
                target: 'Currencies',
                options: { foreignKey: 'currency', as: '_Currency' },
            },
            {
                type: 'belongsTo',
                target: 'PaymentMethods',
                options: { foreignKey: 'paymentMethod', as: '_PaymentMethod' },
            },
            {
                type: 'belongsTo',
                target: 'Banks',
                options: { foreignKey: 'bank', as: '_Bank' },
            },
            {
                type: 'belongsTo',
                target: 'Users',
                options: { foreignKey: 'createdBy', as: '_Creator' },
            }
        ];
    }
}

