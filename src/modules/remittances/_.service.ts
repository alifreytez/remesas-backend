import { Op } from 'sequelize';
import { BaseService } from '@bases/service.base.js';
import { Database } from '@database/index.js';
import { BadRequestError } from '@errors/index.js';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';
import { Transaction } from 'sequelize';
import PricingService from '../../shared/services/pricing.service.js';

class RemittancesService extends BaseService {
    async list(filters: ProcessedQueryFilters) {
        return await this.Remittances.getAll({
            ...filters,
            relations: [
                { association: '_Client', nested: [{ association: '_Person' }] },
                { association: '_OriginCountry' },
                { association: '_DestinationCountry' },
                { association: '_ExchangeRate' },
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
                { association: '_PlatformBankAccount', nested: [{ association: '_Bank' }] },
                { association: '_Status' }
            ]
        });
    }

    async create(data: any, createdBy?: number | string) {
        const { 
            destinationCountry, 
            amountSent, 
            amountReceived, 
            platformBankAccount,
            recipientAccountDetails,
            paymentReceiptUrl,
            emissionReceiptUrl
        } = data;

        if (!createdBy) throw new BadRequestError('Usuario no autenticado');
        const user = await Database.repository('main', 'users').getOne({ id: createdBy }) as any;
        const clientModel = await Database.repository('main', 'clients').getOne({ person: user.person }) as any;
        if (!clientModel) throw new BadRequestError('El usuario no tiene un perfil de cliente');

        const client = clientModel.id;
        const originCountry = clientModel.originCountry;

        if (!destinationCountry || !platformBankAccount || !recipientAccountDetails) {
            throw new BadRequestError('Faltan datos obligatorios para crear la remesa (destinationCountry, platformBankAccount, recipientAccountDetails)');
        }

        if (!amountSent && !amountReceived) {
            throw new BadRequestError('Debe indicar el monto a enviar o el monto a recibir');
        }

        // Determinar Moneda Origen
        const pBankAccount = await this.PlatformBankAccounts.getOne({ id: platformBankAccount }, { relations: [{ association: '_Currency' }] }) as any;
        if (!pBankAccount) throw new BadRequestError('Cuenta de plataforma no válida');
        const originCurrency = pBankAccount.currency || pBankAccount._Currency?.id;

        // Determinar Moneda Destino
        let destinationCurrency = null;
        const methodDef = await Database.repository('main', 'payment-methods').getOne({ typeCode: recipientAccountDetails.method }) as any;
        if (methodDef && methodDef.isGlobal && methodDef.forcedCurrency) {
            destinationCurrency = methodDef.forcedCurrency;
        } else {
            const destCountry = await Database.repository('main', 'countries').getOne({ id: destinationCountry }) as any;
            if (destCountry) destinationCurrency = destCountry.currency;
        }

        if (!originCurrency || !destinationCurrency) {
            throw new BadRequestError('No se pudo determinar la moneda de origen o destino');
        }

        const pendingStatus = await this.RemittanceStatuses.getOne({ code: 'PENDING' });
        if (!pendingStatus) throw new Error('El estado PENDING no existe en la base de datos');

        const amount = amountSent ? Number(amountSent) : Number(amountReceived);
        const amountType = amountSent ? 'SENT' : 'RECEIVED';

        const quote = await PricingService.calculateQuote({
            amount,
            amountType,
            originCurrency,
            destinationCurrency,
            originCountry,
            destinationCountry,
            paymentMethod: methodDef?.id,
            platformBankAccount
        });

        const transaction = (await this.Remittances.transaction()) as Transaction;
        try {
            const remittance = await this.Remittances.create({
                client,
                originCountry,
                destinationCountry,
                amountSent: quote.amountSent,
                amountReceived: quote.amountReceived,
                exchangeRateApplied: quote.exchangeRateApplied,
                platformBankAccount,
                recipientAccountDetails,
                paymentReceiptUrl: paymentReceiptUrl || null,
                emissionReceiptUrl: emissionReceiptUrl || null,
                status: pendingStatus.id
            }, { transaction });

            if (quote.appliedModifiers.length > 0) {
                const modifiersData = quote.appliedModifiers.map(mod => ({
                    remittance: remittance.id,
                    price_modifier: mod.modifierId,
                    applied_amount: mod.amountApplied,
                    snapshot: JSON.stringify(mod),
                    created_at: new Date(),
                    updated_at: new Date()
                }));
                
                await (Database.repository('main', 'remittance-price-modifiers') as SequelizeRepositoryBase).bulkCreate(modifiersData, { transaction });
            }

            await this.RemittanceMovements.create({
                remittance: remittance.id,
                status: pendingStatus.id,
                changedBy: createdBy || 1,
                observation: 'Creacion inicial de la remesa'
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
            throw new BadRequestError('Se requiere un usuario en sesion para registrar el movimiento');
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

    async getOptions(userId: number | string) {
        // 1. Obtener el cliente asociado al usuario actual
        const user = await Database.repository('main', 'users').getOne({ id: userId }) as any;
        if (!user) throw new BadRequestError('Usuario no encontrado');

        const client = await Database.repository('main', 'clients').getOne({ person: user.person }) as any;
        if (!client) throw new BadRequestError('El usuario no tiene un perfil de cliente asociado');

        const originCountryId = client.originCountry;

        // 2. Obtener cuentas bancarias de la plataforma filtradas por el país del cliente
        const platformAccounts = await this.PlatformBankAccounts.getAll({
            relations: [
                { association: '_PaymentMethod' },
                { association: '_Currency' }
            ]
        }, {
            [Op.or]: [
                { isGlobal: true },
                { country: originCountryId, isGlobal: false }
            ]
        
        });

        // 3. Obtener los métodos de pago disponibles
        const paymentMethods = await Database.repository('main', 'payment-methods').getAll({});

        // 4. Obtener los contactos del cliente
        const contacts = await Database.repository('main', 'contacts').getAll({}, { client: client.id });

        // 5. Obtener los países
        const countries = await Database.repository('main', 'countries').getAll({});

        return {
            client,
            platformAccounts: (platformAccounts as any).rows || platformAccounts,
            paymentMethods: (paymentMethods as any).rows || paymentMethods,
            contacts: (contacts as any).rows || contacts,
            countries: (countries as any).rows || countries
        };
    }

    async getQuote(data: any) {
        const { amount, originCurrency, destinationCurrency, originCountry, destinationCountry, paymentMethod } = data;

        if (!amount || !originCurrency || !destinationCurrency) {
            throw new BadRequestError('amount, originCurrency y destinationCurrency son obligatorios');
        }

        const quote = await PricingService.calculateQuote({
            amount: Number(amount),
            amountType: 'SENT',
            originCurrency,
            destinationCurrency,
            originCountry,
            destinationCountry,
            paymentMethod
        });

        return quote;
    }

    private get Remittances() { return Database.repository('main', 'remittances') as SequelizeRepositoryBase; }
    private get RemittanceMovements() { return Database.repository('main', 'remittance-movements') as SequelizeRepositoryBase; }
    private get RemittanceStatuses() { return Database.repository('main', 'remittance-statuses') as SequelizeRepositoryBase; }
    private get PlatformBankAccounts() { return Database.repository('main', 'platform-bank-accounts') as SequelizeRepositoryBase; }
}

export default new RemittancesService();

