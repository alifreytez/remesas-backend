import { BaseService } from '@bases/service.base.js';
import { Database } from '@database/index.js';
import { BadRequestError, NotFoundError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';

class ContactsService extends BaseService {
    constructor() {
        super();
    }

    async getContactsByClient(clientId: string | number, filters: ProcessedQueryFilters) {
        if (!clientId || !Validator.isObjectId(String(clientId))) {
            throw new BadRequestError('ID de cliente inválido');
        }
        
        // Sobreescribimos cualquier filtro de 'client' que venga en query params por seguridad
        const mergedFilters = {
            ...filters,
            qc: {
                ...filters.qc,
                client: clientId
            }
        };

        return await this.Contacts.getAll({
            ...mergedFilters,
            relations: [{ association: '_Client' }, { association: '_Country' }]
        } as any);
    }

    async getContactByIdAndClient(contactId: string | number, clientId: string | number) {
        if (!contactId || !Validator.isObjectId(String(contactId))) {
            throw new BadRequestError('ID de contacto inválido');
        }
        
        const contact = await this.Contacts.getById(contactId as string | number, {
            relations: [{ association: '_Client' }, { association: '_Country' }]
        });
        
        // Si no existe o no pertenece al cliente, retornamos NotFound por seguridad (IDOR preventivo)
        if (!contact || String(contact.client) !== String(clientId)) {
            throw new NotFoundError('El contacto no existe o no tienes permiso para verlo');
        }
        
        return contact;
    }

    async createContact(body: Record<string, any>) {
        if (!body.client) {
            throw new BadRequestError('El ID del cliente es requerido para crear un contacto');
        }
        return await this.Contacts.create(body);
    }

    async updateContact(id: string | number, body: Record<string, any>) {
        if (!id || !Validator.isObjectId(String(id))) {
            throw new BadRequestError('ID de contacto inválido');
        }
        // Evitamos cambiar el dueño del contacto por seguridad
        delete body.client;

        const updated = await this.Contacts.update({ id }, body);
        if (!updated) {
            throw new NotFoundError('El contacto no existe');
        }
        return updated;
    }

    async deleteContact(id: string | number) {
        if (!id || !Validator.isObjectId(String(id))) {
            throw new BadRequestError('ID de contacto inválido');
        }
        const deleted = await this.Contacts.delete({ id });
        if (!deleted) {
            throw new NotFoundError('El contacto no existe');
        }
        return deleted;
    }

    private get Contacts() {
        return Database.repository('main', 'contacts') as any;
    }
}

export default new ContactsService();
