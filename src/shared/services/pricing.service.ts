import { BaseService } from '@bases/service.base.js';
import { Database } from '@database/index.js';
import { BadRequestError } from '@errors/index.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';
import { Op } from 'sequelize';

export interface QuoteParams {
    amount: number;
    amountType: 'SENT' | 'RECEIVED';
    originCurrency: number;
    destinationCurrency: number;
    originCountry?: number;
    destinationCountry?: number;
    paymentMethod?: number;
    platformBankAccount?: number;
}

export interface AppliedModifier {
    modifierId: number;
    name: string;
    amountApplied: number;
    modifierType: string;
}

export interface QuoteResult {
    amountSent: number;
    amountReceived: number;
    exchangeRateApplied: number;
    exchangeRateValue: number;
    totalFees: number;
    totalDiscounts: number;
    totalTaxes: number;
    amountToPay: number; // Monto real que el cliente debe pagar (amountSent + fees + taxes - discounts)
    appliedModifiers: AppliedModifier[];
}

class PricingService extends BaseService {
    async calculateQuote(params: QuoteParams): Promise<QuoteResult> {
        const { amount, amountType, originCurrency, destinationCurrency, originCountry, destinationCountry, paymentMethod } = params;

        if (amount <= 0) {
            throw new BadRequestError('El monto debe ser mayor a cero');
        }

        // 1. Buscar Tasa de Cambio aplicable
        const exchangeRates = await this.ExchangeRates.getAll({
            
            order: [['created_at', 'desc']]
        }, {
            initialCurrency: originCurrency,
            secondaryCurrency: destinationCurrency
        }) as Record<string, any>[];

        if (!exchangeRates || exchangeRates.length === 0) {
            throw new BadRequestError('No hay tasa de cambio disponible para estas monedas');
        }

        const currentRate = exchangeRates[0];
        const rateValue = Number(currentRate.rate);

        // Calcular montos base
        let baseAmountSent = 0;
        let baseAmountReceived = 0;

        if (amountType === 'SENT') {
            baseAmountSent = amount;
            baseAmountReceived = amount * rateValue;
        } else {
            baseAmountReceived = amount;
            baseAmountSent = amount / rateValue;
        }

        // 2. Buscar Modificadores de Precio aplicables
        // Se aplican si la condición coincide o es NULL
        const modifiers = await this.PriceModifiers.getAll({
            relations: [
                { association: '_ModifierType' }
            ]
        }, {
            [Op.and]: [
                {
                    [Op.or]: [
                        { originCountry: originCountry },
                        { originCountry: { [Op.is]: null } }
                    ]
                },
                {
                    [Op.or]: [
                        { destinationCountry: destinationCountry },
                        { destinationCountry: { [Op.is]: null } }
                    ]
                },
                {
                    [Op.or]: [
                        { currency: originCurrency || null },
                        { currency: { [Op.is]: null } }
                    ]
                },
                {
                    [Op.or]: [
                        { paymentMethod: paymentMethod || null },
                        { paymentMethod: { [Op.is]: null } }
                    ]
                },
                {
                    [Op.or]: [
                        { minAmount: { [Op.lte]: baseAmountSent } },
                        { minAmount: { [Op.is]: null } }
                    ]
                },
                {
                    [Op.or]: [
                        { maxAmount: { [Op.gte]: baseAmountSent } },
                        { maxAmount: { [Op.is]: null } }
                    ]
                }
            ]
        }) as Record<string, any>[];

        let totalFees = 0;
        let totalDiscounts = 0;
        let totalTaxes = 0;
        const appliedModifiers: AppliedModifier[] = [];

        // 3. Aplicar Modificadores
        for (const mod of modifiers) {
            const modAmount = Number(mod.amount);
            let calculatedValue = 0;

            if (mod.isPercentage) {
                calculatedValue = baseAmountSent * (modAmount / 100);
            } else {
                calculatedValue = modAmount;
            }

            const modTypeName = mod._ModifierType?.name?.toLowerCase() || '';
            let modTypeCategory = 'FEE';

            if (modTypeName.includes('descuento') || modTypeName.includes('discount')) {
                totalDiscounts += calculatedValue;
                modTypeCategory = 'DISCOUNT';
            } else if (modTypeName.includes('impuesto') || modTypeName.includes('tax')) {
                totalTaxes += calculatedValue;
                modTypeCategory = 'TAX';
            } else {
                totalFees += calculatedValue;
            }

            appliedModifiers.push({
                modifierId: mod.id,
                name: mod.name,
                amountApplied: calculatedValue,
                modifierType: modTypeCategory
            });
        }

        const amountToPay = baseAmountSent + totalFees + totalTaxes - totalDiscounts;

        return {
            amountSent: baseAmountSent,
            amountReceived: baseAmountReceived,
            exchangeRateApplied: currentRate.id,
            exchangeRateValue: rateValue,
            totalFees,
            totalDiscounts,
            totalTaxes,
            amountToPay,
            appliedModifiers
        };
    }

    private get ExchangeRates() {
        return Database.repository('main', 'exchange-rates') as SequelizeRepositoryBase;
    }

    private get PriceModifiers() {
        return Database.repository('main', 'price-modifiers') as SequelizeRepositoryBase;
    }
}

export default new PricingService();
