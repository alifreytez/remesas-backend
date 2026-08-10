import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';

class PermissionsController extends ControllerBase {
    async getPermissionTypes() {
        const data = await service.getPermissionTypes(this.getQueryFilters());
        return this.success(data);
    }

    async getPermissionActions() {
        const data = await service.getPermissionActions(this.getQueryFilters());
        return this.success(data);
    }

    async getPermissionResources() {
        const data = await service.getPermissionResources(this.getQueryFilters());
        return this.success(data);
    }

    async getAllFullPermissions() {
        const data = await service.getAllFullPermissions(this.getQueryFilters());
        return this.success(data);
    }

    async getFullPermission() {
        const data = await service.getFullPermission(this.getParams());
        return this.success(data);
    }

    private formatPermissionPayload(payload: any) {
        if (!payload || typeof payload !== 'object') return { body: {} };
        const { nuevos, body, ...rest } = payload;
        return {
            body: body || rest || {},
            nuevos,
        };
    }

    async createPermission() {
        const data = await service.createPermission(this.formatPermissionPayload(this.getBody()));
        return this.created(data);
    }

    async updatePermission() {
        const result = await service.updatePermission(this.getParams(), this.formatPermissionPayload(this.getBody()));
        return this.updated(result);
    }

    async deletePermission() {
        const params = (this.getParams() || {}) as any;
        const body = (this.getBody() || {}) as any;
        const result = await service.deletePermission({ id: params.id || body.id });
        return this.success(result);
    }
}

export default new PermissionsController();
