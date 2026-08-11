import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class ContactsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            client: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Cliente', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'clients'
                },
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING(255),
                enhancedData: { uiLabel: 'Nombre del Contacto', order: 3 },
            },
            countryMethod: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Método País', 
                    order: 4,
                    inputType: 'select' as const,
                    relatedCatalog: 'country-receiving-methods'
                },
            },
            contactData: {
                allowNull: false,
                type: DataTypes.JSONB,
                enhancedData: { uiLabel: 'Datos del Contacto', order: 5 },
            },
        };
    }

    static config() {
        return {
            name: 'Agenda de Contactos',
            appRawName: 'contacts',
            tableName: 'contacts',
            displayField: 'name',
            isBasicTable: true,
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Clients',
                options: { foreignKey: 'client', as: '_Client' },
            },
            {
                type: 'belongsTo',
                target: 'CountryReceivingMethods',
                options: { foreignKey: 'countryMethod', as: '_CountryMethod' },
            }
        ];
    }
}
