import RolesModel from '@database/models/main/roles.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class RolesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RolesModel);
    }
}

export default new RolesRepository();