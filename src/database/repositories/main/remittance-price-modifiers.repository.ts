import RemittancePriceModifiersModel from '@database/models/main/remittance-price-modifiers.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class RemittancePriceModifiersRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RemittancePriceModifiersModel);
    }
}

export default new RemittancePriceModifiersRepository();
