import RoleInheritancesModel from '@database/models/main/role-inheritances.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class RoleInheritancesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RoleInheritancesModel);
    }
}
export default new RoleInheritancesRepository();
