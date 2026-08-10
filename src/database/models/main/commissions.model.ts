import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class CommissionsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            originCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Origen', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            destinationCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Destino', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            amount: {
                allowNull: false,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto de Comisión', order: 4 },
            },
            isPercentage: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                enhancedData: { uiLabel: '¿Es Porcentaje?', order: 5 },
            },
            createdBy: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Creado Por', 
                    order: 6,
                    inputType: 'select' as const,
                    relatedCatalog: 'users'
                },
            },
        };
    }

    static config() {
        return {
            name: 'Comisiones',
            appRawName: 'commissions',
            tableName: 'commissions',
        };
    }

    static relations(): RelationsReturn {
        return [
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
                target: 'Users',
                options: { foreignKey: 'createdBy', as: '_Creator' },
            }
        ];
    }
}
