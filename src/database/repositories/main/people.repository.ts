import PeopleModel from '@database/models/main/people.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class PeopleRepository extends SequelizeRepositoryBase {
    constructor() {
        super(PeopleModel);
    }
}

export default new PeopleRepository();
