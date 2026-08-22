const { Database } = require('./build/database/index.js');
const { BcryptUtil } = require('./build/utils/bcrypt.util.js');

async function run() {
  const db = Database.getDefaultConnector();
  await db.authenticate();
  
  const Users = Database.repository('main', 'users');
  const foundUser = await Users.getOne({ username: 'R28019240' });
  
  console.log('User properties:', Object.keys(foundUser.toJSON ? foundUser.toJSON() : foundUser));
  console.log('passwordHash value:', foundUser.passwordHash);
  console.log('password_hash value:', foundUser.password_hash);
  
  if (foundUser.passwordHash) {
     const match = await BcryptUtil.compare('28019240', foundUser.passwordHash);
     console.log('Compare passwordHash:', match);
  } else {
     console.log('NO passwordHash on foundUser!');
  }
}

run().catch(console.error).finally(() => process.exit(0));
