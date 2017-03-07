/**
 * CT Cloud Common Models
 * ======================
 * Models unit tests
 *
 * Authors: Thomas Lim
 * Copyright: Citytaps 2016
 *
 */


'use strict';

// require('make-runnable');

const config = {
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
    directory: "migrations"
  },
  mqtt: {
    mqttUrl: 'mqtt://192.168.1.49'
  }
};

const meterModels = require('../index')(config);

meterModels.Meter.getWakeupFrequency(1234);