import CountryReceivingMethodsModel from '@database/models/main/country-receiving-methods.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class CountryReceivingMethodsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(CountryReceivingMethodsModel);
    }
}

export default new CountryReceivingMethodsRepository();
