import PriceModifiersModel from '@database/models/main/price-modifiers.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class PriceModifiersRepository extends SequelizeRepositoryBase {
    constructor() {
        super(PriceModifiersModel);
    }
}

export default new PriceModifiersRepository();
