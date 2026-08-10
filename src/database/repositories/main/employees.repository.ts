import EmployeesModel from '@database/models/main/employees.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class EmployeesRepository extends SequelizeRepositoryBase {
    constructor() {
        super(EmployeesModel);
    }
}

export default new EmployeesRepository();
