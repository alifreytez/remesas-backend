import { ControllerBase } from '@bases/controller.base.js';
import { AuthError } from '@errors/index.js';
import service from './_.service.js';

class UsersController extends ControllerBase {
    private getSessionUserId(): string | number {
        const session = (this.getSession() || {}) as any;
        const userId = session.userId || session.id || session.sub;
        if (!userId) {
            throw new AuthError('No se pudo identificar al usuario de la sesión actual', { code: 'USER_NOT_IDENTIFIED' });
        }
        return userId;
    }

    private formatUserPayload(payload: any) {
        if (!payload || typeof payload !== 'object') return { body: {} };
        const { roles, permissions, body, ...rest } = payload;
        return {
            body: body || rest || {},
            roles,
            permissions,
        };
    }

    async getAllFullUsers() {
        const data = await service.getAllFullUsers(this.getQueryFilters());
        return this.success(data);
    }

    async getFullUser() {
        const data = await service.getFullUser(this.getParams());
        return this.success(data);
    }

    async createUser() {
        const data = await service.createUser(this.formatUserPayload(this.getBody()));
        return this.created(data);
    }

    async updateUser() {
        const result = await service.updateUser(this.getParams(), this.formatUserPayload(this.getBody()));
        return this.updated(result);
    }

    async deleteUser() {
        const params = (this.getParams() || {}) as any;
        const body = (this.getBody() || {}) as any;
        const result = await service.deleteUser({ id: params.id || body.id });
        return this.success(result);
    }

    async restoreUser() {
        const params = (this.getParams() || {}) as any;
        const result = await service.restoreUser({ id: params.id });
        return this.success(result);
    }
}

export default new UsersController();
