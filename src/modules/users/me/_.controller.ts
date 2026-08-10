import { ControllerBase } from '@bases/controller.base.js';
import { AuthError } from '@errors/index.js';
import service from './_.service.js';

class UsersMeController extends ControllerBase {
    constructor() {
        super();
    }

    private getSessionUserId(): string | number {
        const session = (this.getSession() || {}) as any;
        const userId = session.userId || session.id || session.sub;
        if (!userId) throw new AuthError('No se pudo identificar al usuario de la sesión actual', { code: 'USER_NOT_IDENTIFIED' });
        return userId;
    }

    async getSessionPermissions() {
        const session = (this.getSession() || {}) as any;
        const roles = session.roles || [];
        const permissions = session.permissions || [];
        return this.success({ roles, permissions }, 'Roles y permisos de la sesión obtenidos correctamente');
    }

    async getMyProfile() {
        const userId = this.getSessionUserId();
        const data = await service.getMyProfile({ id: userId });
        return this.success(data);
    }

    async updateMyProfile() {
        const userId = this.getSessionUserId();
        const profile = await service.updateMyProfile({ id: userId }, this.getBody());
        return this.success(profile, 'Datos de perfil actualizados correctamente');
    }

    async getMySecurity() {
        const userId = this.getSessionUserId();
        const data = await service.getMySecurity({ id: userId });
        return this.success(data);
    }

    async updateMySecurity() {
        const userId = this.getSessionUserId();
        const headers = this.getHeaders();
        const deviceId = (headers['x-device-id'] || this.getRequest().session?.deviceId || '')?.toString().trim();
        const security = await service.updateMySecurity({ id: userId, deviceId: deviceId || undefined }, this.getBody());
        return this.success(security, 'Datos de seguridad actualizados correctamente');
    }
}

export default new UsersMeController();
