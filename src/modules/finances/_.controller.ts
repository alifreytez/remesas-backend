import { ControllerBase } from '@bases/controller.base.js';
import financesService from './_.service.js';

class FinancesController extends ControllerBase {
    async listRates() {
        const query = this.getQueryFilters();
        const result = await financesService.listRates(query);
        this.success(result, 'Consulta exitosa');
    }

    async createRate() {
        const body = this.getBody();
        const user = this.getSession() as Record<string, any>;
        const result = await financesService.createRate(body, user?.id);
        this.created(result, 'Tasa de cambio registrada exitosamente');
    }

    async listCommissions() {
        const query = this.getQueryFilters();
        const result = await financesService.listCommissions(query);
        this.success(result, 'Consulta exitosa');
    }

    async createCommission() {
        const body = this.getBody();
        const user = this.getSession() as Record<string, any>;
        const result = await financesService.createCommission(body, user?.id);
        this.created(result, 'Comisión registrada exitosamente');
    }
}

export default new FinancesController();
