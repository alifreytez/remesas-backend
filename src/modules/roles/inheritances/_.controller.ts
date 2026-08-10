import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';

class RolesInheritancesController extends ControllerBase {
    constructor() {
        super();
    }

    private extractArrayFromBody(body: any): Array<string | number> {
        if (Array.isArray(body)) return body;
        if (body && typeof body === 'object') {
            return body.herencias || [];
        }
        return [];
    }

    async assignInheritances() {
        const parentRoles = this.extractArrayFromBody(this.getBody());
        const data = await service.assignInheritances(this.getParams(), parentRoles);
        return this.success(data);
    }

    async removeInheritances() {
        const parentRoles = this.extractArrayFromBody(this.getBody());
        const result = await service.removeInheritances(this.getParams(), parentRoles);
        return this.updated(result);
    }

    async removeSingleInheritance() {
        const params = (this.getParams() || {}) as any;
        const result = await service.removeSingleInheritance({ id: params.id, parentRoleId: params.parentRoleId });
        return this.success(result);
    }
}

export default new RolesInheritancesController();
