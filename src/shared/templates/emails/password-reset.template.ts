import { EmailLayout, VerificationCodeBox, SecurityAlertBox, SectionDivider, colors, fontFamily } from '../components/email.template.js';

// Genera la plantilla de correo en HTML para el envío del código de recuperación y restablecimiento de clave
export const PasswordResetEmailTemplate = (verificationCode: string, recipientName?: string): string => {
    const greeting = recipientName ? `¡Hola, ${recipientName}!` : '¡Hola!';

    const content = `
        <h3 style="margin: 0 0 15px 0; font-size: 28px; color: ${colors.textMain}; font-weight: 700; font-family: ${fontFamily};">
            ${greeting}
        </h3>
        
        <p style="margin: 0 0 20px 0; font-size: 14px; color: ${colors.textMuted}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta en el <strong style="font-weight: 600; color: ${colors.primary}; font-family: ${fontFamily};">Sistema de Remesas</strong>.
        </p>

        <p style="margin: 0 0 35px 0; font-size: 14px; color: ${colors.textMuted}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.6;">
            Por favor, ingresa el siguiente código de autenticación en la plataforma para continuar con la actualización de tus credenciales:
        </p>

        ${VerificationCodeBox(verificationCode)}

        <p style="margin: 0 0 35px 0; font-size: 14px; color: ${colors.secondary}; font-family: ${fontFamily}; font-weight: 400; text-align: center;">
            Este código de verificación tiene una vigencia limitada por razones de seguridad.
        </p>

        ${SectionDivider()}

        ${SecurityAlertBox('Si no solicitaste este cambio, te recomendamos ignorar este mensaje o comunicarte de inmediato con el equipo de soporte.', 'Atención:')}
    `;

    return EmailLayout('Restablecer Contraseña', content);
};
