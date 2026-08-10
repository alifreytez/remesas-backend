import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { emailProvider } from '@providers/email.provider.js';
import { AppConfig } from '@config/app.config.js';
import { ANSI } from '@utils/ansi.util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TemplateParam {
    name: string;
    type: string;
    optional: boolean;
    defaultTestValue: any;
}

interface TemplateMetadata {
    filename: string;
    cleanName: string;
    exportName: string;
    description: string;
    signature: string;
    params: TemplateParam[];
    filePath: string;
}

/**
 * Módulo CLI para Testing e Inspección de Plantillas de Correo (REMESAS RBAC)
 */
class EmailTestCLI {
    private templatesDir = path.resolve(__dirname, '../shared/templates/emails');
    private metadata: TemplateMetadata[] = [];

    constructor() {
        this.scanTemplates();
    }

    /**
     * Escanea el directorio de plantillas y extrae su firma (argumentos y tipos)
     */
    private scanTemplates(): void {
        if (!fs.existsSync(this.templatesDir)) {
            console.error(ANSI.error(`❌ Error: El directorio de plantillas no existe: ${this.templatesDir}`));
            return;
        }

        const files = fs.readdirSync(this.templatesDir).filter((f) => f.endsWith('.template.ts') || f.endsWith('.template.js'));

        for (const file of files) {
            const filePath = path.join(this.templatesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Limpiar el nombre del template (quitar extension y .template)
            const cleanName = file.replace(/\.template\.(ts|js)$/, '');

            // Extraer nombre de la función exportada y sus argumentos
            const fnRegex = /export\s+(?:const|function)\s+(\w+)\s*(?:=\s*)?\(([^)]*)\)/;
            const fnMatch = fnRegex.exec(content);

            if (!fnMatch) continue;

            const exportName = fnMatch[1];
            const rawParams = fnMatch[2].trim();

            // Extraer descripción en comentarios justo antes o en el archivo
            let description = 'Plantilla de correo electrónica del sistema REMESAS';
            const commentRegex = new RegExp(`(//|/\\*\\*)\\s*([^\\n*]+)(?:\\n|\\*/)\\s*export\\s+(?:const|function)\\s+${exportName}`);
            const commentMatch = commentRegex.exec(content);
            if (commentMatch) {
                description = commentMatch[2].trim();
            } else {
                // Buscar cualquier comentario al principio de la definición
                const simpleCommentRegex = /\/\/\s*([^\r\n]+)\r?\n\s*export\s+(?:const|function)/;
                const simpleMatch = simpleCommentRegex.exec(content);
                if (simpleMatch) description = simpleMatch[1].trim();
            }

            const params: TemplateParam[] = [];
            if (rawParams.length > 0) {
                const paramParts = rawParams.split(',');
                for (const p of paramParts) {
                    const trimmed = p.trim();
                    // match: name, ?, type
                    const pMatch = /^(\w+)(\?)?(?:\s*:\s*([^=]+))?/.exec(trimmed);
                    if (pMatch) {
                        const name = pMatch[1];
                        const optional = !!pMatch[2] || trimmed.includes('=');
                        const type = (pMatch[3] || 'any').trim();

                        // Generar valor por defecto inteligente según nombre o tipo
                        let defaultVal: any = 'Valor de prueba REMESAS';
                        const lowerName = name.toLowerCase();
                        if (lowerName.includes('code') || lowerName.includes('codigo') || lowerName.includes('token')) {
                            defaultVal = '82390412';
                        } else if (lowerName.includes('name') || lowerName.includes('nombre') || lowerName.includes('recipient')) {
                            defaultVal = 'Alí Freitez (Usuario Test)';
                        } else if (lowerName.includes('email') || lowerName.includes('correo')) {
                            defaultVal = 'usuario.test@ucladinformatica.com';
                        } else if (type === 'number' || lowerName.includes('num')) {
                            defaultVal = 100;
                        } else if (type === 'boolean' || lowerName.includes('is') || lowerName.includes('has')) {
                            defaultVal = true;
                        }

                        params.push({
                            name,
                            type,
                            optional,
                            defaultTestValue: defaultVal,
                        });
                    }
                }
            }

            const signature = `(${params.map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')})`;

            this.metadata.push({
                filename: file,
                cleanName,
                exportName,
                description,
                signature,
                params,
                filePath,
            });
        }
    }

