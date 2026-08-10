import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RemittanceMovementsModel extends SequelizeModelBase {
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

            changedBy: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Ejecutado Por', 
                    order: 4,
                    inputType: 'select' as const,
                    relatedCatalog: 'users'
                },
            },
            observation: {
                allowNull: true,
                type: DataTypes.TEXT,
                enhancedData: { uiLabel: 'Observaciones / Motivo', order: 5, inputType: 'textarea' as const },
            },
        };
    }

    static config() {
        return {
            name: 'Movimientos de Remesas',
            appRawName: 'remittance-movements',
            tableName: 'remittance_movements',
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
                target: 'Users',
                options: { foreignKey: 'changedBy', as: '_User' },
            }
        ];
    }
}
