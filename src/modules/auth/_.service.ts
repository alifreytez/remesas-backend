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
import { AT_ALPHANUMERIC, AT_NUMERIC } from '@constants/auth.constants.js';

const generateRobustJti = customAlphabet(AT_ALPHANUMERIC, 64);
const generateResetToken = customAlphabet(AT_ALPHANUMERIC, 48);
const generateResetCode = customAlphabet(AT_NUMERIC, 8);

class AuthService extends BaseService {
    constructor() {
        super();
    }

    async login({ email, password, device, deviceId }: { email?: string; password?: string; device?: string; deviceId?: string }) {
        if (!email || !password) {
            if (!email && !password) throw new BadRequestError('Email and password must be provided.');
            if (!email) throw new BadRequestError('Email was not provided.');
            throw new BadRequestError('Password was not provided.');
        }

        const foundUser = (await this.Users.getOne({ email })) as Record<string, any>;
        if (foundUser == null || !(await BcryptUtil.compare(password, foundUser.passwordHash))) {
            throw new AuthError('Invalid credentials', {
                code: 'INVALID_LOGIN',
            });
        }

        const payload = {
            id: foundUser.id,
            deviceId: deviceId || null,
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
            throw new AuthError('Cannot refresh session, refresh token missing.', { code: 'REFRESH_TOKEN_MISSING' });
        }
        if (await tokenBlacklistService.isBlacklisted(oldJti)) {
            throw new AuthError('Session revoked.', {
                code: 'SESSION_REVOKED',
            });
        }

        const savedSession = (await this.UserSessions.getOne({
            jti: oldJti,
        })) as Record<string, any>;
        if (!savedSession) {
            throw new AuthError('Invalid or missing session.', {
                code: 'INVALID_SESSION',
            });
        }

        if (new Date(savedSession.expiresAt) < new Date()) {
            await this.UserSessions.delete({ id: savedSession.id });
            throw new AuthError('Session expired. Please log in again.', { code: 'EXPIRED_SESSION' });
        }

        const userId = savedSession.userId;
        const foundUser = (await this.Users.getOne({
            id: userId,
        })) as Record<string, any>;
        if (!foundUser) {
            await this.UserSessions.delete({ id: savedSession.id });
            throw new AuthError('The user associated with this session no longer exists.', { code: 'USER_NOT_FOUND' });
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

    async forgotPassword({ email }: { email: string }) {
        if (!email) throw new BadRequestError('Email is required');

        const user = (await this.Users.getOne({ email })) as Record<string, any>;
        if (!user) return true;

        const { security } = AppConfig.load();
        const ttlSeconds = Math.round(
            Number(
                getTimeIn(security.resetCodeExpiresIn, 's', {
                    onlyNumberOutput: true,
                })
            )
        );
        const resetCode = generateResetCode();
        const hashedCode = await BcryptUtil.hash(resetCode);

        const redisClient = CacheDatabaseProvider.getInstance().client;
        await redisClient.set(`auth:reset:code:${email}`, hashedCode, 'EX', ttlSeconds);

        const recipientName = undefined;
        await authEmailService.sendPasswordResetEmail(email, resetCode, recipientName).catch(() => {});
        return true;
    }

    async verifyResetCode({ email, code }: { email: string; code: string }): Promise<{ resetToken: string }> {
        if (!email || !code) throw new BadRequestError('Email and code are required');

        const user = await this.Users.getOne({ email });
        if (!user)
            throw new AuthError('Invalid code or email', {
                code: 'INVALID_RESET_CODE',
            });

        const redisClient = CacheDatabaseProvider.getInstance().client;
        const keyCode = `auth:reset:code:${email}`;
        const savedHashedCode = await redisClient.get(keyCode);

        if (!savedHashedCode || !(await BcryptUtil.compare(code, savedHashedCode))) {
            throw new AuthError('Invalid or expired verification code', { code: 'INVALID_RESET_CODE' });
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

        const keyToken = `auth:reset:token:${email}`;
        await redisClient.set(keyToken, hashedToken, 'EX', ttlSeconds);

        return { resetToken };
    }

    async resetPassword({ email, token, password }: { email: string; token: string; password: string }) {
        if (!email || !token || !password) throw new BadRequestError('Missing required fields: email, token, password');

        if (!REGEX.PASSWORD.test(String(password))) {
            throw new BadRequestError(
                'Password does not meet minimum security requirements.'
            );
        }

        const redisClient = CacheDatabaseProvider.getInstance().client;
        const keyToken = `auth:reset:token:${email}`;
        const savedHashedToken = await redisClient.get(keyToken);

        if (!savedHashedToken || !(await BcryptUtil.compare(token, savedHashedToken))) {
            throw new AuthError('Invalid or expired reset token', { code: 'INVALID_RESET_TOKEN' });
        }

        const user = (await this.Users.getOne({ email })) as Record<string, any>;
        if (!user) throw new AuthError('User not found for this email');

        const hashed = await BcryptUtil.hash(password);
        await this.Users.update({ id: user.id }, { passwordHash: hashed });

        await this.UserSessions.delete({ userId: user.id });
        await redisClient.del(keyToken);

        const recipientName = undefined;
        await authEmailService.sendPasswordResetSuccessEmail(email, recipientName).catch(() => {});

        return true;
    }

    private get Users() {
        return Database.repository('main', 'users') as SequelizeRepositoryBase;
    }

    private get UserSessions() {
        return Database.repository('main', 'user-sessions') as SequelizeRepositoryBase;
    }
}

export default new AuthService();
