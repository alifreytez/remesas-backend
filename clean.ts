import { Database } from './src/database/index.js';

async function run() {
    await Database.connect();
    const repo = Database.repository('main', 'user-roles');
    if (repo && repo._model) {
        await repo._model.destroy({ where: { deletedAt: { [Database.Op.ne]: null } }, force: true });
        console.log('Deleted old user_roles');
    }
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });