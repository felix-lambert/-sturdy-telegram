'use strict';

module.exports = {
  knex: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'my-secret-pw',
      database: 'ct',
      charset: 'utf8'
    },
    useNullAsDefault: true,
    directory: "models/migrations"
  },
  mqtt: {
    mqttUrl: 'mqtt://192.168.1.49'
  },
  jwt: {
    jwtSecret: "MyS3cr3tK3Y",
    clientServerJwtSecret:"MvRbWuzxWRwTO"
  },
  notification: {
    smsApiUrl: `http://41.138.57.242:8002/sms2/index.php?app=webservices&h=afb86bc14465e51bffcaedf2458368b8&u=citytaps&op=pv&to={{numURI}}&msg={{messageURI}}`
  }
};
