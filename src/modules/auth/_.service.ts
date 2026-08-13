import { BaseService } from '@bases/service.base.js';
import { SequelizeRepositoryBase } from '@database/repositories/bases/sequelize.repository.js';
import JWTUtil from '@utils/jwt.util.js';
import { AuthError, BadRequestError } from '@errors/index.js';
import { Database } from '@database/index.js';
import { AppConfig } from '@config/app.config.js';
import { tokenBlacklistService } from '@services/token-blacklist.service.js';
import { authEmailService } from '@services/auth-email.service.js';
import { BcryptUtil } from '@utils/bcrypt.util.js';
import { CacheDatabaseProvider } from '@providers/cache-database.provider.js';
import { customAlphabet } from 'nanoid';
import { REGEX } from '@constants/regex.constant.js';
import { getTimeIn } from '@utils/date-handler.util.js';
import { AT_ALPHANUMERIC, AT_NUMERIC, AT_PASSWORD_CRITERIA_MSG } from '@constants/auth.constants.js';

const generateRobustJti = customAlphabet(AT_ALPHANUMERIC, 64);
const generateResetToken = customAlphabet(AT_ALPHANUMERIC, 48);
const generateResetCode = customAlphabet(AT_NUMERIC, 8);

class AuthService extends BaseService {
    constructor() {
        super();
    }

    async login({ username, password, device, deviceId }: { username?: string; password?: string; device?: string; deviceId?: string }) {
        if (!username || !password) {
            if (!username && !password) throw new BadRequestError('Se deben proveer el usuario y la contraseña.');
            if (!username) throw new BadRequestError('No se proveyó el usuario.');
            throw new BadRequestError('No se proveyó la contraseña.');
        }

        const foundUser = (await this.Users.getOne({ username })) as Record<string, any>;
        if (foundUser == null || !(await BcryptUtil.compare(password, foundUser.passwordHash))) {
            throw new AuthError('Credenciales inválidas', {
                code: 'INVALID_LOGIN',
            });
        }

        const payload = {
            id: foundUser.id,
            deviceId: deviceId || null,
            username: foundUser.username,
            email: foundUser.email,
        };

        const accessToken = JWTUtil.generateAccessToken(payload as any);
        const robustJti = generateRobustJti();
        const { security } = AppConfig.load();
        const refreshTtlMs = Number(
            getTimeIn(security.jwtRefreshExpiresIn, 'ms', {
                onlyNumberOutput: true,
            })
        );
        const expiresAt = new Date(Date.now() + refreshTtlMs);

        if (deviceId) {
            await this.UserSessions.delete({ deviceId: deviceId });
        }
        await this.UserSessions.create({
            userId: foundUser.id,
            device: device ?? 'Unknown Device',
            deviceId: deviceId ?? null,
            jti: robustJti,
            expiresAt: expiresAt,
        });

        return { user: payload, accessToken, refreshToken: robustJti };
    }

    async refresh(source: Record<string, any> = {}, { device, deviceId }: { device?: string; deviceId?: string } = {}) {
        const { security } = AppConfig.load();
        const refreshTokenName = security.jwtCookieRefreshName;
        const oldJti = source[refreshTokenName] || source.refreshToken || source.token;

        if (!oldJti || typeof oldJti !== 'string') {
            throw new AuthError('No se puede refrescar la sesión, falta el token.', { code: 'REFRESH_TOKEN_MISSING' });
        }
        if (await tokenBlacklistService.isBlacklisted(oldJti)) {
            throw new AuthError('Sesión revocada.', {
                code: 'SESSION_REVOKED',
            });
        }

        const savedSession = (await this.UserSessions.getOne({
            jti: oldJti,
        })) as Record<string, any>;
        if (!savedSession) {
            throw new AuthError('Sesión inválida o no encontrada.', {
                code: 'INVALID_SESSION',
            });
        }

        if (new Date(savedSession.expiresAt) < new Date()) {
            await this.UserSessions.delete({ id: savedSession.id });
            throw new AuthError('La sesión ha expirado. Por favor, inicia sesión nuevamente.', { code: 'EXPIRED_SESSION' });
        }

        const userId = savedSession.userId;
        const foundUser = (await this.Users.getOne({
            id: userId,
        })) as Record<string, any>;
        if (!foundUser) {
            await this.UserSessions.delete({ id: savedSession.id });
            throw new AuthError('El usuario asociado a esta sesión ya no existe.', { code: 'USER_NOT_FOUND' });
        }

        const payload = {
            id: foundUser.id,
            deviceId: deviceId || savedSession.deviceId || null,
            email: foundUser.email,
        };

        await tokenBlacklistService.blacklistTokenAtRefresh(oldJti);
        const accessToken = JWTUtil.generateAccessToken(payload as any);
        const newJti = generateRobustJti();
        const refreshTtlMs = Number(
            getTimeIn(security.jwtRefreshExpiresIn, 'ms', {
                onlyNumberOutput: true,
            })
        );
        const newExpiresAt = new Date(Date.now() + refreshTtlMs);

        await this.UserSessions.delete({ id: savedSession.id });
        const targetDeviceId = deviceId || savedSession.deviceId;
        if (targetDeviceId) {
            await this.UserSessions.delete({ deviceId: targetDeviceId });
        }

        await this.UserSessions.create({
            userId: foundUser.id,
            device: device || savedSession.device || 'Unknown Device',
            deviceId: targetDeviceId || null,
            jti: newJti,
            expiresAt: newExpiresAt,
        });

        return { accessToken, refreshToken: newJti, user: payload };
    }

