import { ControllerBase } from '@bases/controller.base.js';
import service from './_.service.js';
import JWTUtil from '@utils/jwt.util.js';
import { AppConfig } from '@config/app.config.js';
import { nanoid } from 'nanoid';

class AuthController extends ControllerBase {
    private _getDeviceData(): { deviceId: string; deviceInfo: string } {
        const headers = this.getHeaders();
        let deviceId = headers['x-device-id'];
        if (!deviceId || typeof deviceId !== 'string') deviceId = nanoid();

        const userAgent = headers['user-agent'] || 'Unknown-Agent';
        const ip = this.getRequest().ip || 'Unknown-IP';
        const deviceInfo = `${userAgent}-${ip}`;

        return { deviceId, deviceInfo };
    }

    private _getRefreshSource(): Record<string, any> {
        const { security } = AppConfig.load();
        const headers = this.getHeaders();
        const clientChannel = (headers['x-client-channel'] || '').toString().trim().toLowerCase();
        const cookies = this.getRequest().cookies || {};
        const body = this.getRequest().body && typeof this.getRequest().body === 'object' ? this.getRequest().body : {};
        const bodyRefresh = {
            [security.jwtCookieRefreshName]: body[security.jwtCookieRefreshName] || body.refreshToken || body.token,
        };

        if (clientChannel === 'web') return cookies;
        if (clientChannel && clientChannel !== 'web') return bodyRefresh;
        return { ...bodyRefresh, ...cookies };
    }

    async login() {
        const body = this.getBody();
        const { deviceId, deviceInfo } = this._getDeviceData();
        const { user, accessToken, refreshToken } = await service.login({
            username: body.username,
            password: body.password,
            device: deviceInfo,
            deviceId,
        });
        const { security } = AppConfig.load();
        const clientChannel = (this.getHeaders()['x-client-channel'] || '').toString().trim().toLowerCase();

        if (!clientChannel || clientChannel === 'web') {
            this.setCookie(security.jwtCookieAccessName, accessToken, {
                maxAge: JWTUtil.getAccessExpiresInMs(),
            });
            this.setCookie(security.jwtCookieRefreshName, refreshToken, {
                maxAge: JWTUtil.getRefreshExpiresInMs(),
            });
        }

        const responseData = clientChannel === 'web' ? { user } : { user, tokens: { accessToken, refreshToken } };
        this.success(responseData, 'Consulta exitosa');
    }

    async refresh() {
        const { deviceId, deviceInfo } = this._getDeviceData();
        const { accessToken, refreshToken, user } = await service.refresh(this._getRefreshSource(), { device: deviceInfo, deviceId });
        const { security } = AppConfig.load();
        const clientChannel = (this.getHeaders()['x-client-channel'] || '').toString().trim().toLowerCase();

        if (!clientChannel || clientChannel === 'web') {
            this.setCookie(security.jwtCookieAccessName, accessToken, {
                maxAge: JWTUtil.getAccessExpiresInMs(),
            });
            if (refreshToken != null) {
                this.setCookie(security.jwtCookieRefreshName, refreshToken, {
                    maxAge: JWTUtil.getRefreshExpiresInMs(),
                });
            }
        }

        const responseData = clientChannel === 'web' ? { user } : { user, tokens: { accessToken, refreshToken } };
        this.success(responseData, 'Consulta exitosa');
    }

    async logout() {
        const { security } = AppConfig.load();
        const headers = this.getHeaders();
        const clientChannel = (headers['x-client-channel'] || '').toString().trim().toLowerCase();
        const token = headers.authorization?.split(' ')[1];
        const source = this._getRefreshSource();
        const refreshToken = source[security.jwtCookieRefreshName];

        await service.logout({ token, refreshToken });

        if (!clientChannel || clientChannel === 'web') {
            this.clearCookie(security.jwtCookieAccessName);
            this.clearCookie(security.jwtCookieRefreshName);
        }

        this.success(null, 'Sesión cerrada exitosamente');
    }

    async register() {
        const body = this.getBody();
        const data = await service.register(body);
        this.created(data, 'Usuario registrado exitosamente');
    }

    async forgotUsername() {
        const body = this.getBody();
        const email = body.email;
        await service.forgotUsername({ email });
        this.success(null, 'Si el correo electrónico está asociado a alguna cuenta, se enviará un mensaje con la lista de usuarios');
    }

    async forgotPassword() {
        const body = this.getBody();
        const username = body.username;
        const email = body.email;
        const result = await service.forgotPassword({ username, email });
        this.success(result, 'Si el usuario y correo están vinculados a alguna cuenta, se enviará un código para restablecer la contraseña');
    }

    async verifyResetCode() {
        const body = this.getBody();
        const username = body.username;
        const code = body.code;
        const result = await service.verifyResetCode({ username, code });
        this.success(result, 'Código verificado con éxito');
    }

    async resetPassword() {
        const body = this.getBody();
        const username = body.username;
        const token = body.token;
        const password = body.password;
        await service.resetPassword({ username, token, password });
        this.success(null, 'Contraseña actualizada exitosamente');
    }
}

export default new AuthController();
