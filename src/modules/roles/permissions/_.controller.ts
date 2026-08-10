import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';

class RolesPermissionsController extends ControllerBase {
    constructor() {
        super();
    }

    private extractPermissionsFromBody(body: any): Array<string | number> {
        if (Array.isArray(body)) return body;
        if (body && typeof body === 'object') {
            return body.permisos || [];
        }
        return [];
    }

    async getRolePermissions() {
        const data = await service.getRolePermissions(this.getParams());
        return this.success(data);
    }

    async assignRolePermissions() {
        const permissions = this.extractPermissionsFromBody(this.getBody());
        const data = await service.assignRolePermissions(this.getParams(), permissions);
        return this.success(data);
    }

    async removeSingleRolePermission() {
        const params = (this.getParams() || {}) as any;
        const result = await service.removeSingleRolePermission({ id: params.id, permissionId: params.permissionId });
        return this.success(result);
    }
}

export default new RolesPermissionsController();
