import RemittanceMovementsModel from '@database/models/main/remittance-movements.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class RemittanceMovementsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RemittanceMovementsModel);
    }
}

export default new RemittanceMovementsRepository();
