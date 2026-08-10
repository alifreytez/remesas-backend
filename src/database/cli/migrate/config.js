import 'dotenv/config';

const { DB_POSTGRESQL_MAIN_USERNAME, DB_POSTGRESQL_MAIN_PASSWORD, DB_POSTGRESQL_MAIN_DATABASE, DB_POSTGRESQL_MAIN_HOST, DB_POSTGRESQL_MAIN_PORT } = process.env;

export default {
    development: {
        username: DB_POSTGRESQL_MAIN_USERNAME || 'postgres',
        password: DB_POSTGRESQL_MAIN_PASSWORD || '123456789',
        database: DB_POSTGRESQL_MAIN_DATABASE || 'REMESAS_dev',
        host: DB_POSTGRESQL_MAIN_HOST || '127.0.0.1',
        port: DB_POSTGRESQL_MAIN_PORT || 5432,
        dialect: 'postgres',
    },
    test: {
        username: DB_POSTGRESQL_MAIN_USERNAME || 'postgres',
        password: DB_POSTGRESQL_MAIN_PASSWORD || '123456789',
        database: process.env.DB_NAME_TEST || 'REMESAS_test',
        host: DB_POSTGRESQL_MAIN_HOST || '127.0.0.1',
        port: DB_POSTGRESQL_MAIN_PORT || 5432,
        dialect: 'postgres',
    },
    production: {
        username: DB_POSTGRESQL_MAIN_USERNAME,
        password: DB_POSTGRESQL_MAIN_PASSWORD,
        database: DB_POSTGRESQL_MAIN_DATABASE,
        host: DB_POSTGRESQL_MAIN_HOST,
        port: DB_POSTGRESQL_MAIN_PORT,
        dialect: 'postgres',
    },
};

