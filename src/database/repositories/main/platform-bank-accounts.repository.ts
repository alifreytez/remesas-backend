import PlatformBankAccountsModel from '@database/models/main/platform-bank-accounts.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class PlatformBankAccountsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(PlatformBankAccountsModel);
    }
}

export default new PlatformBankAccountsRepository();
