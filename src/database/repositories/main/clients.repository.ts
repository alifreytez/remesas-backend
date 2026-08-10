import ClientsModel from '@database/models/main/clients.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class ClientsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ClientsModel);
    }
}

export default new ClientsRepository();