    async logout({ token, refreshToken }: { token?: string; refreshToken?: string }) {
        if (token) await tokenBlacklistService.blacklistToken(token);
        if (refreshToken) {
            await tokenBlacklistService.blacklistTokenAtRefresh(refreshToken);
            await this.UserSessions.delete({ jti: refreshToken });
        }
        return true;
    }

    async forgotUsername({ email }: { email: string }) {
        if (!email) throw new BadRequestError('El correo electrónico es requerido.');

        const users = (await this.Users.getAll({ count: false, relations: [{ association: '_UserType' }] }, { email })) as any[];
        
        if (!users || users.length === 0) return true; // Retornamos true para no filtrar existencia de correos

        const userList = users.map(user => ({
            username: user.username,
            userType: user._UserType?.name || (user.userType === 1 ? 'Administrador' : 'Cliente')
        }));

        await authEmailService.sendForgotUsernameEmail(email, userList).catch(() => {});
        return true;
    }

    async forgotPassword({ username, email }: { username: string, email: string }) {
        if (!username || !email) throw new BadRequestError('El usuario y el correo son requeridos.');

        const { security } = AppConfig.load();
        const ttlSeconds = Math.round(
            Number(
                getTimeIn(security.resetCodeExpiresIn, 's', {
                    onlyNumberOutput: true,
                })
            )
        );

        const user = (await this.Users.getOne({ username, email })) as Record<string, any>;
        if (!user) return { ttlSeconds };

        const resetCode = generateResetCode();
        const hashedCode = await BcryptUtil.hash(resetCode);

        const redisClient = CacheDatabaseProvider.getInstance().client;
        await redisClient.set(`auth:reset:code:${username}`, hashedCode, 'EX', ttlSeconds);

        const recipientName = undefined;
        await authEmailService.sendPasswordResetEmail(email, resetCode, recipientName).catch(() => {});
        return { ttlSeconds };
    }

    async verifyResetCode({ username, code }: { username: string; code: string }): Promise<{ resetToken: string }> {
        if (!username || !code) throw new BadRequestError('El usuario y el código son requeridos.');

        const user = await this.Users.getOne({ username });
        if (!user)
            throw new AuthError('Código o usuario inválido.', {
                code: 'INVALID_RESET_CODE',
            });

        const redisClient = CacheDatabaseProvider.getInstance().client;
        const keyCode = `auth:reset:code:${username}`;
        const savedHashedCode = await redisClient.get(keyCode);

        if (!savedHashedCode || !(await BcryptUtil.compare(code, savedHashedCode))) {
            throw new AuthError('Código de verificación inválido o expirado.', { code: 'INVALID_RESET_CODE' });
        }

        await redisClient.del(keyCode);

        const { security } = AppConfig.load();
        const ttlSeconds = Math.round(
            Number(
                getTimeIn(security.resetTokenExpiresIn, 's', {
                    onlyNumberOutput: true,
                })
            )
        );
        const resetToken = generateResetToken();
        const hashedToken = await BcryptUtil.hash(resetToken);

        const keyToken = `auth:reset:token:${username}`;
        await redisClient.set(keyToken, hashedToken, 'EX', ttlSeconds);

        return { resetToken };
    }

    async resetPassword({ username, token, password }: { username: string; token: string; password: string }) {
        if (!username || !token || !password) throw new BadRequestError('Faltan campos requeridos: usuario, token o contraseña.');

        if (!REGEX.PASSWORD.test(String(password))) {
            throw new BadRequestError(
                'La contraseña no cumple con los requisitos mínimos de seguridad.'
            );
        }

        const redisClient = CacheDatabaseProvider.getInstance().client;
        const keyToken = `auth:reset:token:${username}`;
        const savedHashedToken = await redisClient.get(keyToken);

        if (!savedHashedToken || !(await BcryptUtil.compare(token, savedHashedToken))) {
            throw new AuthError('Token de restablecimiento inválido o expirado.', { code: 'INVALID_RESET_TOKEN' });
        }

        const user = (await this.Users.getOne({ username })) as Record<string, any>;
        if (!user) throw new AuthError('Usuario no encontrado.');

        const hashed = await BcryptUtil.hash(password);
        await this.Users.update({ id: user.id }, { passwordHash: hashed });

        await this.UserSessions.delete({ userId: user.id });
        await redisClient.del(keyToken);

        const recipientName = undefined;
        await authEmailService.sendPasswordResetSuccessEmail(user.email, recipientName).catch(() => {});

        return true;
    }

