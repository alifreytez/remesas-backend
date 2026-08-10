import { BaseService } from '@bases/service.base.js';
import { BadRequestError, NotFoundError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { Database } from '@database/index.js';
import PermissionsService from '@services/permissions.service.js';

class RolesPermissionsService extends BaseService {
    constructor() {
        super();
    }

    async getRolePermissions({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        return await this.RolesPermisos.getFullByRole(id as string | number);
    }

    async assignRolePermissions({ id }: { id?: string | number }, permissions: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de permisos en el body (propiedad "permisos")');
        }

        for (const permId of permissions) {
            const existing = await this.RolesPermisos.getOne({ rol: id, permiso: permId });
            if (!existing) {
                await this.RolesPermisos.create({ rol: id, permiso: permId });
            }
        }
        await PermissionsService.invalidateRbacCache(['auth.roles_permisos']);
        return await this.getRolePermissions({ id });
    }

    async removeSingleRolePermission({ id, permissionId }: { id?: string | number; permissionId?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id))) || !(Validator.isNotEmpty(permissionId) && Validator.isObjectId(String(permissionId)))) {
            throw new BadRequestError(`Invalid IDs provided: role=${id}, permission=${permissionId}`);
        }
        const affectedRows = await this.RolesPermisos.delete({ rol: id, permiso: permissionId });
        if (!affectedRows) {
            throw new NotFoundError('El recurso no existe');
        }
        await PermissionsService.invalidateRbacCache(['auth.roles_permisos']);
        return await this.getRolePermissions({ id });
    }

    private get RolesPermisos() {
        return Database.repository('main', 'auth-roles-permisos') as any;
    }
}

export default new RolesPermissionsService();
