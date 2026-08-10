import UsersModel from '@database/models/main/users.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class UsersRepository extends SequelizeRepositoryBase {
    constructor() {
        super(UsersModel);
    }
}

export default new UsersRepository();
