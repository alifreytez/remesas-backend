import { Database } from './src/database/index.js';

async function run() {
    await Database.connect();
    const repo = Database.repository('main', 'roles');
    if (repo && repo._model) {
        try {
            await repo._model.sequelize.query('ALTER TABLE roles ADD COLUMN hierarchy INTEGER DEFAULT 100 NOT NULL;');
            console.log('Added hierarchy column to roles table');
        } catch(e) {
            console.log('Column might already exist:', e.message);
        }
    }
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });