import { Database } from './src/database/index.js';
import PermissionsService from './src/shared/services/permissions.service.js';

async function run() {
    await Database.connect();
    try {
        console.log('Testing getSessionPermissions...');
        await PermissionsService.getSessionPermissions(1); // test with user 1
        console.log('Success!');
    } catch(e) {
        console.error('FAILED!');
        console.error(e);
        if (e.cause) {
            console.error('CAUSE:');
            console.error(e.cause);
        }
    }
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });