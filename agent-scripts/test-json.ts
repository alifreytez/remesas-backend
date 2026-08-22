import { AppConfig } from '@config/app.config.js';
import * as Initializer from '@utils/initializers.util.js';
import { Database } from '@database/index.js';

async function run() {
  AppConfig.load();
  await Initializer.initDatabaseConnections();
  await Initializer.initDatabaseModels();
  
  const Users = Database.repository('main', 'users');
  const result = await Users.getModel().findOne({ where: { username: 'R28019240' } });
  
  console.log('--- RAW SEQUELIZE INSTANCE ---');
  console.log('passwordHash in instance:', result?.passwordHash);
  console.log('password_hash in instance:', result?.password_hash);
  console.log('dataValues keys:', Object.keys(result?.dataValues || {}));
  
  console.log('--- AFTER toJSON() ---');
  const json = result?.toJSON();
  console.log('toJSON keys:', Object.keys(json || {}));
  
  console.log('--- AFTER JSON.stringify() ---');
  const parsed = JSON.parse(JSON.stringify(result));
  console.log('parsed keys:', Object.keys(parsed || {}));
  
}

run().catch(console.error).finally(() => process.exit(0));
