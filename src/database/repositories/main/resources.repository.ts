import ResourcesModel from '@database/models/main/resources.model.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';

class ResourcesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ResourcesModel);
    }
}
export default new ResourcesRepository();
