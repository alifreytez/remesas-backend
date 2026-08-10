import RolePermissionsModel from '@database/models/main/role-permissions.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class RolePermissionsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RolePermissionsModel);
    }
}
export default new RolePermissionsRepository();
