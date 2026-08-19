import { BaseService } from '@bases/service.base.js';
import { BadRequestError, NotFoundError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { Database } from '@database/index.js';
import PermissionsService from '@services/permissions.service.js';
import RolesService from '../_.service.js';

class RolesInheritancesService extends BaseService {
    constructor() {
        super();
    }

    async assignInheritances({ id }: { id?: string | number }, parentRoles: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid role id: ${id}`);
        }
        if (!Array.isArray(parentRoles) || parentRoles.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de roles en el body');
        }

        const childRoleObj = await Database.repository('main', 'roles').getById(id as string | number) as any;
        if (!childRoleObj) throw new NotFoundError('Rol no encontrado');

        for (const parentId of parentRoles) {
            if (String(parentId) === String(id)) {
                throw new BadRequestError(`Un rol no puede heredarse a sí mismo (id: ${id})`);
            }
            
            const parentRoleObj = await Database.repository('main', 'roles').getById(parentId) as any;
            if (!parentRoleObj) throw new NotFoundError(`Rol padre no encontrado (id: ${parentId})`);

            // Validar jerarquía: no puede heredar de un rol con mayor jerarquía (número menor)
            if (parentRoleObj.hierarchy < childRoleObj.hierarchy) {
                throw new BadRequestError(`El rol ${childRoleObj.code} (Jerarquía ${childRoleObj.hierarchy}) no puede heredar del rol ${parentRoleObj.code} porque este último tiene una mayor jerarquía (${parentRoleObj.hierarchy}). Solo puede heredar de roles con jerarquía menor o igual (número mayor o igual).`);
            }

            const existing = await this.RolesHerencias.getOne({ childRole: id, parentRole: parentId });
            if (!existing) {
                await this.RolesHerencias.create({ childRole: id, parentRole: parentId });
            }
        }

        await PermissionsService.invalidateRbacCache(['auth.roles_herencias']);
        return await RolesService.getFullRole({ id });
    }

    async removeInheritances({ id }: { id?: string | number }, parentRoles: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid role id: ${id}`);
        }
        if (!Array.isArray(parentRoles) || parentRoles.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de roles a desligar en el body');
        }

        for (const parentId of parentRoles) {
            await this.RolesHerencias.delete({ childRole: id, parentRole: parentId });
        }

        await PermissionsService.invalidateRbacCache(['auth.roles_herencias']);
        return await RolesService.getFullRole({ id });
    }

    async removeSingleInheritance({ id, parentRoleId }: { id?: string | number; parentRoleId?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id))) || !(Validator.isNotEmpty(parentRoleId) && Validator.isObjectId(String(parentRoleId)))) {
            throw new BadRequestError(`Invalid IDs provided: role=${id}, parentRole=${parentRoleId}`);
        }

        const affectedRows = await this.RolesHerencias.delete({ childRole: id, parentRole: parentRoleId });
        if (!affectedRows) {
            throw new NotFoundError('El recurso no existe');
        }
        await PermissionsService.invalidateRbacCache(['auth.roles_herencias']);
        return await RolesService.getFullRole({ id });
    }

    private get RolesHerencias() {
        return Database.repository('main', 'role-inheritances') as any;
    }
}

export default new RolesInheritancesService();
