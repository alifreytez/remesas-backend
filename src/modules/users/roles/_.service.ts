import { BaseService } from '@bases/service.base.js';
import { BadRequestError, NotFoundError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { Database } from '@database/index.js';

class UsersRolesService extends BaseService {
    constructor() {
        super();
    }

    async getUserRoles({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        return await this.RolesUsuarios.getFullByUser({ usuario: id });
    }

    async assignUserRoles({ id }: { id?: string | number }, roles: Array<string | number>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestError('Debe proporcionar un arreglo de IDs de roles en el body (propiedad "roles" o "rol")');
        }

        for (const rolId of roles) {
            const existing = await this.RolesUsuarios.getOne({ usuario: id, rol: rolId });
            if (!existing) {
                await this.RolesUsuarios.create({ usuario: id, rol: rolId });
            }
        }
        return await this.getUserRoles({ id });
    }

    async removeSingleUserRole({ id, roleId }: { id?: string | number; roleId?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id))) || !(Validator.isNotEmpty(roleId) && Validator.isObjectId(String(roleId)))) {
            throw new BadRequestError(`Invalid IDs provided: user=${id}, role=${roleId}`);
        }
        const affectedRows = await this.RolesUsuarios.delete({ usuario: id, rol: roleId });
        if (!affectedRows) {
            throw new NotFoundError('El recurso no existe');
        }
        return await this.getUserRoles({ id });
    }

    private get RolesUsuarios() {
        return Database.repository('main', 'auth-roles-usuarios') as any;
    }
}

export default new UsersRolesService();
