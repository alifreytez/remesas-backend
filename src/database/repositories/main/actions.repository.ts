import ActionsModel from '@database/models/main/actions.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class ActionsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ActionsModel);
    }
}
export default new ActionsRepository();
