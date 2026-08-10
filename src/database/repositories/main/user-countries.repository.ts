import UserCountriesModel from '@database/models/main/user-countries.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class UserCountriesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(UserCountriesModel);
    }
}

export default new UserCountriesRepository();
