import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppConfig } from '@config/app.config.js';
import { Logger } from '@utils/logger.util.js';
import { ANSI } from '@utils/ansi.util.js';
import { AppError } from '@errors/app.error.js';
import { EmailError } from '@errors/email.error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMAIL_PROVIDER_SYMBOL = Symbol.for('global.email.provider');

export interface MailAccountConfig {
    host?: string;
    port?: number;
    user: string;
    pass: string;
    from?: string;
}

export interface SendMailParams {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: Array<{
        filename?: string;
        content?: any;
        path?: string;
        contentType?: string;
        cid?: string;
    }>;
}

export class EmailProvider {
    private static _instance: EmailProvider;
    private transporters = new Map<string, nodemailer.Transporter>();

    private constructor() {
        Logger.natural(ANSI.success(`[+] Email Provider initialized`));
    }

    static getInstance(): EmailProvider {
        if (AppConfig.isProduction()) {
            if (!this._instance) this._instance = new EmailProvider();
            return this._instance;
        } else {
            const globalWithEmail = globalThis as typeof globalThis & {
                [EMAIL_PROVIDER_SYMBOL]: EmailProvider;
            };

            if (!globalWithEmail[EMAIL_PROVIDER_SYMBOL]) {
                globalWithEmail[EMAIL_PROVIDER_SYMBOL] = new EmailProvider();
            }

            return globalWithEmail[EMAIL_PROVIDER_SYMBOL];
        }
    }

    /**
     * Registra o recupera un transporter de correo (cuenta SMTP).
     * Siempre exige explícitamente credenciales legítimas en config (user, pass).
     * En entorno desarrollo, después de validar que el envío es legítimo con credenciales provistas,
     * reemplaza su uso por las credenciales del sistema del .env. El campo 'from' siempre toma el valor del 'user'.
     */
    async addHandler(accountID: string, config?: MailAccountConfig): Promise<nodemailer.Transporter> {
        if (this.transporters.has(accountID)) return this.transporters.get(accountID)!;

        const appConfig = AppConfig.load();

        if (!config || !config.user || !config.pass) {
            throw new Error(`No se pudo añadir el transporter para la cuenta (${accountID}), faltan credenciales o son inválidas (se deben proveer credenciales legítimas en cualquier entorno).`);
        }

        let mailConfig: MailAccountConfig;

        if (AppConfig.isDevelopment()) {
            mailConfig = {
                host: appConfig.emailProvider.host,
                port: appConfig.emailProvider.port,
                user: appConfig.emailProvider.user,
                pass: appConfig.emailProvider.pass,
                from: appConfig.emailProvider.user,
            };
            Logger.natural(ANSI.info(`[*] Development mode: Using .env email credentials for transporter [${accountID}] (original account: ${config.user}).`));
        } else {
            mailConfig = {
                host: config.host || appConfig.emailProvider.host,
                port: config.port || appConfig.emailProvider.port,
                user: config.user,
                pass: config.pass,
                from: config.user,
            };
        }

        const transporter = nodemailer.createTransport({
            host: mailConfig.host,
            port: mailConfig.port,
            secure: mailConfig.port === 465, // true for 465, false for other ports
            auth: {
                user: mailConfig.user,
                pass: mailConfig.pass,
            },
            logger: !AppConfig.isProduction(),
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
        });

        // Verificamos conexión
        try {
            await transporter.verify();
            // Agregamos al mapper de transporters una propiedad "from" para uso interno
            (transporter.options as any).customFrom = mailConfig.from;
            this.transporters.set(accountID, transporter);
            Logger.natural(ANSI.success(`[+] Transporter [${accountID}] registered successfully.`));
        } catch (error) {
            Logger.error(`[-] Failed to verify transporter [${accountID}]`, error as Error);
            throw error;
        }

        return transporter;
    }

    existsHandler(accountID: string): boolean {
        return this.transporters.has(accountID);
    }

    getHandler(accountID: string): nodemailer.Transporter | undefined {
        return this.transporters.get(accountID);
    }

