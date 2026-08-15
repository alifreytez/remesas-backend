import ReceivingMethodsModel from '@database/models/main/receiving-methods.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class ReceivingMethodsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ReceivingMethodsModel);
    }
}

export default new ReceivingMethodsRepository();
