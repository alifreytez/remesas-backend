import BankReceivingMethodsModel from '@database/models/main/bank-receiving-methods.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class BankReceivingMethodsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(BankReceivingMethodsModel);
    }
}

export default new BankReceivingMethodsRepository();
