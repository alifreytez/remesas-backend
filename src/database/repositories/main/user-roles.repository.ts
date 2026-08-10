import UserRolesModel from '@database/models/main/user-roles.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class UserRolesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(UserRolesModel);
    }
}

export default new UserRolesRepository();