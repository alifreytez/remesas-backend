import { BaseService } from '@bases/service.base.js';
import { Database } from '@database/index.js';
import { BadRequestError } from '@errors/index.js';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class FinancesService extends BaseService {
    // --- TASAS DE CAMBIO ---

    async listRates(filters: ProcessedQueryFilters) {
        return await this.ExchangeRates.getAll({
            ...filters,
            relations: [
                { association: '_InitialCountry' },
                { association: '_SecondaryCountry' },
                { association: '_Creator' }
            ]
        });
    }

    async getRateById(id: string | number) {
        return await this.ExchangeRates.getOne({ id }, {
            relations: [
                { association: '_InitialCountry' },
                { association: '_SecondaryCountry' },
                { association: '_Creator' }
            ]
        });
    }

    async createRate(data: any, createdBy: string | number) {
        const { initialCountry, secondaryCountry, rate } = data;

        if (!initialCountry || !secondaryCountry || !rate) {
            throw new BadRequestError('Faltan datos requeridos (initialCountry, secondaryCountry, rate)');
        }

        const newRate = await this.ExchangeRates.create({
            initialCountry,
            secondaryCountry,
            rate,
            createdBy
        });

        return this.getRateById(newRate.id);
    }

    // --- COMISIONES ---

    async listCommissions(filters: ProcessedQueryFilters) {
        return await this.Commissions.getAll({
            ...filters,
            relations: [
                { association: '_OriginCountry' },
                { association: '_CreatedBy' }
            ]
        });
    }

    async getCommissionById(id: string | number) {
        return await this.Commissions.getOne({ id }, {
            relations: [
                { association: '_OriginCountry' },
                { association: '_CreatedBy' }
            ]
        });
    }

    async createCommission(data: any, createdBy: string | number) {
        const { originCountry, fixedAmount, percentage } = data;

        if (!originCountry || (fixedAmount === undefined && percentage === undefined)) {
            throw new BadRequestError('Faltan datos requeridos. Debe indicar originCountry y al menos fixedAmount o percentage');
        }

        const newComm = await this.Commissions.create({
            originCountry,
            fixedAmount: fixedAmount || 0,
            percentage: percentage || 0,
            createdBy
        });

        return this.getCommissionById(newComm.id);
    }

    private get ExchangeRates() {
        return Database.repository('main', 'exchange-rates') as SequelizeRepositoryBase;
    }

    private get Commissions() {
        return Database.repository('main', 'commissions') as SequelizeRepositoryBase;
    }
}

export default new FinancesService();
