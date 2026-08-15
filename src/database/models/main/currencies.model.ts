import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class CurrenciesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            isoCode: {
                allowNull: false,
                type: DataTypes.STRING(3),
                unique: true,
                enhancedData: { uiLabel: 'Código ISO', order: 2 },
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING(100),
                enhancedData: { uiLabel: 'Nombre de Moneda', order: 3 },
            },
            symbol: {
                allowNull: false,
                type: DataTypes.STRING(10),
                enhancedData: { uiLabel: 'Símbolo', order: 4 },
            },
        };
    }

    static config() {
        return {
            name: 'Monedas',
            appRawName: 'currencies',
            tableName: 'currencies',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
