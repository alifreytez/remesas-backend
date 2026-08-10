import { EmailLayout, SecurityAlertBox, SectionDivider, colors, fontFamily } from '../components/email.template.js';

// Genera la plantilla de correo en HTML para la notificación de confirmación de contraseña actualizada exitosamente
export const PasswordResetSuccessEmailTemplate = (recipientName?: string): string => {
    const greeting = recipientName ? `¡Hola, ${recipientName}!` : '¡Hola!';

    const content = `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: ${colors.textDark}; font-family: ${fontFamily}; font-weight: 700;">
            ${greeting}
        </p>
        
        <p style="margin: 0 0 25px 0; font-size: 15px; color: ${colors.textMedium}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.8;">
            Te notificamos que la contraseña asociada a tu cuenta en el <strong style="font-weight: 700; color: ${colors.primary}; font-family: ${fontFamily};">Sistema de Remesas</strong> ha sido restablecida y actualizada con éxito.
        </p>

        <div style="margin: 30px 0; font-family: ${fontFamily};">
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 100%; max-width: 540px; background-color: #EEF8F2; border-left: 4px solid #10B981; border-radius: 0 10px 10px 0; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.06); border-top: 1px solid #D1FAE5; border-right: 1px solid #D1FAE5; border-bottom: 1px solid #D1FAE5;">
                <tr>
                    <td style="padding: 20px 24px; font-family: ${fontFamily};">
                        <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #065F46; font-family: ${fontFamily};">
                            ✔ Cambio completado correctamente
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #047857; font-family: ${fontFamily}; line-height: 1.6;">
                            Tu nueva clave de acceso ya se encuentra activa en la plataforma. Como medida preventiva de seguridad, se ha cerrado la sesión activa en todos tus dispositivos y deberás iniciar sesión nuevamente con tus nuevas credenciales.
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        ${SectionDivider()}

        ${SecurityAlertBox('Si tú no realizaste este cambio de contraseña, tu cuenta se encuentra en riesgo. Comunícate de forma INMEDIATA con el equipo de soporte o la Dirección de Informática para bloquear y auditar el acceso a tus credenciales.', '🚨 Alerta Crítica de Seguridad:')}

        <p style="margin: 0; font-size: 14px; color: ${colors.textDark}; font-family: ${fontFamily}; font-weight: 700;">
            Atentamente,<br>
            <span style="font-weight: 400; color: ${colors.textLight}; font-size: 13px; font-family: ${fontFamily};">Dirección de Informática — REMESAS</span>
        </p>
    `;

    return EmailLayout('Contraseña Actualizada', content);
};


