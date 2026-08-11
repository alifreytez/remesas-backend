export const colors = {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    textMain: '#111827',
    textMuted: '#4B5563',
    border: '#E5E7EB',
    primary: '#111827',
    secondary: '#6B7280',
    link: '#6200EA'
};

export const fontFamily = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const REMESAS_LOGO_URL = 'cid:REMESAS_logo';

export const EmailLayout = (title: string, content: string): string => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remesas Inc - ${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        body, table, td, p, a, h1, h2, h3, span {
            font-family: ${fontFamily} !important;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        body { margin: 0 !important; padding: 0 !important; background-color: ${colors.background}; }
        table { border-collapse: collapse !important; border-spacing: 0 !important; }
        img { border: 0; outline: none; text-decoration: none; display: block; }
        .main-wrapper { width: 100%; min-height: 100dvh; padding: 40px 20px; background-color: ${colors.background}; box-sizing: border-box; display: flex; align-items: center; }
        .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: ${colors.surface}; border-radius: 8px; overflow: hidden; border: 1px solid ${colors.border}; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .header-cell { padding: 40px 40px 30px 40px; text-align: center; }
        .logo-img { margin: 0 auto; max-height: 48px; width: auto; display: block; }
        .content-cell { padding: 30px 40px 40px 40px; text-align: center; }
        .content-cell h3 { margin: 0 0 15px 0; font-size: 28px; color: ${colors.textMain}; font-weight: 700; }
        .content-cell p { margin: 0 0 20px 0; font-size: 14px; color: ${colors.textMuted}; line-height: 1.6; font-weight: 400; }
        .footer-cell { padding: 30px 40px; text-align: center; border-top: 1px solid ${colors.border}; }
        .footer-text { margin: 0 auto 15px auto; font-size: 13px; color: ${colors.secondary}; line-height: 1.6; max-width: 380px; }
        .footer-link { color: ${colors.link}; text-decoration: none; font-weight: 600; }
        .footer-signoff { margin: 0 0 25px 0; font-size: 13px; color: ${colors.secondary}; line-height: 1.6; }
        .copyright { font-size: 12px; color: #9CA3AF; }
        @media only screen and (max-width: 600px) {
            .main-wrapper { padding: 15px 10px; }
            .header-cell, .content-cell, .footer-cell { padding-left: 15px !important; padding-right: 15px !important; }
            .content-cell h3 { font-size: 24px !important; }
        }
    </style>
</head>
<body>
    <div class="main-wrapper">
        <table class="email-container" width="100%" border="0" cellpadding="0" cellspacing="0" align="center">
            <tr>
                <td class="header-cell">
                    <img src="${REMESAS_LOGO_URL}" alt="Remesas Inc" class="logo-img">
                </td>
            </tr>
            <tr>
                <td class="content-cell">
                    ${content}
                </td>
            </tr>
            <tr>
                <td class="footer-cell">
                    <p class="footer-text">
                        Si no solicitaste esta acción, puedes ignorar este mensaje o contactar a <a href="mailto:support@remesasinc.com" class="footer-link">soporte</a>.
                    </p>
                    <p class="footer-signoff">El equipo de Remesas Inc</p>
                    <p class="copyright">© ${new Date().getFullYear()} Remesas Inc</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

export const VerificationCodeBox = (code: string): string => `
<div style="background-color: #F3F4F6; border-radius: 6px; padding: 24px; margin-bottom: 30px; text-align: center; border: 1px solid #E5E7EB;">
    <span style="font-size: 32px; font-weight: 700; color: ${colors.textMain}; letter-spacing: 10px;">${String(code).trim()}</span>
</div>
`;

export const SecurityAlertBox = (message: string, title: string = 'Atención:'): string => `
<div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 4px; padding: 15px 20px; margin-bottom: 25px; text-align: left;">
    <p style="margin: 0; font-size: 13px; color: #991B1B; font-weight: 400; line-height: 1.6;">
        <strong style="font-weight: 600;">${title}</strong> ${message}
    </p>
</div>
`;

export const SectionDivider = (): string => `
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
    <tr>
        <td style="border-top: 1px solid ${colors.border};">&nbsp;</td>
    </tr>
</table>
`;
