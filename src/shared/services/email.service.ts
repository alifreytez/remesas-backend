import { emailProvider, type MailAccountConfig, type SendMailParams } from '@providers/email.provider.js';

class EmailService {
    async addHandler(accountID: string, config?: MailAccountConfig) {
        return emailProvider.addHandler(accountID, config);
    }

    existsHandler(accountID: string) {
        return emailProvider.existsHandler(accountID);
    }

    getHandler(accountID: string) {
        return emailProvider.getHandler(accountID);
    }

    async send(accountID: string, params: SendMailParams) {
        return emailProvider.sendMail(accountID, params);
    }
}

export const mailManager = new EmailService();
export default mailManager;
