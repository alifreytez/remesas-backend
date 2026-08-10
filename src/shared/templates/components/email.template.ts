// Paleta de colores oficial del Sistema de Remesas y la UCLA
export const colors = {
    background: '#F3F5F9',
    surface: '#FFFFFF',
    primary: '#00233B',
    primaryGradient: 'linear-gradient(145deg, #00233B 0%, #01131F 100%)',
    secondary: '#02A8E8',
    tertiary: '#F8C301',
    darkNight: '#01131F',
    textDark: '#333333',
    textMedium: '#555555',
    textLight: '#767A7D',
    textMuted: '#A0A5AA',
    border: '#EAEEF5',
    warningBg: '#FFFBF0',
};

// Tipografía oficial (Ubuntu con stack robusto sin comillas ni tokens con guiones para compatibilidad con Gmail)
export const fontFamily = 'Ubuntu, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif';

// Referencia CID para imagen embebida como adjunto Blob/MIME (sin depender de URLs web externas)
export const REMESAS_LOGO_URL = 'cid:REMESAS_logo';

// Componente de Envoltura Principal (Layout Base)
export const EmailLayout = (title: string, content: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REMESAS - ${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
        body, table, td, p, a, li, blockquote, h1, h2, h3, span, div {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            font-family: ${fontFamily} !important;
        }
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: ${colors.background};
            font-family: ${fontFamily};
            -webkit-font-smoothing: antialiased;
            color: ${colors.textDark};
        }
        table { border-collapse: collapse !important; border-spacing: 0 !important; }
        img { border: 0; outline: none; text-decoration: none; display: block; max-width: 100%; height: auto; }
        a { color: ${colors.secondary}; text-decoration: none; }
        @media only screen and (max-width: 760px) {
            .email-wrapper { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
            .content-cell, .title-cell, .footer-cell { padding-left: 22px !important; padding-right: 22px !important; }
            .title-cell { font-size: 18px !important; padding-top: 22px !important; padding-bottom: 22px !important; }
            .footer-logo { max-width: 115px !important; }
            .code-box { font-size: 26px !important; letter-spacing: 6px !important; padding: 15px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: ${fontFamily};">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${colors.background}; width: 100%; margin: 0; padding: 0; font-family: ${fontFamily};">
        <tr>
            <td align="center" style="padding: 40px 15px; font-family: ${fontFamily};">
                <table class="email-wrapper" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 750px; background-color: ${colors.surface}; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 35px rgba(0, 35, 59, 0.09); border: 1px solid #E6ECEE; font-family: ${fontFamily};">
                    <tr>
                        <td height="6" style="background-color: ${colors.tertiary}; font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td class="title-cell" align="center" style="padding: 28px 30px; background-color: ${colors.primary}; background-image: ${colors.primaryGradient}; border-bottom: 3px solid ${colors.secondary}; font-family: ${fontFamily};">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: ${colors.surface}; font-family: ${fontFamily}; letter-spacing: 3px; text-transform: uppercase;">
                                ${title}
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content-cell" style="padding: 50px 52px; background-color: ${colors.surface}; color: ${colors.textDark}; font-family: ${fontFamily};">
                            ${content}
                        </td>
                    </tr>
                    <tr>
                        <td class="footer-cell" align="center" style="padding: 38px 32px; background-color: ${colors.darkNight}; border-top: 4px solid ${colors.tertiary}; font-family: ${fontFamily};">
                            <img class="footer-logo" src="${REMESAS_LOGO_URL}" alt="REMESAS - Sistema de Remesas" style="width: 100%; max-width: 130px; height: auto; display: block; margin: 0 auto 22px auto;">
                            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: ${colors.surface}; font-family: ${fontFamily}; letter-spacing: 0.5px;">
                                Universidad Centroccidental Lisandro Alvarado
                            </p>
                            <p style="margin: 0 0 22px 0; font-size: 12px; font-weight: 500; color: ${colors.secondary}; font-family: ${fontFamily};">
                                Sistema de Remesas
                            </p>
                            <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 400; color: ${colors.textLight}; font-family: ${fontFamily}; line-height: 1.6; max-width: 550px;">
                                Este mensaje es confidencial y está dirigido exclusivamente a su destinatario. Si has recibido este correo por error, por favor elimínalo y notifica al remitente.
                            </p>
                            <p style="margin: 0; font-size: 12px; font-weight: 400; color: ${colors.textMuted}; font-family: ${fontFamily};">
                                © ${new Date().getFullYear()} REMESAS — Dirección de Informática. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Componente para caja de código de verificación de alto contraste
export const VerificationCodeBox = (code: string): string => `
<div style="text-align: center; margin: 35px 0; font-family: ${fontFamily};">
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 100%; max-width: 440px;">
        <tr>
            <td class="code-box" align="center" style="background-color: ${colors.background}; border: 2px dashed ${colors.secondary}; border-radius: 10px; padding: 16px 25px; font-size: 32px; font-weight: 700; color: ${colors.primary}; font-family: ${fontFamily}; letter-spacing: 10px; box-shadow: inset 0 2px 6px rgba(0, 35, 59, 0.04);">${String(code).trim()}</td>
        </tr>
    </table>
</div>
`;

// Componente de advertencia o aviso preventivo institucional
export const SecurityAlertBox = (message: string, title: string = 'Atención:'): string => `
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${colors.warningBg}; border-left: 4px solid ${colors.tertiary}; border-radius: 0 8px 8px 0; margin-bottom: 25px; font-family: ${fontFamily};">
    <tr>
        <td style="padding: 15px 20px; font-family: ${fontFamily};">
            <p style="margin: 0; font-size: 13px; color: ${colors.textMedium}; font-family: ${fontFamily}; font-weight: 400; line-height: 1.6;">
                <strong style="color: ${colors.primary}; font-weight: 700; font-family: ${fontFamily};">${title}</strong> ${message}
            </p>
        </td>
    </tr>
</table>
`;

// Componente divisor de sección horizontal
export const SectionDivider = (): string => `
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 35px 0 25px 0;">
    <tr>
        <td style="border-top: 1px solid ${colors.border};">&nbsp;</td>
    </tr>
</table>
`;