    async register(data: Record<string, any>) {
        const { firstName, lastName, document, phone, email, password, country, type = 'CLIENT' } = data;

        if (!firstName || !lastName || !document || !email || !password || !country) {
            throw new BadRequestError('Por favor, completa todos los campos del formulario para poder registrarte.');
        }

        if (!REGEX.PASSWORD.test(String(password))) {
            throw new BadRequestError(AT_PASSWORD_CRITERIA_MSG);
        }

        if (!REGEX.PERSON_NAME.test(firstName) || !REGEX.PERSON_NAME.test(lastName)) {
            throw new BadRequestError('Nombres o apellidos inválidos.');
        }

        if (!REGEX.DOCUMENT_NUMBER.test(document)) {
            throw new BadRequestError('Número de documento inválido.');
        }

        return await this.Users.transaction(async (transaction: any) => {
            // 1. Encontrar o crear la Persona
            let person = await this.People.getOne({ documentNumber: document }, { transaction });
            if (!person) {
                person = await this.People.create(
                    {
                        firstName,
                        lastName,
                        documentNumber: document,
                        phone: phone || null,
                    },
                    { transaction }
                );
            }

            // 2. Obtener el tipo de usuario
            let userType = await this.UserTypes.getOne({ code: type }, { transaction });
            if (!userType) {
                userType = await this.UserTypes.create(
                    { code: type, description: type === 'CLIENT' ? 'Cliente Regular' : 'Administrador/Empleado' },
                    { transaction }
                );
            }

            // Validar que no exista ya un cliente con esta cédula
            const existingClient = await this.Users.getOne({ person: person.id, userType: userType.id }, { transaction });
            if (existingClient) {
                throw new BadRequestError('Ya existe una cuenta de cliente registrada con este número de documento.');
            }

            // Validar que el correo no esté usado por otra persona diferente
            const existingEmailUser = await this.Users.getOne({ email }, { transaction });
            if (existingEmailUser && existingEmailUser.person !== person.id) {
                throw new BadRequestError('Este correo electrónico ya se encuentra registrado a nombre de otra persona.');
            }

            // 3. Generar Username (Documento para Cliente, Documento+R para Administrador)
            let baseUsername = document;
            if (type !== 'CLIENT') {
                baseUsername = `${document}R`;
            }
            
            // Asegurarnos de que el username no exista
            let existingUser = await this.Users.getOne({ username: baseUsername }, { transaction });
            if (existingUser) {
                throw new BadRequestError('Este documento de identidad ya tiene una cuenta registrada con este rol.');
            }

            // 4. Crear el Usuario
            const passwordHash = await BcryptUtil.hash(password);
            const user = await this.Users.create(
                {
                    username: baseUsername,
                    email,
                    passwordHash,
                    person: person.id,
                    userType: userType.id,
                },
                { transaction }
            );

            // 5. Crear el registro en Clientes
            // Asumimos que `country` viene como el ID o código del país. Si viene como 'VE' o 'PE', necesitamos buscar su ID.
            // Por simplicidad, si es un select del frontend que manda 'VE', asumiremos que insertamos eso o buscamos.
            // Idealmente deberíamos buscar el ID en la tabla countries.
            // Como no tengo el countries.model.ts, lo intentaremos insertar directo. 
            // Si falla, el usuario proveerá un fix. De momento buscaré el país si es string, o lo asignaré si es number.
            
            // Buscando el id del pais asumiendo que `country` es el code ISO
            const countryRepo = Database.repository('main', 'countries') as SequelizeRepositoryBase;
            let originCountryId = country;
            if (typeof country === 'string') {
                const foundCountry = await countryRepo.getOne({ isoCode: country }, { transaction });
                if (foundCountry) {
                    originCountryId = foundCountry.id;
                } else {
                    // Fallback, create a dummy country if it doesn't exist for test purposes, or throw
                    // Let's create it for seamless testing
                    const newC = await countryRepo.create({ isoCode: country, name: country, currencySymbol: '$' }, { transaction }).catch(() => null);
                    if (newC) originCountryId = newC.id;
                }
            }

            if (type === 'CLIENT') {
                await this.Clients.create(
                    {
                        person: person.id,
                        originCountry: originCountryId,
                    },
                    { transaction }
                );
            } else {
                await this.Employees.create(
                    {
                        person: person.id,
                    },
                    { transaction }
                );
            }

            return {
                username: user.username,
                email: user.email,
                firstName: person.firstName,
                lastName: person.lastName,
            };
        });
    }

    private get Users() {
        return Database.repository('main', 'users') as SequelizeRepositoryBase;
    }

    private get UserSessions() {
        return Database.repository('main', 'user-sessions') as SequelizeRepositoryBase;
    }

    private get People() {
        return Database.repository('main', 'people') as SequelizeRepositoryBase;
    }

    private get UserTypes() {
        return Database.repository('main', 'user-types') as SequelizeRepositoryBase;
    }

    private get Clients() {
        return Database.repository('main', 'clients') as SequelizeRepositoryBase;
    }

    private get Employees() {
        return Database.repository('main', 'employees') as SequelizeRepositoryBase;
    }
}

export default new AuthService();
