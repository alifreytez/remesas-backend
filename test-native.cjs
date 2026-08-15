const { Sequelize, DataTypes, Model } = require('sequelize');

const sequelize = new Sequelize('remesas', 'postgres', 'postgres', {
  host: '127.0.0.1',
  port: 5433,
  dialect: 'postgres',
  logging: false
});

class User extends Model {}
User.init({
  passwordHash: {
    type: DataTypes.STRING,
    field: 'password_hash'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: false,
  underscored: true
});

async function test() {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { username: 'R28019240' } });
  
  console.log('--- Model Instance Keys ---');
  console.log(Object.keys(user.dataValues));
  
  console.log('--- JSON Stringify Keys ---');
  console.log(Object.keys(JSON.parse(JSON.stringify(user))));
  
}

test().catch(console.error).finally(() => process.exit(0));
