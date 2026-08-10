import UserSessionsModel from '@database/models/main/user-sessions.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class UserSessionsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(UserSessionsModel);
    }
}

export default new UserSessionsRepository();