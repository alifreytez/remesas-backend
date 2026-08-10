import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class PeopleModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            firstName: {
                allowNull: false,
                type: DataTypes.STRING(100),
                enhancedData: { uiLabel: 'Nombres', order: 2 },
            },
            lastName: {
                allowNull: false,
                type: DataTypes.STRING(100),
                enhancedData: { uiLabel: 'Apellidos', order: 3 },
            },
            documentNumber: {
                allowNull: false,
                type: DataTypes.STRING(50),
                unique: true,
                enhancedData: { uiLabel: 'Número de Documento', order: 4 },
            },
            phone: {
                allowNull: true,
                type: DataTypes.STRING(50),
                enhancedData: { uiLabel: 'Teléfono', order: 5 },
            },
        };
    }

    static config() {
        return {
            name: 'Personas',
            appRawName: 'people',
            tableName: 'people',
            displayField: 'documentNumber',
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
