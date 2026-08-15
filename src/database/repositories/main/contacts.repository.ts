import ContactsModel from '@database/models/main/contacts.model.js';
import { SequelizeRepositoryBase } from '@repositories/bases/sequelize.repository.js';

class ContactsRepository extends SequelizeRepositoryBase {
    constructor() {
        super(ContactsModel);
    }
}

export default new ContactsRepository();
