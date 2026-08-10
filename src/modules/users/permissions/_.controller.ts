import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';

class UsersPermissionsController extends ControllerBase {
    constructor() {
        super();
    }

    private extractArrayFromBody(body: any): Array<string | number> {
        if (Array.isArray(body)) return body;
        if (body && typeof body === 'object') return body.permisos || [];
        return [];
    }

    async getUserPermissions() {
        const data = await service.getUserPermissions(this.getParams());
        return this.success(data);
    }

    async grantUserPermissions() {
        const permissions = this.extractArrayFromBody(this.getBody());
        const data = await service.grantUserPermissions(this.getParams(), permissions);
        return this.success(data);
    }

    async excludeUserPermissions() {
        const permissions = this.extractArrayFromBody(this.getBody());
        const data = await service.excludeUserPermissions(this.getParams(), permissions);
        return this.success(data);
    }

    async removeUserPermissions() {
        const permissions = this.extractArrayFromBody(this.getBody());
        const result = await service.removeUserPermissions(this.getParams(), permissions);
        return this.success(result);
    }

    async removeSingleUserPermission() {
        const params = (this.getParams() || {}) as any;
        const result = await service.removeSingleUserPermission({
            id: params.id,
            permissionId: params.permissionId,
        });
        return this.success(result);
    }
}

export default new UsersPermissionsController();
