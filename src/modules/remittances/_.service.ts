import { BaseService } from '@bases/service.base.js';
import { Database } from '@database/index.js';
import { BadRequestError } from '@errors/index.js';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';
import { Transaction } from 'sequelize';

class RemittancesService extends BaseService {
    async list(filters: ProcessedQueryFilters) {
        return await this.Remittances.getAllActive({
            ...filters,
            relations: [
                { association: '_Client', nested: [{ association: '_Person' }] },
                { association: '_OriginCountry' },
                { association: '_DestinationCountry' },
                { association: '_ExchangeRate' },
                { association: '_Commission' },
                { association: '_PlatformBankAccount', nested: [{ association: '_Bank' }] },
                { association: '_Status' }
            ]
        });
    }

    async getById(id: string | number) {
        return await this.Remittances.getOne({ id }, {
            relations: [
                { association: '_Client', nested: [{ association: '_Person' }] },
                { association: '_OriginCountry' },
                { association: '_DestinationCountry' },
                { association: '_ExchangeRate' },
                { association: '_Commission' },
                { association: '_PlatformBankAccount', nested: [{ association: '_Bank' }] },
                { association: '_Status' }
            ]
        });
    }

    async create(data: any, createdBy?: number | string) {
        const { 
            client, 
            originCountry, 
            destinationCountry, 
            amountSent, 
            amountReceived, 
            exchangeRateApplied, 
            commissionApplied, 
            platformBankAccount,
            recipientAccountDetails,
            paymentReceiptUrl,
            emissionReceiptUrl
        } = data;

        if (!client || !originCountry || !destinationCountry || !amountSent || !amountReceived || !exchangeRateApplied || !commissionApplied || !platformBankAccount || !recipientAccountDetails) {
            throw new BadRequestError('Faltan datos obligatorios para crear la remesa');
        }

        const pendingStatus = await this.RemittanceStatuses.getOne({ code: 'PENDING' });
        if (!pendingStatus) throw new Error('El estado PENDING no existe en la base de datos');

        const transaction = (await this.Remittances.transaction()) as Transaction;
        try {
            const remittance = await this.Remittances.create({
                client,
                originCountry,
                destinationCountry,
                amountSent,
                amountReceived,
                exchangeRateApplied,
                commissionApplied,
                platformBankAccount,
                recipientAccountDetails,
                paymentReceiptUrl: paymentReceiptUrl || null,
                emissionReceiptUrl: emissionReceiptUrl || null,
                status: pendingStatus.id
            }, { transaction });

            // Create initial movement
            await this.RemittanceMovements.create({
                remittance: remittance.id,
                status: pendingStatus.id,
                changedBy: createdBy || 1, // Fallback if no session
                observation: 'Creación inicial de la remesa'
            }, { transaction });

            await transaction.commit();
            return this.getById(remittance.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateStatus(id: string | number, data: any, changedBy?: number | string) {
        const { status, observation } = data;

        if (!status) {
            throw new BadRequestError('Falta el ID del nuevo estado');
        }

        if (!changedBy) {
            throw new BadRequestError('Se requiere un usuario en sesión para registrar el movimiento');
        }

        const remittance = await this.getById(id) as Record<string, any>;
        if (!remittance) throw new BadRequestError('Remittance not found');
        
        const transaction = (await this.Remittances.transaction()) as Transaction;

        try {
            await this.Remittances.update({ id }, { status }, { transaction });

            await this.RemittanceMovements.create({
                remittance: remittance.id,
                status,
                changedBy,
                observation: observation || null
            }, { transaction });

            await transaction.commit();
            return this.getById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    private get Remittances() { return Database.repository('main', 'remittances') as SequelizeRepositoryBase; }
    private get RemittanceMovements() { return Database.repository('main', 'remittance-movements') as SequelizeRepositoryBase; }
    private get RemittanceStatuses() { return Database.repository('main', 'remittance-statuses') as SequelizeRepositoryBase; }
}

export default new RemittancesService();
