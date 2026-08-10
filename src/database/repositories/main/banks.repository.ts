import BanksModel from '@database/models/main/banks.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class BanksRepository extends SequelizeRepositoryBase {
    constructor() {
        super(BanksModel);
    }
}

export default new BanksRepository();
