import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'remesas_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Conectado a BD');

        await sequelize.query(`
            UPDATE receiving_methods 
            SET fields_config = '` + JSON.stringify([{label: 'Nro. Cuenta', name: 'account-number'}, {label: 'Documento de Identidad', name: 'document-id'}]) + `'
            WHERE type_code = 'TRANSFER';
        `);

        await sequelize.query(`
            UPDATE receiving_methods 
            SET fields_config = '` + JSON.stringify([{label: 'Teléfono', name: 'phone-number'}, {label: 'Documento de Identidad', name: 'document-id'}]) + `'
            WHERE type_code = 'PAGO_MOVIL';
        `);

        await sequelize.query(`
            UPDATE receiving_methods 
            SET fields_config = '` + JSON.stringify([{label: 'Correo Electrónico', name: 'email'}]) + `'
            WHERE type_code = 'ZELLE';
        `);

        await sequelize.query(`
            UPDATE receiving_methods 
            SET fields_config = '` + JSON.stringify([{label: 'Oficina de Retiro', name: 'office-id'}]) + `'
            WHERE type_code = 'CASH';
        `);

        console.log('Métodos actualizados correctamente');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

run();
