import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RemittanceStatusesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            code: {
                allowNull: false,
                type: DataTypes.STRING(50),
                unique: true,
                enhancedData: { uiLabel: 'Código', order: 2 },
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING(100),
                enhancedData: { uiLabel: 'Nombre del Estado', order: 3 },
            },
        };
    }

    static config() {
        return {
            name: 'Estados de Remesa',
            appRawName: 'remittance-statuses',
            tableName: 'remittance_statuses',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
