import UserTypesModel from '@database/models/main/user-types.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class UserTypesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(UserTypesModel);
    }
}

export default new UserTypesRepository();
