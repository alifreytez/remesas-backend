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
        return await this.TiposPermiso.getAllActive({ ...filters, attributes: ['id', 'codigo', 'descripcion'] });
    }

    async getPermissionActions(filters: ProcessedQueryFilters) {
        return await this.Acciones.getAllActive({ ...filters, attributes: ['id', 'codigo', 'descripcion'] });
    }

    async getPermissionResources(filters: ProcessedQueryFilters) {
        return await this.Recursos.getAllActive({ ...filters, attributes: ['id', 'codigo', 'descripcion'] });
    }

    async getAllFullPermissions(filters: ProcessedQueryFilters) {
        return await this.Permisos.getAllFull(filters);
    }

    async getFullPermission({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        return await this.Permisos.getFull(id as string | number);
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
        return Database.repository('main', 'auth-tipos-permiso') as any;
    }

    private get Acciones() {
        return Database.repository('main', 'auth-acciones') as any;
    }

    private get Recursos() {
        return Database.repository('main', 'auth-recursos') as any;
    }

    private get Permisos() {
        return Database.repository('main', 'auth-permisos') as any;
    }

    private get Roles() {
        return Database.repository('main', 'auth-roles') as any;
    }

    private get RolesPermisos() {
        return Database.repository('main', 'auth-roles-permisos') as any;
    }
}

export default new PermissionsService();
