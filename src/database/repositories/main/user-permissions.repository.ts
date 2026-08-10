import UserPermissionsModel from '@database/models/main/user-permissions.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class UserPermissionsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(UserPermissionsModel);
    }
}

export default new UserPermissionsRepository();