import { type Request, type Response, type NextFunction } from 'express';
import { JWTUtil } from '@utils/jwt.util.js';
import { AuthError, ForbiddenError, ConflictError, ValidationError } from '@errors';
import { SessionNotFoundError } from '@errors/auth.error.js';
import { AppConfig } from '@config/app.config.js';
import PermissionsService from '../services/permissions.service.js';

// Configuración simple
interface AuthConfig {
    /** Nombre de la cookie (si se usan cookies) */
    cookieName?: string;
    /** Nombre del header (si se usan headers) */
    headerName?: string;
}

export class AuthMiddleware {
    private static readonly DEFAULT_CONFIG: AuthConfig = {
        cookieName: AppConfig.load().security.jwtCookieAccessName || 'AT',
        headerName: 'Authorization',
    };

    private static config: AuthConfig = this.DEFAULT_CONFIG;

    /**
     * Configurar globalmente el middleware
     */
    static configure(config: Partial<AuthConfig>): void {
        this.config = { ...this.DEFAULT_CONFIG, ...config };

        if (!this.config.cookieName && !this.config.headerName)
            throw new ValidationError('Debe configurar al menos cookieName o headerName', [], {
                code: 'AUTH_CONFIG_INVALID',
            });
    }

    /**
     * Extraer token de la request
     */
    private static extractToken(req: Request): string | null {
        const clientChannel = (req.headers['x-client-channel'] || '').toString().trim().toLowerCase();
        const cookieName = this.config.cookieName || AppConfig.load().security.jwtCookieAccessName;
        const cookieToken = cookieName && req.cookies?.[cookieName] ? req.cookies[cookieName] : null;

        const authHeader = req.headers['authorization'] || req.headers[this.config.headerName?.toLowerCase() || 'authorization'];
        let headerToken: string | null = null;
        if (authHeader && typeof authHeader === 'string') {
            headerToken = JWTUtil.extractToken(authHeader);
        }

        // Si se especificó el canal 'web', DEBE autenticarse estrictamente por cookies
        if (clientChannel === 'web') {
            return cookieToken;
        }

        // Si se especificó cualquier otro canal (p.ej. 'mobile', 'pos', 'desktop'), DEBE autenticarse estrictamente por header (Bearer Token)
        if (clientChannel && clientChannel !== 'web') {
            return headerToken;
        }

        // Si no se definió x-client-channel, el backend intenta "adivinar" probando primero cookie y luego header
        return cookieToken || headerToken || null;
    }

    /**
     * 1. Verificar y obtener datos de la sesión
     * Compatible con tu uso: verifySession
     */
    static async verifySession(req: Request, _res: Response, next: NextFunction): Promise<void> {
        try {
            const token = AuthMiddleware.extractToken(req);

            if (!token) throw new AuthError('Token de autenticación no encontrado', { code: 'TOKEN_NOT_FOUND' });

            const session = JWTUtil.verifyAccessToken(token);

            if (!session) throw new AuthError('Token inválido', { code: 'TOKEN_INVALID' });

            // Validar estructura básica
            if (!session.id && !session.sub) throw new AuthError('Token no contiene identificador de usuario', { code: 'INVALID_TOKEN_PAYLOAD' });

            const userId = session.id || session.sub;
            const { roles, permissions } = await PermissionsService.getSessionPermissions(userId);

            // Establecer sesión (compatibilidad con tu código)
            req.session = {
                ...session,
                userId: userId,
                email: session.email,
                role: session.role,
                roles: roles as any,
                permissions: permissions as any,
            };

            next();
        } catch (error) {
            if (error instanceof AuthError) {
                next(error);
            } else if (error instanceof Error) {
                next(new AuthError(`Error de autenticación: ${error.message}`, { code: 'AUTH_FAILED' }));
            } else {
                next(new AuthError('Error de autenticación desconocido', { code: 'UNKNOWN_AUTH_ERROR' }));
            }
        }
    }