    public printHeader(): void {
        console.log('\n' + ANSI.format('═══════════════════════════════════════════════════════════════════════════════', 'cyan', 'bold'));
        console.log(ANSI.format(' 📧 REMESAS — INTERFAZ DE TERMINAL PARA TESTING Y CONSULTA DE CORREOS', 'cyan', 'bold'));
        console.log(ANSI.format('═══════════════════════════════════════════════════════════════════════════════', 'cyan', 'bold') + '\n');
    }

    public printHelp(): void {
        this.printHeader();
        console.log(ANSI.format(' 💡 USO DE LA INTERFAZ CLI MEDIANTE FLAGS:\n', 'yellow', 'bold'));

        const commands = [
            ['--list, -l', 'Consulta y lista todos los correos disponibles, con su descripción y firma de argumentos.'],
            ['--info, -i <name>', 'Muestra información detallada de una plantilla en específico y ejemplos de comando.'],
            ['--template, -t <name>', 'Nombre del template a enviar (ej. password-reset).'],
            ['--to, -e <email>', 'Correo destino al que se enviará la prueba (por defecto toma EMAIL_TEST en .env).'],
            ['--args, -a <v1,v2>', 'Argumentos pasados por coma para alimentar la firma de la plantilla.'],
            ['--data, -d <json>', 'Arreglo u objeto JSON en texto con los argumentos (ej. \'["123456", "Juan"]\').'],
            ['--send, -s', 'Ejecuta el envío del correo (implícito si se define --template y/o --to sin -l ni -i).'],
            ['--help, -h', 'Muestra este menú de ayuda.'],
        ];

        for (const [flag, desc] of commands) {
            console.log(`   ${ANSI.format(flag.padEnd(24), 'green', 'bold')} ${desc}`);
        }

        console.log('\n' + ANSI.format(' 📖 EJEMPLOS RÁPIDOS:', 'cyan', 'bold'));
        console.log(`   ${ANSI.format('yarn test:email -l', 'dim')}                                          # Listar correos y sus firmas`);
        console.log(`   ${ANSI.format('yarn test:email -i password-reset', 'dim')}                           # Ver detalles de plantilla`);
        console.log(`   ${ANSI.format('yarn test:email -t password-reset --to juan@gmail.com', 'dim')}       # Envío con defaults automáticos`);
        console.log(`   ${ANSI.format('yarn test:email -t password-reset -a "999999, Carlos Velez"', 'dim')} # Envío con argumentos propios\n`);
    }

    public listTemplates(): void {
        this.printHeader();
        console.log(ANSI.format(` 📦 PLANTILLAS DE CORREO DISPONIBLES EN EL SISTEMA (${this.metadata.length}):\n`, 'yellow', 'bold'));

        if (this.metadata.length === 0) {
            console.log(ANSI.format('   ⚠️ No se encontraron plantillas en ' + this.templatesDir, 'red'));
            return;
        }

        for (const t of this.metadata) {
            console.log(`   🔸 ${ANSI.format(t.cleanName.padEnd(20), 'green', 'bold')} ➔  ${ANSI.format(t.exportName, 'cyan')}`);
            console.log(`      ${ANSI.format('Descripción:', 'dim')} ${t.description}`);
            console.log(`      ${ANSI.format('Firma (Datos):', 'dim')} ${ANSI.format(t.signature, 'yellow')}\n`);
        }
        console.log(ANSI.format(' 💡 Para ver más detalles o probar el envío, usa: yarn test:email -i <nombre_template>\n', 'cyan'));
    }

