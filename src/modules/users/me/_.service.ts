import { BaseService } from '@bases/service.base.js';
import { BadRequestError, AuthError } from '@errors/index.js';
import { Validator } from '@utils/validator.util.js';
import { BcryptUtil } from '@utils/bcrypt.util.js';
import { Database } from '@database/index.js';
import { authEmailService } from '@services/auth-email.service.js';
import { REGEX } from '@constants/regex.constant.js';
import { AT_PASSWORD_CRITERIA_MSG } from '@constants/auth.constants.js';

class UsersMeService extends BaseService {
    constructor() {
        super();
    }

    async getMyProfile({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        const user = (await this.Users.getById(id as string | number, { relations: ['_Person', '_UserType'] })) as any;
        if (!user) throw new BadRequestError(`User with id ${id} not found`);

        return {
            userId: user.id,
            email: user.email,
            person: user._Person,
            userType: user._UserType
        };
    }

    async updateMyProfile({ id }: { id?: string | number }, body: Record<string, any>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) throw new BadRequestError(`Invalid id: ${id}`);
        const user = (await this.Users.getById(id as string | number, { relations: ['_Person'] })) as any;
        if (!user) throw new BadRequestError(`User with id ${id} not found`);

        const allowedFields = [
            'firstName',
            'lastName',
            'middleName',
            'secondLastName',
            'documentNumber',
            'phone'
        ];

        const updateData: Record<string, any> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updateData[field] = body[field];
        }

        if (Object.keys(updateData).length > 0 && user.person) {
            await this.People.update({ id: user.person }, updateData);
        }

        return await this.getMyProfile({ id });
    }

    async getMySecurity({ id }: { id?: string | number }) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }
        const user = (await this.Users.getOne(
            { id: id as string | number },
            {
                attributes: ['id', 'email', 'createdAt'],
            }
        )) as any;
        if (!user) throw new BadRequestError(`User not found`);
        return user;
    }

    async updateMySecurity({ id, deviceId }: { id?: string | number; deviceId?: string }, body: Record<string, any>) {
        if (!(Validator.isNotEmpty(id) && Validator.isObjectId(String(id)))) {
            throw new BadRequestError(`Invalid id: ${id}`);
        }

        const user = (await this.Users.getOne({
            id: id as string | number,
        })) as any;
        
        if (!user) {
            throw new BadRequestError(`User not found with id ${id}`);
        }

        const claveActual = body.currentPassword;
        if (!claveActual) {
            throw new BadRequestError('Current password (currentPassword) is required to modify security settings');
        }

        const isMatch = await BcryptUtil.compare(String(claveActual), String(user.passwordHash));
        if (!isMatch) {
            throw new AuthError('The provided current password is incorrect', {
                code: 'INVALID_CURRENT_PASSWORD',
            });
        }

        const updateData: Record<string, any> = {};
        if (body.email !== undefined && body.email !== '') updateData.email = body.email;

        const rawPassword = body.password;
        if (rawPassword !== undefined && rawPassword !== '') {
            if (!REGEX.PASSWORD.test(String(rawPassword))) {
                throw new BadRequestError(AT_PASSWORD_CRITERIA_MSG);
            }
            updateData.passwordHash = await BcryptUtil.hash(String(rawPassword));
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestError('You must provide at least one field to update: email or password');
        }

        await this.validateUniqueUserFields({
            id: id as string | number,
            email: updateData.email,
        });

        await this.Users.update({ id: id as string | number }, updateData);

        if (rawPassword) {
            // Eliminar otras sesiones si la contraseña fue cambiada (opcional en tu logica)
            // await this.UserSessions.deleteOtherSessions(id as string | number, deviceId);

            const recipientEmail = updateData.email || user.email;
            const recipientName = undefined;
            if (recipientEmail) {
                await authEmailService.sendPasswordResetSuccessEmail(recipientEmail, recipientName).catch(() => {});
            }
        }

        return await this.getMySecurity({ id });
    }

    private async validateUniqueUserFields({ id, email }: { id?: string | number; email?: string }) {
        if (email !== undefined && email !== '') {
            const existingEmail = (await this.Users.getOne({
                email,
            })) as any;
            if (existingEmail && String(existingEmail.id) !== String(id || '')) {
                throw new BadRequestError('A user with that email already exists');
            }
        }
    }

    private get Users() {
        return Database.repository('main', 'users') as any;
    }

    private get People() {
        return Database.repository('main', 'people') as any;
    }

    private get UserSessions() {
        return Database.repository('main', 'user-sessions') as any;
    }
}

export default new UsersMeService();
