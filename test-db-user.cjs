const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('remesas', 'postgres', 'postgres', {
  host: '127.0.0.1',
  port: 5433,
  dialect: 'postgres',
  logging: false
});

async function run() {
  const users = await sequelize.query(`SELECT * FROM users WHERE username = 'R28019240'`, { type: Sequelize.QueryTypes.SELECT });
  console.log('User:', users[0]);

  const userType = await sequelize.query(`SELECT * FROM user_types WHERE id = ${users[0].user_type}`, { type: Sequelize.QueryTypes.SELECT });
  console.log('UserType:', userType[0]);
}

run().catch(console.error).finally(() => process.exit(0));
