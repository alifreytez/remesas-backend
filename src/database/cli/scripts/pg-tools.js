import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const command = process.argv[2];
const args = process.argv.slice(3);

const { DB_POSTGRESQL_MAIN_USERNAME, DB_POSTGRESQL_MAIN_HOST, DB_POSTGRESQL_MAIN_DATABASE, DB_POSTGRESQL_MAIN_PASSWORD, DB_POSTGRESQL_MAIN_PORT } = process.env;

let user = DB_POSTGRESQL_MAIN_USERNAME || 'postgres';
let host = DB_POSTGRESQL_MAIN_HOST || '127.0.0.1';
let db = DB_POSTGRESQL_MAIN_DATABASE || 'REMESAS_dev';
let password = DB_POSTGRESQL_MAIN_PASSWORD || '';
let port = DB_POSTGRESQL_MAIN_PORT || '5432';

let type = 'bin';
let rawFile = '';

let includeTables = [];
let excludeTables = [];
let splitTables = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type' || ((args[i] === '--t' || args[i] === '-t') && ['sql', 'bin'].includes(args[i + 1]))) {
        type = args[i + 1];
        i++;
    } else if (args[i] === '-t' || args[i] === '--table' || args[i] === '-tb') {
        includeTables.push(args[i + 1]);
        i++;
    } else if (args[i] === '-et' || args[i] === '--exclude-table') {
        excludeTables.push(args[i + 1]);
        i++;
    } else if (args[i] === '--split-tables') {
        splitTables = true;
    } else if (args[i] === '--host') {
        host = args[i + 1];
        i++;
    } else if (args[i] === '--port') {
        port = args[i + 1];
        i++;
    } else if (args[i] === '--user') {
        user = args[i + 1];
        i++;
    } else if (args[i] === '--db') {
        db = args[i + 1];
        i++;
    } else if (args[i] === '--password') {
        password = args[i + 1];
        i++;
    } else {
        rawFile = args[i];
    }
}

if (!command || !rawFile) {
    console.error('Uso:');
    console.error('  yarn db:backup <ruta_sin_extension> [opciones]');
    console.error('  yarn db:restore <ruta_sin_extension> [opciones]');
    console.error('  yarn db:export-data --type <sql|bin> <ruta_sin_extension> [opciones]');
    console.error('  yarn db:import-data --type <sql|bin> <ruta_sin_extension> [opciones]');
    console.error('  yarn db:export-schema <ruta_archivo_sql> [opciones]');
    console.error('\nOpciones disponibles:');
    console.error('  --host <host>      Host de la BD (defecto: del .env)');
    console.error('  --port <puerto>    Puerto de la BD (defecto: del .env)');
    console.error('  --user <usuario>   Usuario de la BD (defecto: del .env)');
    console.error('  --db <base_datos>  Nombre de la BD (defecto: del .env)');
    console.error('  --password <clave> Contraseña de la BD (defecto: del .env)');
    console.error('  -t <tabla>         Exportar esta tabla (se puede usar varias veces)');
    console.error('  -et <tabla>        Excluir esta tabla (se puede usar varias veces)');
    console.error('  --split-tables     Exportar un archivo por cada tabla en vez de uno solo');
    process.exit(1);
}

if (password) {
    process.env.PGPASSWORD = password;
}

function getTablesToExport(include, exclude, u, h, p, d) {
    const query = `SELECT schemaname || '.' || tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')`;
    const psqlCmd = `psql -U ${u} -h ${h} -p ${p} -d ${d} -t -c "${query}"`;
    let tables = [];
    try {
        const out = execSync(psqlCmd, { encoding: 'utf8' });
        tables = out
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s);
    } catch (err) {
        console.error('Error obteniendo la lista de tablas. Asegúrate de que la BD esté activa y las credenciales sean correctas.');
        process.exit(1);
    }

    if (include.length > 0) {
        tables = tables.filter((t) => include.includes(t));
    }
    if (exclude.length > 0) {
        tables = tables.filter((t) => !exclude.includes(t));
    }
    return tables;
}

let ext = '';
if (command === 'backup' || command === 'restore') {
    ext = 'dump';
} else if (command === 'export-schema') {
    ext = 'sql';
} else {
    ext = type === 'sql' ? 'sql' : 'dump';
}

let file = rawFile.endsWith(`.${ext}`) ? rawFile : `${rawFile}.${ext}`;

let baseInstruction = '';
let cmdStr = '';

