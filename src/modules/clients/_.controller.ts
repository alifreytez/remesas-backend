import { ControllerBase } from '@bases/controller.base.js';
import clientsService from './_.service.js';

class ClientsController extends ControllerBase {
    async list() {
        const query = this.getQueryFilters();
        const result = await clientsService.list(query);
        this.success(result, 'Consulta exitosa');
    }

    async getById() {
        const { id } = this.getParams();
        const result = await clientsService.getById(id);
        this.success(result, 'Consulta exitosa');
    }

    async create() {
        const body = this.getBody();
        const result = await clientsService.create(body);
        this.created(result, 'Cliente creado exitosamente');
    }

    async update() {
        const { id } = this.getParams();
        const body = this.getBody();
        const result = await clientsService.update(id, body);
        this.success(result, 'Cliente actualizado exitosamente');
    }

    async remove() {
        const { id } = this.getParams();
        await clientsService.remove(id);
        this.success(null, 'Cliente eliminado exitosamente');
    }
}

export default new ClientsController();
