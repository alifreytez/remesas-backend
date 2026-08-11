import { EmailLayout, SecurityAlertBox, SectionDivider, colors, fontFamily } from '../components/email.template.js';

// Genera la plantilla de correo en HTML para la notificación de confirmación de contraseña actualizada exitosamente
export const PasswordResetSuccessEmailTemplate = (recipientName?: string): string => {
    const greeting = recipientName ? `¡Hola, ${recipientName}!` : '¡Hola!';

    const content = `
        <h3 style="margin: 0 0 15px 0; font-size: 28px; color: ${colors.textMain}; font-weight: 700; font-family: ${fontFamily};">
            ${greeting}
        </h3>
        
        <p style="margin: 0 0 25px 0; font-size: 14px; color: ${colors.textMuted}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.6;">
            Te notificamos que la contraseña asociada a tu cuenta en el <strong style="font-weight: 600; color: ${colors.primary}; font-family: ${fontFamily};">Sistema de Remesas</strong> ha sido restablecida y actualizada con éxito.
        </p>

        <div style="margin: 30px 0; font-family: ${fontFamily}; text-align: left;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 100%; background-color: #EEF8F2; border-left: 4px solid #10B981; border-radius: 4px; border: 1px solid #D1FAE5; border-left-width: 4px; border-left-color: #10B981;">
                <tr>
                    <td style="padding: 15px 20px; font-family: ${fontFamily};">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #065F46; font-family: ${fontFamily};">
                            ✔ Cambio completado correctamente
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #047857; font-family: ${fontFamily}; line-height: 1.6;">
                            Tu nueva clave de acceso ya se encuentra activa en la plataforma. Como medida preventiva de seguridad, se ha cerrado la sesión activa en todos tus dispositivos y deberás iniciar sesión nuevamente con tus nuevas credenciales.
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        ${SectionDivider()}

        ${SecurityAlertBox('Si tú no realizaste este cambio de contraseña, tu cuenta se encuentra en riesgo. Comunícate de forma INMEDIATA con el equipo de soporte para bloquear el acceso a tus credenciales.', '🚨 Alerta Crítica de Seguridad:')}
    `;

    return EmailLayout('Contraseña Actualizada', content);
};
