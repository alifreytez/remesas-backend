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

    private get ExchangeRates() {
        return Database.repository('main', 'exchange-rates') as SequelizeRepositoryBase;
    }
}

export default new FinancesService();
