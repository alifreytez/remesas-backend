import { emailProvider } from '@providers/email.provider.js';
import { AppConfig } from '@config/app.config.js';
import { Logger } from '@utils/logger.util.js';
import { PasswordResetEmailTemplate } from '@templates/emails/password-reset.template.js';
import { PasswordResetSuccessEmailTemplate } from '@templates/emails/password-reset-success.template.js';
import { ForgotUsernameEmailTemplate } from '@templates/emails/forgot-username.template.js';

class AuthEmailService {
    private readonly AUTH_ACCOUNT_ID = 'AUTH_MAIL';

    private get provider() {
        return emailProvider;
    }

    /**
     * Asegura que el transporter de Auth esté registrado antes de usarlo.
     * Aquí decidimos explícitamente consumir las credenciales del sistema configuradas en el .env
     * para el envío de notificaciones del módulo de autenticación (ej. recuperación de clave).
     */
    private async ensureTransporter(): Promise<void> {
        if (!this.provider.existsHandler(this.AUTH_ACCOUNT_ID)) {
            try {
                const appConfig = AppConfig.load();
                await this.provider.addHandler(this.AUTH_ACCOUNT_ID, {
                    user: appConfig.emailProvider.user,
                    pass: appConfig.emailProvider.pass,
                    from: appConfig.emailProvider.user,
                });
            } catch (error) {
                Logger.error('Failed to initialize AuthEmailService transporter', error as Error);
            }
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        await this.ensureTransporter();
        try {
            await this.provider.sendMail(this.AUTH_ACCOUNT_ID, { to, subject, html });
            return true;
        } catch (error) {
            return false;
        }
    }

    async sendPasswordResetEmail(to: string, resetToken: string, recipientName?: string): Promise<boolean> {
        await this.ensureTransporter();
        const subject = 'REMESAS — Código para Restablecimiento de Contraseña';
        const html = PasswordResetEmailTemplate(resetToken, recipientName);

        try {
            await this.provider.sendMail(this.AUTH_ACCOUNT_ID, { to, subject, html });
            return true;
        } catch (error) {
            return false;
        }
    }

    async sendPasswordResetSuccessEmail(to: string, recipientName?: string): Promise<boolean> {
        await this.ensureTransporter();
        const subject = 'REMESAS — Confirmación de Contraseña Actualizada';
        const html = PasswordResetSuccessEmailTemplate(recipientName);

        try {
            await this.provider.sendMail(this.AUTH_ACCOUNT_ID, { to, subject, html });
            return true;
        } catch (error) {
            return false;
        }
    }

    async sendForgotUsernameEmail(to: string, users: { username: string; userType: string }[], recipientName?: string): Promise<boolean> {
        await this.ensureTransporter();
        const subject = 'REMESAS — Recordatorio de Usuarios';
        const html = ForgotUsernameEmailTemplate(users, recipientName);

        try {
            await this.provider.sendMail(this.AUTH_ACCOUNT_ID, { to, subject, html });
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const authEmailService = new AuthEmailService();


