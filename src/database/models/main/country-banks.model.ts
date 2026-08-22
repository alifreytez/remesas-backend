import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class CountryBanksModel extends SequelizeModelBase {
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
                unique: 'unique_country_bank',
                enhancedData: { 
                    uiLabel: 'País', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            bank: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_country_bank',
                enhancedData: { 
                    uiLabel: 'Banco', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'banks'
                },
            }
        };
    }

    static config() {
        return {
            name: 'Bancos por País',
            appRawName: 'country-banks',
            tableName: 'country_banks',
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
                target: 'Banks',
                options: { foreignKey: 'bank', as: '_Bank' },
            }
        ];
    }
}