    async sendMail(accountID: string, params: SendMailParams): Promise<any> {
        if (!this.existsHandler(accountID)) {
            throw new AppError({
                message: 'El sistema de correos no está configurado correctamente en este momento.',
                statusCode: 500,
                code: 'ERR_MAIL_NO_TRANSPORTER',
                data: { missingAccountID: accountID },
            });
        }

        if (!params?.to || !params?.subject || !params?.html) {
            throw new AppError({
                message: 'Faltan parámetros requeridos para procesar el envío del correo.',
                statusCode: 400,
                code: 'ERR_MAIL_MISSING_PARAMS',
                data: {
                    to: params?.to,
                    subject: params?.subject,
                    hasHtml: !!params?.html,
                },
            });
        }

        if (AppConfig.isDevelopment()) {
            const toAddresses: string[] = Array.isArray(params.to) ? params.to : params.to.split(',').map((e) => e.trim());

            const availableForSend = AppConfig.load().emailProvider.availableForSend;
            const unauthorizedEmails = toAddresses.filter((email) => !availableForSend.includes(email.toLowerCase()));

            if (unauthorizedEmails.length > 0) {
                throw new AppError({
                    message: `Envío de correo no autorizado en desarrollo para: ${unauthorizedEmails.join(', ')}`,
                    statusCode: 403,
                    code: 'ERR_MAIL_UNAUTHORIZED_RECIPIENT',
                    data: { unauthorizedEmails },
                });
            }
        }

        const transporter = this.getHandler(accountID)!;
        const fromAddress = (transporter.options as any).customFrom || (transporter.options as any).auth.user;

        const attachments = this.resolveAttachments(params.html, params.attachments);

        const mailOptions: nodemailer.SendMailOptions = {
            from: `"REMESAS" <${fromAddress}>`,
            to: params.to,
            subject: params.subject,
            html: params.html,
            ...(attachments.length > 0 && { attachments }),
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            Logger.natural(ANSI.success(`[+] Email sent successfully to ${params.to} via [${accountID}]`));
            return info;
        } catch (error: any) {
            const smtpCode = error?.code || 'NO_SMTP_CODE';
            const smtpResponse = error?.response || 'Sin respuesta del servidor SMTP';
            const smtpCommand = error?.command || 'Desconocido';

            Logger.error(`Failed to send email to ${params.to} via [${accountID}]`, error as Error);

            throw new EmailError('Ocurrió un problema de comunicación al intentar enviar el correo. Por favor, intente más tarde.', `SEND_EMAIL_[${accountID ? accountID.toUpperCase() : 'UNKNOWN'}]`, {
                statusCode: 502,
                cause: error,
                data: {
                    operation: `SEND_EMAIL_[${accountID ? accountID.toUpperCase() : 'UNKNOWN'}]`,
                    nodemailerCode: smtpCode,
                    nodemailerResponse: smtpResponse,
                    nodemailerCommand: smtpCommand,
                    originalMessage: error?.message || 'Error desconocido',
                },
            });
        }
    }
    private resolveAttachments(html: string, existingAttachments: any[] = []): any[] {
        const attachments = [...existingAttachments];

        if (html.includes('cid:REMESAS_logo') && !attachments.some((a) => a.cid === 'REMESAS_logo')) {
            const possiblePaths = [
                path.resolve(__dirname, '../templates/assets/logo.png'),
                path.resolve(process.cwd(), 'src/shared/templates/assets/logo.png'),
                path.resolve(process.cwd(), 'build/shared/templates/assets/logo.png'),
                path.resolve(process.cwd(), '../client/static/images/logo.png'),
            ];

            for (const assetPath of possiblePaths) {
                if (fs.existsSync(assetPath)) {
                    attachments.push({
                        filename: 'logo.png',
                        content: fs.readFileSync(assetPath),
                        cid: 'REMESAS_logo',
                        contentType: 'image/png',
                    });
                    break;
                }
            }
        }

        return attachments;
    }
}
export const emailProvider = EmailProvider.getInstance();


