import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';

class UsersRolesController extends ControllerBase {
    constructor() {
        super();
    }

    private extractRolesFromBody(body: any): Array<string | number> {
        if (Array.isArray(body)) return body;
        if (body && typeof body === 'object') {
            if (Array.isArray(body.roles)) return body.roles;
            if (Array.isArray(body.rol)) return body.rol;
            if (body.rol !== undefined) return [body.rol];
            if (body.roleId !== undefined) return [body.roleId];
        }
        return [];
    }

    async getUserRoles() {
        const data = await service.getUserRoles(this.getParams());
        return this.success(data);
    }

    async assignUserRoles() {
        const roles = this.extractRolesFromBody(this.getBody());
        const data = await service.assignUserRoles(this.getParams(), roles);
        return this.success(data);
    }

    async removeSingleUserRole() {
        const params = (this.getParams() || {}) as any;
        const result = await service.removeSingleUserRole({
            id: params.id,
            roleId: params.roleId,
        });
        return this.success(result);
    }
}

export default new UsersRolesController();
