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
import { WhereOperators } from '@bases/repository.base.js';

class UsersService extends BaseService {
    constructor() {
        super();
    }

    async getAllFullUsers(filters: ProcessedQueryFilters) {
        const userTypesRepo = Database.repository('main', 'user-types');
        const clientType = (await userTypesRepo.getOne({ code: 'CLIENT' })) as any;

        const options: any = {
            ...filters,
            relations: [
                { association: '_UserType' },
                { association: '_Person' }
            ]
        };

        if (clientType) {
            options.qc = {
                ...(options.qc || {}),
                userType: { [WhereOperators.ne]: clientType.id }
            };
        }

        // Pasamos options.qc como filtro explícito en el segundo argumento si es necesario,
        // pero la base ya debería extraer qc si lo enviamos así. Para mayor seguridad:
        return await this.AccesosSistema.getAll(options, options.qc);
    }

    async getFullUser({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        return await this.AccesosSistema.getById(id as string | number, {
            relations: [
                { association: '_UserType' },
                { association: '_Person' }
            ]
        });
    }

    private async validateUniqueUserFields({ id, username, email }: { id?: string | number; username?: string; email?: string }) {
        if (username !== undefined && username !== '') {
            const existingUsuario = (await this.AccesosSistema.getOne({ username })) as any;
            if (existingUsuario && String(existingUsuario.id) !== String(id || '')) {
                throw new BadRequestError('Ya existe un usuario activo registrado con ese nombre de usuario');
            }
        }
        if (email !== undefined && email !== '') {
            const existingEmail = (await this.AccesosSistema.getOne({ email })) as any;
            if (existingEmail && String(existingEmail.id) !== String(id || '')) {
                throw new BadRequestError('Ya existe un usuario activo registrado con ese correo');
            }
        }
    }

    async updateUser(
        { id }: { id?: string | number },
        {
            body,
            roles,
            permissions,
        }: {
            body: Record<string, any>;
            roles?: Array<string | number>;
            permissions?: Array<string | number>;
        }
    ) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const { firstName, lastName, documentNumber, phone, username, email, password, userType } = body || {};

        if (password) {
            if (!REGEX.PASSWORD.test(String(password))) {
                throw new BadRequestError(AT_PASSWORD_CRITERIA_MSG);
            }
        }

        await this.validateUniqueUserFields({ id: id as string | number, username, email });

        return await this.AccesosSistema.transaction(async (transaction: Transaction) => {
            const currentUser = await this.AccesosSistema.getById(id as string | number);
            if (!currentUser) throw new BadRequestError('Usuario no encontrado');

            // 1. Actualizar o crear persona
            let personId = currentUser.person;
            if (firstName || lastName || documentNumber || phone) {
                if (personId) {
                    await this.People.update({ id: personId }, { firstName, lastName, documentNumber, phone }, { transaction });
                } else if (documentNumber) {
                    const person = await this.People.create({ firstName, lastName, documentNumber, phone }, { transaction });
                    personId = person.id;
                }
            }

            // 2. Actualizar Usuario
            let userData: any = {};
            if (username) userData.username = username;
            if (email) userData.email = email;
            if (userType) userData.userType = userType;
            if (personId) userData.person = personId;
            if (password) userData.passwordHash = await BcryptUtil.hash(String(password));

            let updated = null;
            if (Object.keys(userData).length > 0) {
                if (password) {
                    await this.SesionesUsuario.delete({ userId: id as string | number }, { transaction });
                }
                updated = await this.AccesosSistema.update({ id }, userData, { transaction });
            }

            // 3. Manejo de Roles
            if (roles !== undefined) {
                const existingRolesRaw = await this.RolesUsuarios.getAll({ pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { userId: id });
                const existingRoles = Array.isArray(existingRolesRaw) ? existingRolesRaw : existingRolesRaw.rows;
                
                const existingRoleIds = existingRoles.map((er: any) => String(er.role));
                const newRoleIds = roles.map(r => String(r));

                const rolesToDelete = existingRoles.filter((er: any) => !newRoleIds.includes(String(er.role))).map((er: any) => er.id);
                const rolesToAdd = roles.filter(r => !existingRoleIds.includes(String(r)));

                if (rolesToDelete.length > 0) {
                    await this.RolesUsuarios.delete(rolesToDelete, { transaction });
                }
                if (rolesToAdd.length > 0) {
                    const _roles = rolesToAdd.map(rol => ({ userId: id as string | number, role: rol }));
                    await this.RolesUsuarios.bulkCreate(_roles, { transaction });
                }
            }

            // 4. Manejo de Permisos
            if (permissions !== undefined) {
                const existingPermsRaw = await this.UserPermissions.getAll({ pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { userId: id });
                const existingPerms = Array.isArray(existingPermsRaw) ? existingPermsRaw : existingPermsRaw.rows;

                const existingPermIds = existingPerms.map((ep: any) => String(ep.permission));
                const newPermIds = permissions.map(p => String(p));

                const permsToDelete = existingPerms.filter((ep: any) => !newPermIds.includes(String(ep.permission))).map((ep: any) => ep.id);
                const permsToAdd = permissions.filter(p => !existingPermIds.includes(String(p)));

                if (permsToDelete.length > 0) {
                    await this.UserPermissions.delete(permsToDelete, { transaction });
                }
                if (permsToAdd.length > 0) {
                    const _perms = permsToAdd.map(perm => ({ userId: id as string | number, permission: perm, isGranted: true }));
                    await this.UserPermissions.bulkCreate(_perms, { transaction });
                }
            }

            return updated;
        });
    }

    async createUser({ body, roles, permissions }: { body: Record<string, any>; roles?: Array<string | number>; permissions?: Array<string | number> }) {
        let { firstName, lastName, documentNumber, phone, username, email, password, userType } = body || {};

        if (!userType) {
            const userTypesRepo = Database.repository('main', 'user-types');
            const adminType = (await userTypesRepo.getOne({ code: 'ADMIN' })) as any;
            if (adminType) userType = adminType.id;
        }

        if (password) {
            if (!REGEX.PASSWORD.test(String(password))) {
                throw new BadRequestError(AT_PASSWORD_CRITERIA_MSG);
            }
        }

        await this.validateUniqueUserFields({ username, email });

        return await this.AccesosSistema.transaction(async (transaction: Transaction) => {
            // 1. Crear Persona
            let personId = null;
            if (firstName || lastName || documentNumber) {
                let person = null;
                if (documentNumber) {
                    person = await this.People.getOne({ documentNumber }, { transaction });
                }
                if (!person) {
                    person = await this.People.create({ firstName, lastName, documentNumber, phone }, { transaction });
                } else {
                    await this.People.update({ id: person.id }, { firstName, lastName, phone }, { transaction });
                }
                personId = person.id;
            }

            // 2. Crear Usuario
            const userData = {
                username,
                email,
                userType,
                person: personId,
                passwordHash: password ? await BcryptUtil.hash(String(password)) : undefined
            };

            const created = await this.AccesosSistema.create(userData, { transaction });

            // 3. Asignar Roles
            if (roles && roles.length > 0) {
                const _roles = roles.map((rol) => ({ userId: created.id, role: rol }));
                await this.RolesUsuarios.bulkCreate(_roles, { transaction });
            }

            // 4. Asignar Permisos Granulares
            if (permissions && permissions.length > 0) {
                const _perms = permissions.map((perm) => ({ userId: created.id, permission: perm, isGranted: true }));
                await this.UserPermissions.bulkCreate(_perms, { transaction });
            }

            const result = created && typeof created.toJSON === 'function' ? created.toJSON() : { ...created };
            if ('passwordHash' in result) {
                delete result.passwordHash;
            }
            return result;
        });
    }

    async deleteUser({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        return await this.AccesosSistema.transaction(async (transaction: Transaction) => {
            const roles = (await this.RolesUsuarios.getAll({ attributes: ['id'], pagination: { offset: 0 }, order: [['id', 'asc']], qc: {} } as any, { userId: id })) as {
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





    private get AccesosSistema() {
        return Database.repository('main', 'users') as any;
    }

    private get RolesUsuarios() {
        return Database.repository('main', 'user-roles') as any;
    }

    private get SesionesUsuario() {
        return Database.repository('main', 'user-sessions') as any;
    }

    private get People() {
        return Database.repository('main', 'people') as any;
    }

    private get UserPermissions() {
        return Database.repository('main', 'user-permissions') as any;
    }
}

export default new UsersService();
