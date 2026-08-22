import { DataTypes } from 'sequelize';
import { type RelationsReturn, SequelizeModelBase } from '@database/models/bases/sequelize.model.js';

export default class RemittancesModel extends SequelizeModelBase {
    static definition() {
        return {
            id: {
                primaryKey: true,
                allowNull: false,
                type: DataTypes.INTEGER,
                autoIncrement: true,
                enhancedData: { uiLabel: 'Folio', order: 1 },
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
            originCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País de Origen', 
                    order: 3,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            destinationCountry: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'País de Destino', 
                    order: 4,
                    inputType: 'select' as const,
                    relatedCatalog: 'countries'
                },
            },
            amountSent: {
                allowNull: false,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto Enviado (Local)', order: 5 },
            },
            amountReceived: {
                allowNull: false,
                type: DataTypes.DECIMAL(15, 4),
                enhancedData: { uiLabel: 'Monto a Recibir', order: 6 },
            },
            exchangeRateApplied: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Tasa Aplicada', 
                    order: 7,
                },
            },
            platformBankAccount: {
                allowNull: false,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Cuenta Plataforma', 
                    order: 8,
                },
            },
            recipientAccountDetails: {
                allowNull: false,
                type: DataTypes.JSONB,
                enhancedData: { uiLabel: 'Detalles Cuenta Destino', order: 9 },
            },
            paymentReceiptUrl: {
                allowNull: true,
                type: DataTypes.STRING(255),
                enhancedData: { uiLabel: 'Recibo Pago Cliente', order: 10 },
            },
            emissionReceiptUrl: {
                allowNull: true,
                type: DataTypes.STRING(255),
                enhancedData: { uiLabel: 'Recibo Emisión Remesa', order: 11 },
            },
            status: {
                allowNull: true,
                type: DataTypes.INTEGER,
                enhancedData: { 
                    uiLabel: 'Estado', 
                    order: 12,
                    inputType: 'select' as const,
                    relatedCatalog: 'remittance-statuses'
                },
            },

        };
    }

    static config() {
        return {
            name: 'Remesas',
            appRawName: 'remittances',
            tableName: 'remittances',
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
                target: 'Countries',
                options: { foreignKey: 'originCountry', as: '_OriginCountry' },
            },
            {
                type: 'belongsTo',
                target: 'Countries',
                options: { foreignKey: 'destinationCountry', as: '_DestinationCountry' },
            },
            {
                type: 'belongsTo',
                target: 'ExchangeRates',
                options: { foreignKey: 'exchangeRateApplied', as: '_ExchangeRate' },
            },
            {
                type: 'belongsTo',
                target: 'PlatformBankAccounts',
                options: { foreignKey: 'platformBankAccount', as: '_PlatformBankAccount' },
            },
            {
                type: 'belongsTo',
                target: 'RemittanceStatuses',
                options: { foreignKey: 'status', as: '_Status' },
            },

        ];
    }
}
