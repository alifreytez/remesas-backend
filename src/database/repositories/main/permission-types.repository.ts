import PermissionTypesModel from '@database/models/main/permission-types.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class PermissionTypesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(PermissionTypesModel);
    }
}
export default new PermissionTypesRepository();
