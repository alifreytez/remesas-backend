const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const Database = require('./src/core/system/database/index.ts').default;

(async () => {
    try {
        await Database.connect();
        const repo = Database.repository('main', 'role-permissions');
        const perms = await repo.getAll({}, { role: 3 });
        console.log('PERMS FOR ROLE 3:', perms);
    } catch (e) {
        console.error(e);
    } process.exit(0);
})();
