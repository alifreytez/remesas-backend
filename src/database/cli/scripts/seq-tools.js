import { execSync } from 'child_process';
import 'dotenv/config';

const args = process.argv.slice(2);
const commandArgs = args.join(' ');

const { DB_POSTGRESQL_MAIN_USERNAME, DB_POSTGRESQL_MAIN_HOST, DB_POSTGRESQL_MAIN_DATABASE, DB_POSTGRESQL_MAIN_PORT } = process.env;

let user = DB_POSTGRESQL_MAIN_USERNAME || 'postgres';
let host = DB_POSTGRESQL_MAIN_HOST || '127.0.0.1';
let db = DB_POSTGRESQL_MAIN_DATABASE || 'REMESAS_dev';
let port = DB_POSTGRESQL_MAIN_PORT || '5432';

let sequelizeArgs = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host') {
        host = args[i + 1];
        process.env.DB_POSTGRESQL_MAIN_HOST = host;
        i++;
    } else if (args[i] === '--port') {
        port = args[i + 1];
        process.env.DB_POSTGRESQL_MAIN_PORT = port;
        i++;
    } else if (args[i] === '--user') {
        user = args[i + 1];
        process.env.DB_POSTGRESQL_MAIN_USERNAME = user;
        i++;
    } else if (args[i] === '--db') {
        db = args[i + 1];
        process.env.DB_POSTGRESQL_MAIN_DATABASE = db;
        i++;
    } else if (args[i] === '--password') {
        process.env.DB_POSTGRESQL_MAIN_PASSWORD = args[i + 1];
        i++;
    } else {
        sequelizeArgs.push(args[i]);
    }
}

const commandArgsStr = sequelizeArgs.join(' ');
let cmdName = sequelizeArgs[0];
let readableName = '';
switch (cmdName) {
    case 'db:create':
        readableName = 'CREAR BASE DE DATOS';
        break;
    case 'db:drop':
        readableName = 'ELIMINAR BASE DE DATOS';
        break;
    case 'db:migrate':
        readableName = 'EJECUTAR MIGRACIONES';
        break;
    case 'db:seed:all':
        readableName = 'EJECUTAR TODOS LOS SEEDERS';
        break;
    case 'db:seed':
        readableName = 'EJECUTAR SEEDER ESPECÍFICO';
        break;
    default:
        readableName = (cmdName || '').toUpperCase();
        break;
}

console.log('\n=========================================');
console.log('      GESTOR DE BASE DE DATOS REMESAS');
console.log('=========================================');
console.log(`Proceso:        ${readableName}`);
console.log(`Base de datos:  ${db}`);
console.log(`Host / Puerto:  ${host} : ${port}`);
console.log(`Usuario BD:     ${user}`);
console.log(`Instruccion:    sequelize ${commandArgsStr}`);
console.log('-----------------------------------------\n');

try {
    execSync(`sequelize ${commandArgsStr}`, { stdio: 'inherit' });
    console.log('\n¡Completado con éxito!');
} catch (err) {
    console.error('Error ejecutando el comando de Sequelize.');
    process.exit(1);
}