    public showTemplateInfo(templateName: string): void {
        this.printHeader();
        const t = this.metadata.find((m) => m.cleanName === templateName || m.filename === templateName);

        if (!t) {
            console.error(ANSI.error(` ❌ Error: No se encontró la plantilla "${templateName}".`));
            console.log(ANSI.format(`    Ejecuta 'yarn test:email -l' para ver la lista de plantillas disponibles.\n`, 'dim'));
            return;
        }

        console.log(ANSI.format(` 🔍 INFORMACIÓN DETALLADA: ${t.cleanName.toUpperCase()}\n`, 'yellow', 'bold'));
        console.log(`   • ${ANSI.format('Archivo:', 'bold')}         ${t.filename}`);
        console.log(`   • ${ANSI.format('Exportación:', 'bold')}     ${t.exportName}`);
        console.log(`   • ${ANSI.format('Descripción:', 'bold')}     ${t.description}`);
        console.log(`   • ${ANSI.format('Firma de Parám.:', 'bold')} ${ANSI.format(t.signature, 'cyan')}\n`);

        console.log(ANSI.format(' 📊 ESTRUCTURA DE LA FIRMA (DATOS REQUERIDOS):', 'bold'));
        if (t.params.length === 0) {
            console.log('   (Esta plantilla no requiere ningún argumento)\n');
        } else {
            for (const p of t.params) {
                const reqText = p.optional ? ANSI.format('Opcional', 'dim') : ANSI.format('Requerido', 'red', 'bold');
                console.log(
                    `   - ${ANSI.format(p.name.padEnd(16), 'green')} | Tipo: ${ANSI.format(p.type.padEnd(10), 'yellow')} | Estado: ${reqText.padEnd(18)} | Default Test: "${p.defaultTestValue}"`
                );
            }
            console.log('');
        }

        console.log(ANSI.format(' 🚀 COMANDOS DE PRUEBA:', 'cyan', 'bold'));
        const defaultTo = process.env.EMAIL_TEST || 'test@ejemplo.com';
        const exampleArgs = t.params.map((p) => String(p.defaultTestValue)).join(', ');
        console.log(`   Envío rápido (usa datos default):  ${ANSI.format(`yarn test:email -t ${t.cleanName} --to ${defaultTo}`, 'dim')}`);
        console.log(`   Envío con datos personalizados:   ${ANSI.format(`yarn test:email -t ${t.cleanName} --to ${defaultTo} --args "${exampleArgs}"`, 'dim')}\n`);
    }

