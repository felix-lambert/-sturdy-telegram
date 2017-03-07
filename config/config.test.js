'use strict';

module.exports = global.config = {
  knex: {
    client: 'sqlite3',
    connection: {
      filename: "test.sqlite3"
    },
    useNullAsDefault: true,
    directory: "models/migrations"
  },
  mqtt: {
    mqttUrl: 'mqtt://test.mosquitto.org'
  },
  jwt: {
    jwtSecret: "MyS3cr3tK3Y",
    clientServerJwtSecret: "MvRbWuzxWRwTO"
  },
  notification: {
    smsApiUrl: `http://41.138.57.242:8002/sms2/index.php?app=webservices&h=afb86bc14465e51bffcaedf2458368b8&u=citytaps&op=pv&to={{numURI}}&msg={{messageURI}}`
  }
};
