import RemittancesModel from '@database/models/main/remittances.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class RemittancesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RemittancesModel);
    }
}

export default new RemittancesRepository();