    /**
     * 2. Verificar permiso
     * Compatible con tu uso: verifyPermission('PERMISO') o verifyPermission(['PERMISO1', 'PERMISO2'])
     */
    static verifyPermission(permission: string | string[]) {
        return (req: Request, _res: Response, next: NextFunction): void => {
            try {
                if (!req.session) throw new SessionNotFoundError();

                const userPermissions = (req.session.permissions || []).map((p: any) => p.toUpperCase());

                // Normalizar permisos requeridos
                let requiredPermissions: string[] = [];

                if (typeof permission === 'string') {
                    requiredPermissions.push(permission.toUpperCase());
                } else if (Array.isArray(permission)) {
                    requiredPermissions = permission.map((p) => p.toUpperCase());
                } else {
                    throw new ValidationError('Formato de permisos inválido. Debe ser string o array de strings', [], {
                        code: 'INVALID_PERMISSION_FORMAT',
                    });
                }

                // Verificar que el usuario tenga TODOS los permisos requeridos
                const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));

                if (!hasAllPermissions) {
                    const missingPermissions = requiredPermissions.filter((perm) => !userPermissions.includes(perm));

                    throw new ForbiddenError();
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * 3. Prevenir login doble
     * Compatible con tu uso: preventDoubleLogin
     */
    static preventDoubleLogin(req: Request, _res: Response, next: NextFunction): void {
        try {
            const token = AuthMiddleware.extractToken(req);

            if (token) {
                // Verificar si el token es válido (no expirado)
                try {
                    JWTUtil.verifyAccessToken(token);
                    throw new ConflictError('Ya tienes una sesión activa', 'ACTIVE_SESSION_EXISTS');
                } catch (error) {
                    // Si el token está expirado o es inválido, permitir login
                    if (error instanceof Error && error.message.includes('expired')) {
                        next();
                        return;
                    }
                    // Otros errores de token también permiten login
                    next();
                    return;
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verificar rol (adicional, si lo necesitas)
     */
    static verifyRole(role: string | string[]) {
        return (req: Request, _res: Response, next: NextFunction): void => {
            try {
                if (!req.session) throw new SessionNotFoundError();

                if (!req.session.role) throw new ForbiddenError('Usuario no tiene rol asignado', { code: 'NO_ROLE_ASSIGNED' });

                const requiredRoles = Array.isArray(role) ? role : [role];
                const userRole = req.session.role.toUpperCase();

                const hasRequiredRole = requiredRoles.some((r) => r.toUpperCase() === userRole);

                if (!hasRequiredRole) {
                    throw new ForbiddenError(`Rol insuficiente. Requerido: ${requiredRoles.join(' o ')}, Actual: ${req.session.role}`, { code: 'INSUFFICIENT_ROLE' });
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Middleware opcional de autenticación (no falla si no hay token)
     */
    static async optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
        try {
            const token = AuthMiddleware.extractToken(req);

            if (token) {
                try {
                    const session = JWTUtil.verifyAccessToken(token);

                    if (session) {
                        const userId = session.userId || session.sub;
                        const { roles, permissions } = await PermissionsService.getSessionPermissions(userId as string);

                        req.session = {
                            userId: userId,
                            email: session.email,
                            role: session.role,
                            roles: roles as any,
                            permissions: permissions as any,
                            ...session,
                        };
                    }
                } catch {
                    // Ignorar errores de token en autenticación opcional
                }
            }

            next();
        } catch {
            next(); // Siempre continuar en optionalAuth
        }
    }
}

// Exportar funciones individuales para uso directo
export const verifySession = AuthMiddleware.verifySession;
export const verifyPermission = AuthMiddleware.verifyPermission;
export const preventDoubleLogin = AuthMiddleware.preventDoubleLogin;
export const verifyRole = AuthMiddleware.verifyRole;
export const optionalAuth = AuthMiddleware.optionalAuth;

// Configurar por defecto (puedes sobrescribir en tu app)
AuthMiddleware.configure({
    cookieName: (AppConfig.load() as any).security?.jwtCookieAccessName || 'access_token', // Usar la configuración de entorno o defecto
    headerName: 'Authorization', // También soportar headers
});

export default AuthMiddleware;
