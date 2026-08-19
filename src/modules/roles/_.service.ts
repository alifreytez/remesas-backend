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
        const result = (await this.Roles.getAll(filters)) as { rows: any[]; count: number };
        const inheritances = (await this.RolesHerencias.getAll({ pagination: { offset: 0, limit: 1000 } } as any)) as { rows: any[] };
        const allRolesResult = (await this.Roles.getAll({ pagination: { offset: 0, limit: 1000 } } as any)) as { rows: any[] };
        
        const roleMap = new Map(allRolesResult.rows.map(r => [r.id, r]));

        const enrichedRows = result.rows.map(r => {
            const data = r.toJSON ? r.toJSON() : r;
            const parentIds = inheritances.rows.filter(i => i.childRole === r.id).map(i => i.parentRole);
            data.parentRoles = parentIds.map(pid => roleMap.get(pid)).filter(Boolean);
            return data;
        });

        return { ...result, rows: enrichedRows };
    }

    async getFullRole({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) throw new BadRequestError(`Invalid id: ${id}`);

        const role = (await this.Roles.getById(id as string | number)) as any;
        if (!role) return null;

        const parentRoles = (await this.RolesHerencias.getAll({ pagination: { offset: 0, limit: 1000 }, order: [['id', 'asc']], qc: {} } as any, { childRole: id })) as { rows: any[] };
        const permissions = (await this.RolesPermisos.getAll({ pagination: { offset: 0, limit: 1000 }, order: [['id', 'asc']], qc: {} } as any, { role: id })) as { rows: any[] };

        const roleData = role.toJSON ? role.toJSON() : role;
        
        return {
            ...roleData,
            _ParentRoles: parentRoles.rows,
            _Permissions: permissions.rows
        };
    }

    async updateRole(
        { id }: { id?: string | number },
        {
            body,
            permissions,
            permissionsToRemove,
        }: {
            body: Record<string, any>;
            permissions?: Array<string | number>;
            permissionsToRemove?: Array<string | number>;
        }
    ) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            let updated = null;

            if (body && Object.keys(body).length > 0) updated = await this.Roles.update({ id }, body, { transaction });

                        if (permissionsToRemove && permissionsToRemove.length > 0) {
                await this.RolesPermisos.delete({ role: id, permission: permissionsToRemove }, { transaction });
            }

            if (permissions && permissions.length > 0) {
                const newPerms = permissions.map((per) => ({ role: id, permission: per }));
                await this.RolesPermisos.bulkCreate(newPerms, { transaction });
            }

            return updated;
        });
        await PermissionsService.invalidateRbacCache(['auth.roles_permisos', 'auth.roles_herencias']);
        return result;
    }

    async createRole({ body, permissions }: { body: Record<string, any>; permissions?: Array<string | number> }) {
        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            const created = await this.Roles.create((this as any).upperCase(body), { transaction });

            if (permissions && permissions.length > 0) {
                const newPerms = permissions.map((per) => ({ role: created.id, permission: per }));
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
            const permissions = (await this.RolesPermisos.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { role: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };
            const users = (await this.RolesUsuarios.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { role: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };

            const relPermsId = permissions.rows.map((per) => per.id);
            const relUsersId = users.rows.map((usr) => usr.id);

            if (relPermsId.length > 0) await this.RolesPermisos.delete(relPermsId, { transaction });
            if (relUsersId.length > 0) await this.RolesUsuarios.delete(relUsersId, { transaction });

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
        return Database.repository('main', 'roles') as any;
    }

    private get RolesPermisos() {
        return Database.repository('main', 'role-permissions') as any;
    }

    private get RolesUsuarios() {
        return Database.repository('main', 'user-roles') as any;
    }

    private get RolesHerencias() {
        return Database.repository('main', 'role-inheritances') as any;
    }
}

export default new RolesService();






