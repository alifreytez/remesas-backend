import PermissionsModel from '@database/models/main/permissions.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class PermissionsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(PermissionsModel);
    }
}
export default new PermissionsRepository();
