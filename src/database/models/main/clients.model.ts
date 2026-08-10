import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class ClientsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            person: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Persona', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'people'
                },
            },
            originCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País de Origen', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Clientes',
            appRawName: 'clients',
            tableName: 'clients',
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'People',
                options: { foreignKey: 'person', as: '_Person' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'originCountry', as: '_OriginCountry' },
            }
        ];
    }
}
