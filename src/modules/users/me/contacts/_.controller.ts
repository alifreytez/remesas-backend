import { ControllerBase } from '@bases/controller.base.js';
import { AuthError, NotFoundError } from '@errors/index.js';
import { Database } from '@database/index.js';
// Importamos dinámicamente o usamos el servicio de contactos
import contactsService from '@modules/contacts/_.service.js';

class UsersMeContactsController extends ControllerBase {
    
    private getSessionUserId(): string | number {
        const session = (this.getSession() || {}) as any;
        const userId = session.userId || session.id || session.sub;
        if (!userId) throw new AuthError('No se pudo identificar al usuario de la sesión actual', { code: 'USER_NOT_IDENTIFIED' });
        return userId;
    }

    private async getMyClientId(): Promise<string | number> {
        const userId = this.getSessionUserId();
        
        const Users = Database.repository('main', 'users') as any;
        const user = await Users.getOne({ id: userId });
        if (!user || !user.person) {
            throw new NotFoundError('No se pudo resolver el perfil de persona para el usuario actual');
        }

        const Clients = Database.repository('main', 'clients') as any;
        const client = await Clients.getOne({ person: user.person });
        
        if (!client) {
            throw new NotFoundError('Este usuario no tiene un perfil de cliente asociado');
        }

        return client.id;
    }

    async getMyContacts() {
        const clientId = await this.getMyClientId();
        const query = this.getQueryFilters();
        const result = await contactsService.getContactsByClient(clientId, query);
        this.success(result, 'Contactos obtenidos exitosamente');
    }

    async getMyContactById() {
        const clientId = await this.getMyClientId();
        const { contactId } = this.getParams();
        const result = await contactsService.getContactByIdAndClient(contactId, clientId);
        this.success(result, 'Contacto obtenido exitosamente');
    }

    async createMyContact() {
        const clientId = await this.getMyClientId();
        const body = this.getBody();
        body.client = clientId; // Forzamos el ID del cliente actual por seguridad
        
        const result = await contactsService.createContact(body);
        this.created(result, 'Contacto agregado exitosamente a tu libreta');
    }

    async updateMyContact() {
        const clientId = await this.getMyClientId();
        const { contactId } = this.getParams();
        const body = this.getBody();
        
        // Verificamos que el contacto le pertenece antes de actualizar
        await contactsService.getContactByIdAndClient(contactId, clientId);
        
        const result = await contactsService.updateContact(contactId, body);
        this.success(result, 'Contacto actualizado exitosamente');
    }

    async deleteMyContact() {
        const clientId = await this.getMyClientId();
        const { contactId } = this.getParams();
        
        // Verificamos que el contacto le pertenece antes de eliminar
        await contactsService.getContactByIdAndClient(contactId, clientId);
        
        await contactsService.deleteContact(contactId);
        this.success(null, 'Contacto eliminado exitosamente');
    }
}

export default new UsersMeContactsController();
