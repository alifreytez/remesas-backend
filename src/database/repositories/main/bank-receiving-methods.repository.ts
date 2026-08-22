import BankPaymentMethodsModel from '@database/models/main/bank-payment-methods.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class BankPaymentMethodsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(BankPaymentMethodsModel);
    }
}

export default new BankPaymentMethodsRepository();

