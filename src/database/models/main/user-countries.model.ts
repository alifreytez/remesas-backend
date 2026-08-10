import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class UserCountriesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            userId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Usuario', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'users'
                },
            },
            countryId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Asignado', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Países de Usuario',
            appRawName: 'user-countries',
            tableName: 'user_countries',
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Users',
                options: { foreignKey: 'userId', as: '_User' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'countryId', as: '_Country' },
            }
        ];
    }
}
