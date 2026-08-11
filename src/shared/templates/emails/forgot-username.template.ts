import { EmailLayout, colors, fontFamily } from '../components/email.template.js';

// Genera la plantilla de correo para recordar los nombres de usuario
export const ForgotUsernameEmailTemplate = (users: { username: string; userType: string }[], recipientName?: string): string => {
    const greeting = recipientName ? `¡Hola, ${recipientName}!` : '¡Hola!';

    const userListItems = users.map(user => `
        <p style="margin: 0 0 12px 0; font-size: 16px; color: ${colors.textMain}; font-weight: 600; font-family: ${fontFamily};">
            ${user.username} <span style="font-size: 14px; color: ${colors.secondary}; font-weight: 400; margin-left: 6px;">(${user.userType})</span>
        </p>
    `).join('');

    const content = `
        <h3 style="margin: 0 0 15px 0; font-size: 28px; color: ${colors.textMain}; font-weight: 700; font-family: ${fontFamily};">
            ${greeting}
        </h3>
        
        <p style="margin: 0 0 30px 0; font-size: 14px; color: ${colors.textMuted}; line-height: 1.6; font-weight: 400; font-family: ${fontFamily};">
            ¿Olvidaste tu usuario? No hay problema.<br>
            Aquí tienes la lista de usuarios asociados a tu correo electrónico.
        </p>

        <div style="background-color: #F3F4F6; border-radius: 6px; padding: 24px; margin-bottom: 30px; text-align: left; border: 1px solid ${colors.border};">
            ${userListItems}
        </div>

        <a href="http://localhost:5173/login" style="display: inline-block; padding: 14px 40px; background-color: ${colors.secondary}; color: #FFFFFF !important; text-decoration: none; border-radius: 9999px; font-weight: 500; font-size: 16px; letter-spacing: 0.3px; font-family: ${fontFamily};">
            Ir a iniciar sesión
        </a>
    `;

    return EmailLayout('Recuperación de cuenta', content);
};
