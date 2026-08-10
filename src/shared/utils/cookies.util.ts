import { AppError } from '@errors/app.error.js';

export interface CookieConfig {
    httpOnly?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None' | boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
}

export interface CreateCookieParams {
    name: string;
    content?: string;
    config?: CookieConfig;
}

export const createCookie = (params: CreateCookieParams) => {
    const { name, content = 'empty', config = {} } = params;
    if (!name || content == null) {
        throw new AppError({
            message: 'Error al intentar crear una cookie.',
            statusCode: 400,
            code: 'COOKIE_CREATION_FAILED',
        });
    }

    const { httpOnly = true, sameSite = 'None', secure = true, maxAge = 1000, path = '/' } = config;

    return {
        name,
        content,
        config: { httpOnly, sameSite, secure, maxAge, path },
    };
};
