import CurrenciesModel from '@database/models/main/currencies.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class CurrenciesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(CurrenciesModel);
    }
}

export default new CurrenciesRepository();
