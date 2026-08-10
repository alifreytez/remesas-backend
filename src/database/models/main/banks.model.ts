import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class BanksModel extends SequelizeModelBase {
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
                enhancedData: { uiLabel: 'Nombre del Banco', order: 2 },
            },
            code: {
                allowNull: false,
                type: DataTypes.STRING(50),
                enhancedData: { uiLabel: 'Código Bancario', order: 3 },
            },
            country: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País', 
                    order: 4,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Bancos',
            appRawName: 'banks',
            tableName: 'banks',
            displayField: 'name',
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
            }
        ];
    }
}
