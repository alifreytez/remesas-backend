import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class UsersModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            userType: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Tipo de Usuario', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'user-types'
                },
            },
            person: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Persona', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'people'
                },
            },
            email: {
                allowNull: false,
                type: DataTypes.STRING(150),
                unique: true,
                enhancedData: { uiLabel: 'Correo Electrónico', order: 4, inputType: 'email' as const },
            },
            passwordHash: {
                allowNull: false,
                type: DataTypes.STRING(255),
                enhancedData: { uiLabel: 'Contraseña', order: 5, inputType: 'password' as const, visible: false },
            },
        };
    }

    static config() {
        return {
            name: 'Usuarios',
            appRawName: 'users',
            tableName: 'users',
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'UserTypes',
                options: { foreignKey: 'userType', as: '_UserType' },
            },
            {
                type: 'belongsTo',
                target: 'People',
                options: { foreignKey: 'person', as: '_Person' },
            }
        ];
    }
}
