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
            username: {
                allowNull: false,
                type: DataTypes.STRING(255),
                unique: true,
                enhancedData: { uiLabel: 'Usuario', order: 1.5 },
            },
            userType: {
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: 'unique_person_userType', // Composite unique
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
                unique: 'unique_person_userType', // Composite unique
                enhancedData: { 
                    uiLabel: 'Persona', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'people'
                },
            },
            country: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País Base', 
                    order: 3.5,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            email: {
                allowNull: false,
                type: DataTypes.STRING(150),
                // unique: true, // Removido para permitir múltiples cuentas con el mismo correo
                enhancedData: { uiLabel: 'Correo Electrónicso', order: 4, inputType: 'email' as const },
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
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'country', as: '_Country' },
            },
            {
                type: 'belongsToMany',
                target: 'Roles',
                options: { through: 'user_roles', foreignKey: 'user', otherKey: 'role', as: '_Roles' }
            },
            {
                type: 'belongsToMany',
                target: 'Permissions',
                options: { through: 'user_permissions', foreignKey: 'user', otherKey: 'permission', as: '_Permissions' }
            }
        ];
    }
}