    public async sendEmailTest(templateName: string, recipient?: string, rawArgs?: string, rawData?: string): Promise<void> {
        this.printHeader();
        const t = this.metadata.find((m) => m.cleanName === templateName || m.filename === templateName);

        if (!t) {
            console.error(ANSI.error(` ❌ Error: No se encontró la plantilla "${templateName}".`));
            console.log(ANSI.format(`    Ejecuta 'yarn test:email -l' para listar los correos disponibles.\n`, 'dim'));
            return;
        }

        const toEmail = recipient || process.env.EMAIL_TEST;
        if (!toEmail) {
            console.error(ANSI.error(` ❌ Error: No se especificó el correo receptor.`));
            console.error(`    Debes suministrar el flag ${ANSI.format('--to <tucorreo@dom.com>', 'yellow')} o configurar ${ANSI.format('EMAIL_TEST', 'yellow')} en tu archivo .env\n`);
            return;
        }

        console.log(ANSI.format(` 🚀 PREPARANDO ENVÍO DE CORREO DE PRUEBA...`, 'cyan', 'bold'));
        console.log(`   • ${ANSI.format('Plantilla:', 'bold')}   ${t.cleanName} (${t.exportName})`);
        console.log(`   • ${ANSI.format('Destinatario:', 'bold')} ${ANSI.format(toEmail, 'green', 'bold')}`);

        // Construir o procesar los argumentos de la firma
        let execArgs: any[] = [];
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                execArgs = Array.isArray(parsed) ? parsed : Object.values(parsed);
                console.log(`   • ${ANSI.format('Origen Datos:', 'bold')} Flag --data (JSON parseado)`);
            } catch (err) {
                console.error(ANSI.error(` ❌ Error al parsear el JSON pasado en --data. Verifica su sintaxis.`));
                return;
            }
        } else if (rawArgs && rawArgs.trim() !== '') {
            execArgs = rawArgs.split(',').map((item) => {
                const v = item.trim();
                if (v.toLowerCase() === 'true') return true;
                if (v.toLowerCase() === 'false') return false;
                if (!isNaN(Number(v)) && v !== '') return Number(v);
                return v;
            });
            console.log(`   • ${ANSI.format('Origen Datos:', 'bold')} Flag --args (Separados por coma)`);
        } else {
            // Usar defaults inteligentes
            execArgs = t.params.map((p) => p.defaultTestValue);
            console.log(`   • ${ANSI.format('Origen Datos:', 'bold')} ${ANSI.format('Defaults Inteligentes (No se suministraron flags -a o -d)', 'yellow')}`);
        }

        console.log(`   • ${ANSI.format('Argumentos:', 'bold')}   `, execArgs);
        console.log('');

        try {
            // Importación dinámica limpia del template en ESM
            const fileUrl = pathToFileURL(t.filePath).href;
            const importedModule = await import(fileUrl);
            const templateFn = importedModule[t.exportName] || Object.values(importedModule).find((val) => typeof val === 'function');

            if (!templateFn || typeof templateFn !== 'function') {
                console.error(ANSI.error(` ❌ Error: No se pudo obtener la función generadora de HTML en el template ${t.filename}`));
                return;
            }

            const htmlContent = templateFn(...(execArgs as [any]));

            // Inicializar el proveedor SMTP con credenciales del sistema
            const appConfig = AppConfig.load();
            if (!appConfig.emailProvider || !appConfig.emailProvider.user || !appConfig.emailProvider.pass) {
                console.error(ANSI.error(` ❌ Error de Configuración: No hay credenciales válidas en .env (EMAIL_USER / EMAIL_PASSWORD).`));
                return;
            }

            const testAccountId = 'REMESAS_TEST_CLI_MAILER';
            if (!emailProvider.existsHandler(testAccountId)) {
                await emailProvider.addHandler(testAccountId, {
                    user: appConfig.emailProvider.user,
                    pass: appConfig.emailProvider.pass,
                    from: appConfig.emailProvider.user,
                });
            }

            const subject = `[REMESAS Test CLI] Prueba de Plantilla: ${t.cleanName}`;
            console.log(ANSI.format(` ⏳ Conectando al servidor SMTP (${appConfig.emailProvider.user}) y enviando...`, 'dim'));

            await emailProvider.sendMail(testAccountId, {
                to: toEmail,
                subject,
                html: htmlContent,
            });

            console.log('\n' + ANSI.format(' ─────────────────────────────────────────────────────────────────────────────', 'green', 'bold'));
            console.log(ANSI.format(' ✅ ¡PRUEBA EXITOSA! El correo ha sido enviado correctamente al servidor SMTP.', 'green', 'bold'));
            console.log(ANSI.format(`    Revisa la bandeja de entrada o spam de: ${toEmail}`, 'dim'));
            console.log(ANSI.format(' ─────────────────────────────────────────────────────────────────────────────\n', 'green', 'bold'));
        } catch (error: any) {
            console.error('\n' + ANSI.error(' ❌ FALLÓ EL ENVÍO DEL CORREO O LA GENERACIÓN DEL TEMPLATE:'));
            console.error(ANSI.error(`    Detalle: ${error.message || error}`));
            if (error.stack && process.env.DEBUG) console.error(error.stack);
            console.log('');
        }
    }

    /**
     * Punto de entrada principal para parsear flags de terminal y despachar acciones
     */
    public async run(): Promise<void> {
        const args = process.argv.slice(2);
        const opts: Record<string, string | boolean> = {};
        let positional: string[] = [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('-')) {
                const key = arg.replace(/^--?/, '');
                // Verificar si requiere o tiene valor
                if (['t', 'template', 'type', 'i', 'info', 'e', 'to', 'a', 'args', 'd', 'data'].includes(key)) {
                    if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                        opts[key] = args[i + 1];
                        i++;
                    } else {
                        opts[key] = true;
                    }
                } else {
                    opts[key] = true;
                }
            } else {
                positional.push(arg);
            }
        }

        if (opts.h || opts.help || (Object.keys(opts).length === 0 && positional.length === 0)) {
            this.printHelp();
            return;
        }

        if (opts.l || opts.list) {
            this.listTemplates();
            return;
        }

        if (opts.i || opts.info) {
            const target = String(opts.i || opts.info || positional[0]);
            if (!target || target === 'true') {
                console.error(ANSI.error(' ❌ Error: Debes indicar el nombre del template con --info <nombre>'));
                return;
            }
            this.showTemplateInfo(target);
            return;
        }

        // Determinar si se solicita un envío
        const templateName = opts.t || opts.template || opts.type || positional[0];
        if (!templateName || templateName === 'true') {
            console.error(ANSI.error(' ❌ Error: Debes especificar el nombre de la plantilla con --template <nombre>'));
            this.printHelp();
            return;
        }

        const recipient = opts.e || opts.to || (typeof opts.to === 'string' ? opts.to : undefined);
        const rawArgs = opts.a || opts.args;
        const rawData = opts.d || opts.data;

        await this.sendEmailTest(
            String(templateName),
            typeof recipient === 'string' ? recipient : undefined,
            typeof rawArgs === 'string' ? rawArgs : undefined,
            typeof rawData === 'string' ? rawData : undefined
        );
    }
}

const cli = new EmailTestCLI();
cli.run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Unhandled CLI Error:', err);
        process.exit(1);
    });


