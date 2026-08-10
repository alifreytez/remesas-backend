import RemittanceStatusesModel from '@database/models/main/remittance-statuses.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class RemittanceStatusesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(RemittanceStatusesModel);
    }
}

export default new RemittanceStatusesRepository();
