import { BaseService } from '@bases/service.base.js';
import { BadRequestError } from '@errors/index.js';
import { NotFoundError } from '@errors/not-found.error.js';
import { Validator } from '@utils/validator.util.js';
import { BcryptUtil } from '@utils/bcrypt.util.js';
import { Database } from '@database/index.js';
import { Transaction } from 'sequelize';
import { ProcessedQueryFilters } from '@rules/api-query.type.js';
import { REGEX } from '@constants/regex.constant.js';
import { AT_PASSWORD_CRITERIA_MSG } from '@constants/auth.constants.js';

class UsersService extends BaseService {
    constructor() {
        super();
    }

    async getAllFullUsers(filters: ProcessedQueryFilters) {
        return await this.AccesosSistema.getAllFull(filters);
    }

    async getFullUser({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        return await this.AccesosSistema.getFull(id as string | number);
    }

    async updateUser(
        { id }: { id?: string | number },
        {
            body,
            roles,
            rolesEliminar,
        }: {
            body: Record<string, any>;
            roles?: Array<string | number>;
            rolesEliminar?: Array<string | number>;
        }
    ) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        if (body) {
            if (body.clave) {
                if (!REGEX.PASSWORD.test(String(body.clave))) {
                    throw new BadRequestError(AT_PASSWORD_CRITERIA_MSG);
                }
                body.clave = await BcryptUtil.hash(String(body.clave));
            }
            await this.validateUniqueUserFields({
                id: id as string | number,
                usuario: body.usuario,
                emailGestion: body.emailGestion,
            });

        }

        return await this.AccesosSistema.transaction(async (transaction: Transaction) => {
            let updated = null;
            if (body && Object.keys(body).length > 0) {
                if (body.clave) {
                    await this.SesionesUsuario.delete({ usuario: id as string | number }, { transaction });
                }
                updated = await this.AccesosSistema.update({ id }, body, { transaction });
            }

            if (rolesEliminar && rolesEliminar.length > 0) {
                await this.RolesUsuarios.delete(rolesEliminar, { transaction });
            }

            if (roles && roles.length > 0) {
                const _roles = roles.map((rol) => ({ usuario: id as string | number, rol }));
                await this.RolesUsuarios.bulkCreate(_roles, { transaction });
            }

            return updated;
        });
    }

    async createUser({ body, roles }: { body: Record<string, any>; roles?: Array<string | number> }) {
        if (body) {
            if (body.clave) {
                if (!REGEX.PASSWORD.test(String(body.clave))) {
                    throw new BadRequestError(AT_PASSWORD_CRITERIA_MSG);
                }
                body.clave = await BcryptUtil.hash(String(body.clave));
            }
            await this.validateUniqueUserFields({
                usuario: body.usuario,
                emailGestion: body.emailGestion,
            });

        }

        return await this.AccesosSistema.transaction(async (transaction: Transaction) => {
            const created = await this.AccesosSistema.create(body, { transaction });

            if (roles && roles.length > 0) {
                const _roles = roles.map((rol) => ({ usuario: created.id as string | number, rol }));
                await this.RolesUsuarios.bulkCreate(_roles, { transaction });
            }

            const result = created && typeof created.toJSON === 'function' ? created.toJSON() : { ...created };
            if ('clave' in result) {
                delete result.clave;
            }
            return result;
        });
    }

    async deleteUser({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        return await this.AccesosSistema.transaction(async (transaction: Transaction) => {
            const roles = (await this.RolesUsuarios.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { usuario: id })) as {
                rows: Array<Record<string, any>>;
                count: number;
            };
            const relRolesId = roles.rows.map((r) => r.id);

            if (relRolesId.length > 0) {
                await this.RolesUsuarios.delete(relRolesId, { transaction });
            }

            const affectedRows = await this.AccesosSistema.delete({ id }, { transaction });
            if (!affectedRows) {
                throw new NotFoundError('El recurso no existe');
            }
            return affectedRows;
        });
    }

    async restoreUser({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const affectedRows = await this.AccesosSistema.restore({ id });
        if (!affectedRows) {
            throw new NotFoundError('El recurso no existe o no estaba eliminado');
        }
        return await this.getFullUser({ id });
    }

    private async validateUniqueUserFields({ id, usuario, emailGestion }: { id?: string | number; usuario?: string; emailGestion?: string }) {
        if (usuario !== undefined && usuario !== '') {
            const existingUsuario = (await this.AccesosSistema.getOne({ usuario })) as any;
            if (existingUsuario && String(existingUsuario.id) !== String(id || '')) {
                throw new BadRequestError('Ya existe un usuario activo registrado con ese nombre de usuario');
            }
        }
        if (emailGestion !== undefined && emailGestion !== '') {
            const existingEmail = (await this.AccesosSistema.getOne({ emailGestion })) as any;
            if (existingEmail && String(existingEmail.id) !== String(id || '')) {
                throw new BadRequestError('Ya existe un usuario activo registrado con ese correo de gestión');
            }
        }
    }



    private get AccesosSistema() {
        return Database.repository('main', 'auth-accesos-sistema') as any;
    }

    private get RolesUsuarios() {
        return Database.repository('main', 'auth-roles-usuarios') as any;
    }

    private get SesionesUsuario() {
        return Database.repository('main', 'auth-sesiones-usuario') as any;
    }
}

export default new UsersService();
