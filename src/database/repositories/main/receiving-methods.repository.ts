import PaymentMethodsModel from '@database/models/main/payment-methods.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class PaymentMethodsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(PaymentMethodsModel);
    }
}

export default new PaymentMethodsRepository();

