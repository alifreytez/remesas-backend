import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RemittancePriceModifiersModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            remittance: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Remesa', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'remittances'
                },
            },
            priceModifier: {
                allowNull: true, // Nullable in case the modifier catalog is hard deleted, though soft deletes prevent this
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Modificador', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'price-modifiers'
                },
            },
            appliedAmount: {
                allowNull: false,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto Aplicado', order: 4 },
            },
            snapshot: {
                allowNull: false,
                type: DataTypes.JSONB,
                enhancedData: { uiLabel: 'Snapshot de Reglas', order: 5 },
            },
        };
    }

    static config() {
        return {
            name: 'Modificadores por Remesa',
            appRawName: 'remittance-price-modifiers',
            tableName: 'remittance_price_modifiers',
            displayField: 'id',
            isBasicTable: false,
            publicAccess: false,
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Remittances',
                options: { foreignKey: 'remittance', as: '_Remittance' },
            },
            {
                type: 'belongsTo',
                target: 'PriceModifiers',
                options: { foreignKey: 'priceModifier', as: '_PriceModifier' },
            }
        ];
    }
}
