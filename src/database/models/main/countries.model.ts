import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class CountriesModel extends SequelizeModelBase {
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
                type: DataTypes.STRING(5),
                unique: true,
                enhancedData: { uiLabel: 'Código ISO', order: 2 },
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING(100),
                enhancedData: { uiLabel: 'Nombre del País', order: 3 },
            },
            currencySymbol: {
                allowNull: false,
                type: DataTypes.STRING(10),
                enhancedData: { uiLabel: 'Símbolo Moneda', order: 4 },
            },
        };
    }

    static config() {
        return {
            name: 'Países',
            appRawName: 'countries',
            tableName: 'countries',
            displayField: 'name',
            isBasicTable: true,
            publicAccess: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
