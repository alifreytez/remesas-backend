import { EmailLayout, VerificationCodeBox, SecurityAlertBox, SectionDivider, colors, fontFamily } from '../components/email.template.js';

// Genera la plantilla de correo en HTML para el envío del código de recuperación y restablecimiento de clave
export const PasswordResetEmailTemplate = (verificationCode: string, recipientName?: string): string => {
    const greeting = recipientName ? `¡Hola, ${recipientName}!` : '¡Hola!';

    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: ${colors.textDark}; font-family: ${fontFamily}; font-weight: 700;">
            ${greeting}
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: ${colors.textMedium}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.8;">
            Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta en el <strong style="font-weight: 700; color: ${colors.primary}; font-family: ${fontFamily};">Sistema de Remesas</strong>.
        </p>

        <p style="margin: 0 0 35px 0; font-size: 15px; color: ${colors.textMedium}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.8;">
            Por favor, ingresa el siguiente código de autenticación en la plataforma para continuar con la actualización de tus credenciales:
        </p>

        ${VerificationCodeBox(verificationCode)}

        <p style="margin: 0 0 35px 0; font-size: 13px; color: ${colors.textLight}; font-family: ${fontFamily}; font-weight: 400; text-align: center; font-style: italic;">
            Este código de verificación tiene una vigencia limitada por razones de seguridad.
        </p>

        ${SectionDivider()}

        ${SecurityAlertBox('Si no solicitaste este cambio, te recomendamos ignorar este mensaje o comunicarte de inmediato con el equipo de soporte informático de tu dependencia.', 'Atención:')}

        <p style="margin: 0; font-size: 14px; color: ${colors.textDark}; font-family: ${fontFamily}; font-weight: 700;">
            Atentamente,<br>
            <span style="font-weight: 400; color: ${colors.textLight}; font-size: 13px; font-family: ${fontFamily};">Dirección de Informática — REMESAS</span>
        </p>
    `;

    return EmailLayout('Restablecer Contraseña', content);
};


