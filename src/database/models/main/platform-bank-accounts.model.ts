import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class PlatformBankAccountsModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { visible: false, order: 1 },
            },
            bank: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Banco', 
                    order: 2,
                    inputType: 'select' as const,
                    relatedCatalog: 'banks'
                },
            },
            accountDetails: {
                allowNull: false,
                type: DataTypes.JSONB,
                enhancedData: { uiLabel: 'Detalles de la Cuenta', order: 3 },
            },
            isActive: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                enhancedData: { uiLabel: '¿Está Activa?', order: 4 },
            },
        };
    }

    static config() {
        return {
            name: 'Cuentas Bancarias de Plataforma',
            appRawName: 'platform-bank-accounts',
            tableName: 'platform_bank_accounts',
            displayField: 'id', // Ideally a virtual field with Bank name + Account Number, but keeping simple for now
        };
    }

    static relations(): RelationsReturn {
        return [
            {
                type: 'belongsTo',
                target: 'Banks',
                options: { foreignKey: 'bank', as: '_Bank' },
            }
        ];
    }
}
