import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';

class RolesController extends ControllerBase {
    async getAllFullRoles() {
        const data = await service.getAllFullRoles(this.getQueryFilters());
        return this.success(data);
    }

    async getFullRole() {
        const data = await service.getFullRole(this.getParams(), this.getQueryFilters());
        return this.success(data);
    }

    private formatRolePayload(payload: any) {
        if (!payload || typeof payload !== 'object') return { body: {} };
        const { permisos, permisosEliminar, body, ...rest } = payload;
        return {
            body: body || rest || {},
            permisos,
            permisosEliminar,
        };
    }

    async createRole() {
        const data = await service.createRole(this.formatRolePayload(this.getBody()));
        return this.created(data);
    }

    async updateRole() {
        const result = await service.updateRole(this.getParams(), this.formatRolePayload(this.getBody()));
        return this.updated(result);
    }

    async deleteRole() {
        const params = (this.getParams() || {}) as any;
        const body = (this.getBody() || {}) as any;
        const result = await service.deleteRole({ id: params.id || body.id });
        return this.success(result);
    }
}

export default new RolesController();
