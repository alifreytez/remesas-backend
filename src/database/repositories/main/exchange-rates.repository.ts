import ExchangeRatesModel from '@database/models/main/exchange-rates.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class ExchangeRatesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ExchangeRatesModel);
    }
}

export default new ExchangeRatesRepository();
