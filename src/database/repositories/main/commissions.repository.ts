import CommissionsModel from '@database/models/main/commissions.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class CommissionsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(CommissionsModel);
    }
}

export default new CommissionsRepository();
