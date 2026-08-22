import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class UserSessionsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: { primaryKey: true, allowNull: false, type: DataTypes.INTEGER, autoIncrement: true, enhancedData: { visible: false, order: 1 } },
            user: { allowNull: false, type: DataTypes.INTEGER, enhancedData: { uiLabel: 'User', order: 2, inputType: 'select' as const, relatedCatalog: 'users' } },
            device: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Device', order: 3 } },
            deviceId: { allowNull: true, type: DataTypes.STRING(255), enhancedData: { uiLabel: 'Device ID', order: 4 } },
            jti: { allowNull: false, type: DataTypes.STRING(255), unique: true, enhancedData: { uiLabel: 'JTI', order: 5 } },
            expiresAt: { allowNull: false, type: DataTypes.DATE, enhancedData: { uiLabel: 'Expires At', order: 6, inputType: 'date' as const } }
        };
    }

    static config() {
        return {
            name: 'UserSessions',
            appRawName: 'user-sessions',
            tableName: 'user_sessions',
            paranoid: true,
        };
    }

    static relations(): RelationsReturn {
        return [];
    }
}
