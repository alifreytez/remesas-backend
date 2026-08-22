import ModifierTypesModel from '@database/models/main/modifier-types.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class ModifierTypesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ModifierTypesModel);
    }
}

export default new ModifierTypesRepository();
