import CountriesModel from '@database/models/main/countries.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class CountriesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(CountriesModel);
    }
}

export default new CountriesRepository();
