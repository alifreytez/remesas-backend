import { BaseService } from '@bases/service.base.js';
import { BadRequestError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { Database } from '@database/index.js';
import { Transaction } from 'sequelize';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { NotFoundError } from '@errors/not-found.error.js';
import PermissionsService from '@services/permissions.service.js';

class RolesService extends BaseService {
    constructor() {
        super();
    }

    async getAllFullRoles(filters: ProcessedQueryFilters) {
        return await this.Roles.getAllFull(filters);
    }

    async getFullRole({ id }: { id?: string | number }, filters: ProcessedQueryFilters) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) throw new BadRequestError(`Invalid id: ${id}`);

        return await this.Roles.getFull(id as string | number, filters);
    }

    async updateRole(
        { id }: { id?: string | number },
        {
            body,
            permisos,
            permisosEliminar,
        }: {
            body: Record<string, any>;
            permisos?: Array<string | number>;
            permisosEliminar?: Array<string | number>;
        }
    ) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            let updated = null;

            if (body && Object.keys(body).length > 0) updated = await this.Roles.update({ id }, body, { transaction });

            if (permisosEliminar && permisosEliminar.length > 0) await this.RolesPermisos.delete(permisosEliminar, { transaction });

            if (permisos && permisos.length > 0) {
                const newPerms = permisos.map((per) => ({ rol: id, permiso: per }));
                await this.RolesPermisos.bulkCreate(newPerms, { transaction });
            }

            return updated;
        });
        await PermissionsService.invalidateRbacCache(['auth.roles_permisos', 'auth.roles_herencias']);
        return result;
    }

    async createRole({ body, permisos }: { body: Record<string, any>; permisos?: Array<string | number> }) {
        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            const created = await this.Roles.create((this as any).upperCase(body), { transaction });

            if (permisos && permisos.length > 0) {
                const newPerms = permisos.map((per) => ({ rol: created.id, permiso: per }));
                await this.RolesPermisos.bulkCreate(newPerms, { transaction });
            }

            return created;
        });
        await PermissionsService.invalidateRbacCache(['auth.roles_permisos', 'auth.roles_herencias']);
        return result;
    }

    async deleteRole({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            const permissions = (await this.RolesPermisos.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { rol: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };
            const users = (await this.RolesUsuarios.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { rol: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };
            const specs = (await this.RolesEspecificaciones.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { rol: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };
            const requestRelation = (await this.RelacionTiposSolcaj.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { rolEncargado: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };

            const relPermsId = permissions.rows.map((per) => per.id);
            const relUsersId = users.rows.map((usr) => usr.id);
            const relSpecsId = specs.rows.map((spc) => spc.id);
            const relRequestRelationId = requestRelation.rows.map((reqRel) => reqRel.id);

            if (relPermsId.length > 0) await this.RolesPermisos.delete(relPermsId, { transaction });
            if (relUsersId.length > 0) await this.RolesUsuarios.delete(relUsersId, { transaction });
            if (relSpecsId.length > 0) await this.RolesEspecificaciones.delete(relSpecsId, { transaction });
            if (relRequestRelationId.length > 0) await this.RelacionTiposSolcaj.delete(relRequestRelationId, { transaction });

            await this.RolesHerencias.delete({ childRole: id }, { transaction });
            await this.RolesHerencias.delete({ parentRole: id }, { transaction });

            const affectedRows = await this.Roles.delete({ id }, { transaction });
            if (!affectedRows) {
                throw new NotFoundError('El recurso no existe');
            }
            return affectedRows;
        });
        await PermissionsService.invalidateRbacCache(['auth.roles_permisos', 'auth.roles_herencias']);
        return result;
    }

    private get Roles() {
        return Database.repository('main', 'auth-roles') as any;
    }

    private get RolesPermisos() {
        return Database.repository('main', 'auth-roles-permisos') as any;
    }

    private get RolesUsuarios() {
        return Database.repository('main', 'auth-roles-usuarios') as any;
    }

    private get RolesEspecificaciones() {
        return Database.repository('main', 'auth-roles-especificaciones') as any;
    }

    private get RelacionTiposSolcaj() {
        return Database.repository('main', 'tes-relacion-tipos-solcaj') as any;
    }

    private get RolesHerencias() {
        return Database.repository('main', 'auth-roles-herencias') as any;
    }
}

export default new RolesService();
