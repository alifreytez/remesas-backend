import { ControllerBase } from '@bases/controller.base.js';
import remittancesService from './_.service.js';
import { AuthError } from '@errors/auth.error.js';

class RemittancesController extends ControllerBase {
    async list() {
        const query = this.getQueryFilters();
        const result = await remittancesService.list(query);
        this.success(result, 'Consulta exitosa');
    }

    async getById() {
        const { id } = this.getParams();
        const result = await remittancesService.getById(id);
        this.success(result, 'Consulta exitosa');
    }

    async create() {
        const body = this.getBody();
        const user = this.getSession() as Record<string, any>;
        const result = await remittancesService.create(body, user?.id);
        this.created(result, 'Remesa registrada exitosamente');
    }

    async updateStatus() {
        const { id } = this.getParams();
        const body = this.getBody();
        const user = this.getSession() as Record<string, any>;
        const result = await remittancesService.updateStatus(id, body, user?.id);
        this.success(result, 'Estado de la remesa actualizado exitosamente');
    }

    async getOptions() {
        const user = this.getSession() as Record<string, any>;
        if (!user || !user.id) {
            throw new AuthError('Usuario no autenticado');
            return;
        }
        const result = await remittancesService.getOptions(user.id);
        this.success(result, 'Opciones obtenidas exitosamente');
    }

    async getQuote() {
        const body = this.getBody();
        const result = await remittancesService.getQuote(body);
        this.success(result, 'Cotización calculada exitosamente');
    }
}

export default new RemittancesController();
