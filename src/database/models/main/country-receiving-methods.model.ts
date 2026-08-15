import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class CountryReceivingMethodsModel extends SequelizeModelBase {
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
                unique: 'unique_country_method',
                enhancedData: { 
                    uiLabel: 'País Destino', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            receivingMethod: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_country_method',
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
            name: 'Métodos por País',
            appRawName: 'country-receiving-methods',
            tableName: 'country_receiving_methods',
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
                target: 'ReceivingMethods',
                options: { foreignKey: 'receivingMethod', as: '_ReceivingMethod' },
            }
        ];
    }
}
