import { BaseService } from '@bases/service.base.js';
import { BadRequestError, NotFoundError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { Database } from '@database/index.js';

class UsersPermissionsService extends BaseService {
    constructor() {
        super();
    }

    async getUserPermissions({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        const PermisosUsuarios = Database.repository('main', 'user-permissions') as any;
        return await PermisosUsuarios.getFullByUser(id as string | number);
    }

    async grantUserPermissions({ id }: { id?: string | number }, permissions: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de permisos en el body');
        }

        const PermisosUsuarios = Database.repository('main', 'user-permissions') as any;
        for (const permId of permissions) {
            const existing = await PermisosUsuarios.getOne({ userId: id, permission: permId });
            if (existing) {
                await PermisosUsuarios.update({ id: existing.id }, { isGranted: true });
            } else {
                await PermisosUsuarios.create({ userId: id, permission: permId, isGranted: true });
            }
        }
        return await this.getUserPermissions({ id });
    }

    async excludeUserPermissions({ id }: { id?: string | number }, permissions: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de permisos en el body');
        }

        const PermisosUsuarios = Database.repository('main', 'user-permissions') as any;
        for (const permId of permissions) {
            const existing = await PermisosUsuarios.getOne({ userId: id, permission: permId });
            if (existing) {
                await PermisosUsuarios.update({ id: existing.id }, { isGranted: false });
            } else {
                await PermisosUsuarios.create({ userId: id, permission: permId, isGranted: false });
            }
        }
        return await this.getUserPermissions({ id });
    }

    async removeUserPermissions({ id }: { id?: string | number }, permissions: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de permisos en el body');
        }

        const PermisosUsuarios = Database.repository('main', 'user-permissions') as any;
        for (const permId of permissions) {
            await PermisosUsuarios.delete({ userId: id, permission: permId });
        }
        return await this.getUserPermissions({ id });
    }

    async removeSingleUserPermission({ id, permissionId }: { id?: string | number; permissionId?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id))) || !(Validator.isNotEmpty(permissionId) && Validator.isObjectId(String(permissionId)))) {
            throw new BadRequestError(`Invalid IDs provided: user=${id}, permission=${permissionId}`);
        }
        const PermisosUsuarios = Database.repository('main', 'user-permissions') as any;
        const affectedRows = await PermisosUsuarios.delete({ userId: id, permission: permissionId });
        if (!affectedRows) {
            throw new NotFoundError('El recurso no existe');
        }
        return await this.getUserPermissions({ id });
    }
}

export default new UsersPermissionsService();