if (command === 'export-data' && splitTables) {
    if (type === 'sql') {
        baseInstruction = `pg_dump -U ${user} -h ${host} -p ${port} -a ${db} -t "..." -f "..."`;
    } else {
        baseInstruction = `pg_dump -U ${user} -h ${host} -p ${port} -Fc -a ${db} -t "..." -f "..."`;
    }
} else {
    switch (command) {
        case 'backup':
            cmdStr = `pg_dump -U ${user} -h ${host} -p ${port} -Fc ${db} -f "${file}"`;
            break;
        case 'restore':
            cmdStr = `pg_restore -U ${user} -h ${host} -p ${port} -d ${db} --no-owner --role=${user} -j 4 -v "${file}"`;
            break;
        case 'export-data':
            let tableFlags = includeTables.map((t) => `-t "${t}"`).join(' ');
            let excludeFlags = excludeTables.map((t) => `-T "${t}"`).join(' ');
            let flags = [tableFlags, excludeFlags].filter(Boolean).join(' ');
            if (flags) flags = ' ' + flags;

            if (type === 'sql') {
                cmdStr = `pg_dump -U ${user} -h ${host} -p ${port} -a ${db}${flags} -f "${file}"`;
            } else {
                cmdStr = `pg_dump -U ${user} -h ${host} -p ${port} -Fc -a ${db}${flags} -f "${file}"`;
            }
            break;
        case 'import-data':
            if (type === 'sql') {
                cmdStr = `psql -U ${user} -h ${host} -p ${port} -d ${db} -f "${file}"`;
            } else {
                cmdStr = `pg_restore -U ${user} -h ${host} -p ${port} -d ${db} --no-owner --role=${user} --disable-triggers -v -a "${file}"`;
            }
            break;
        case 'export-schema':
            cmdStr = `pg_dump -U ${user} -h ${host} -p ${port} -s ${db} > "${file}"`;
            break;
    }
    baseInstruction = cmdStr;
}

console.log('\n=========================================');
console.log('      GESTOR DE BASE DE DATOS REMESAS');
console.log('=========================================');
console.log(`Proceso:        ${command.toUpperCase()}`);
console.log(`Base de datos:  ${db}`);
console.log(`Host / Puerto:  ${host} : ${port}`);
console.log(`Usuario BD:     ${user}`);
console.log(`Archivo/Ruta:   ${rawFile}`);
if (command.includes('data') || command === 'export-schema') {
    console.log(`Formato:        ${type === 'sql' || command === 'export-schema' ? 'SQL Plano (.sql)' : 'Binario Custom (.dump)'}`);
}
if (includeTables.length > 0) console.log(`Tablas a incluir: ${includeTables.join(', ')}`);
if (excludeTables.length > 0) console.log(`Tablas a excluir: ${excludeTables.join(', ')}`);
if (splitTables) console.log(`Split Tables:   ACTIVADO (un archivo por tabla)`);
console.log(`Instruccion:    ${baseInstruction}`);
console.log('-----------------------------------------\n');

if (command === 'export-data' && splitTables) {
    if (!fs.existsSync(rawFile) || !fs.statSync(rawFile).isDirectory()) {
        console.error(`Error: Al usar --split-tables, la ruta proporcionada ("${rawFile}") debe ser una carpeta existente.`);
        process.exit(1);
    }
    const tables = getTablesToExport(includeTables, excludeTables, user, host, port, db);
    console.log(`Exportando ${tables.length} tablas por separado...`);
    for (const t of tables) {
        const tFile = path.join(rawFile, `${t}.${ext}`);
        let tCmd = '';
        if (type === 'sql') {
            tCmd = `pg_dump -U ${user} -h ${host} -p ${port} -a ${db} -t "${t}" -f "${tFile}"`;
        } else {
            tCmd = `pg_dump -U ${user} -h ${host} -p ${port} -Fc -a ${db} -t "${t}" -f "${tFile}"`;
        }

        try {
            execSync(tCmd, { stdio: 'inherit' });
        } catch (err) {
            console.error(`Error exportando tabla ${t}`);
        }
    }
    console.log('\n¡Exportación múltiple completada con éxito!');
    process.exit(0);
} else {
    try {
        execSync(cmdStr, { stdio: 'inherit' });
        console.log('\n¡Completado con éxito!');
    } catch (err) {
        if (command === 'import-data' && type !== 'sql') {
            console.warn('\nAdvertencia: pg_restore finalizó con código no nulo (típicamente warnings). Ignorando...');
        } else {
            console.error('Error ejecutando el comando.');
            process.exit(1);
        }
    }
}


