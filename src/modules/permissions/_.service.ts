import { BaseService } from '@bases/service.base.js';
import { BadRequestError } from '@errors/index.js';
import { NotFoundError } from '@errors/not-found.error.js';
import { Validator } from '@utils/validator.util.js';
import { Database } from '@database/index.js';
import { Transaction } from 'sequelize';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import SharedPermissionsService from '@services/permissions.service.js';

class PermissionsService extends BaseService {
    constructor() {
        super();
    }

    async getPermissionTypes(filters: ProcessedQueryFilters) {
        return await this.TiposPermiso.getAll({ ...filters, attributes: ['id', 'codigo', 'descripcion'] });
    }

    async getPermissionActions(filters: ProcessedQueryFilters) {
        return await this.Acciones.getAll({ ...filters, attributes: ['id', 'codigo', 'descripcion'] });
    }

    async getPermissionResources(filters: ProcessedQueryFilters) {
        return await this.Recursos.getAll({ ...filters, attributes: ['id', 'codigo', 'descripcion'] });
    }

    async getAllFullPermissions(filters: ProcessedQueryFilters) {
        const result = await this.Permisos.getAll(filters);
        
        const actionsRes = await SharedPermissionsService.getCachedRbacTable('actions', 'actions');
        const resourcesRes = await SharedPermissionsService.getCachedRbacTable('resources', 'resources');
        const typesRes = await SharedPermissionsService.getCachedRbacTable('permission_types', 'permission-types');

        const actions = Array.isArray(actionsRes) ? actionsRes : [];
        const resources = Array.isArray(resourcesRes) ? resourcesRes : [];
        const permissionTypes = Array.isArray(typesRes) ? typesRes : [];

        const accMap = new Map<string | number, any>(actions.map((a: any) => [a.id, a]));
        const recMap = new Map<string | number, any>(resources.map((r: any) => [r.id, r]));
        const tipMap = new Map<string | number, any>(permissionTypes.map((t: any) => [t.id, t]));

        if (result && Array.isArray(result.rows)) {
            result.rows = result.rows.map((p: any) => {
                return {
                    ...p,
                    _Actions: accMap.get(p.action) || null,
                    _Resources: recMap.get(p.resource) || null,
                    _PermissionTypes: tipMap.get(p.permissionType || p.permission_type) || null
                };
            });
        }
        
        return result;
    }

    async getFullPermission({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        return await this.Permisos.getById(id as string | number);
    }

    async updatePermission({ id }: { id?: string | number }, { body }: { body: Record<string, any> }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            // Actualizar información propia del permiso.
            return await this.Permisos.update({ id }, body, { transaction });
        });
        await SharedPermissionsService.invalidateRbacCache(['auth.permisos', 'auth.roles_permisos', 'auth.tipos_permiso', 'auth.acciones', 'auth.recursos']);
        return result;
    }

    async createPermission({ body, nuevos }: { body: Record<string, any>; nuevos?: Record<string, any> }) {
        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            const getOrCreateId = async (Repo: any, item: any) => {
                if (!item || !item.codigo) return null;
                const found = await Repo.getOne({ codigo: item.codigo }, { transaction });
                if (found) return found.id;
                const created = await Repo.create(item, { transaction });
                return created.id;
            };

            const realBody = {
                tipoPermiso: nuevos?.tipoPermiso != null ? await getOrCreateId(this.TiposPermiso, nuevos.tipoPermiso) : body.tipoPermiso,
                accion: nuevos?.accion != null ? await getOrCreateId(this.Acciones, nuevos.accion) : body.accion,
                recurso: nuevos?.recurso != null ? await getOrCreateId(this.Recursos, nuevos.recurso) : body.recurso,
            };

            // Actualizar información propia del permiso.
            return await this.Permisos.create((this as any).upperCase(realBody), { transaction });
        });
        await SharedPermissionsService.invalidateRbacCache(['auth.permisos', 'auth.roles_permisos', 'auth.tipos_permiso', 'auth.acciones', 'auth.recursos']);
        return result;
    }

    async deletePermission({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const result = await this.Roles.transaction(async (transaction: Transaction) => {
            const permissions = (await this.RolesPermisos.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { permiso: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };
            const relPermsId = permissions.rows.map((per) => per.id);

            if (relPermsId.length > 0) {
                await this.RolesPermisos.delete(relPermsId, { transaction });
            }

            const affectedRows = await this.Permisos.delete({ id }, { transaction });
            if (!affectedRows) {
                throw new NotFoundError('El recurso no existe');
            }
            return affectedRows;
        });
        await SharedPermissionsService.invalidateRbacCache(['auth.permisos', 'auth.roles_permisos']);
        return result;
    }

    private get TiposPermiso() {
        return Database.repository('main', 'permission-types') as any;
    }

    private get Acciones() {
        return Database.repository('main', 'actions') as any;
    }

    private get Recursos() {
        return Database.repository('main', 'resources') as any;
    }

    private get Permisos() {
        return Database.repository('main', 'permissions') as any;
    }

    private get Roles() {
        return Database.repository('main', 'roles') as any;
    }

    private get RolesPermisos() {
        return Database.repository('main', 'role-permissions') as any;
    }
}

export default new PermissionsService();
