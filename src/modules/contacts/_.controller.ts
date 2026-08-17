import { ControllerBase } from '@bases/controller.base.js';
import contactsService from './_.service.js';

class ContactsController extends ControllerBase {
    async createContact() {
        const body = this.getBody();
        const result = await contactsService.createContact(body);
        this.created(result, 'Contacto creado exitosamente');
    }

    async updateContact() {
        const { id } = this.getParams();
        const body = this.getBody();
        const result = await contactsService.updateContact(id, body);
        this.success(result, 'Contacto actualizado exitosamente');
    }

    async deleteContact() {
        const { id } = this.getParams();
        const result = await contactsService.deleteContact(id);
        this.success(result, 'Contacto eliminado exitosamente');
    }
}

export default new ContactsController();
