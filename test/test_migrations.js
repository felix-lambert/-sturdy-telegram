/**
 * CT Cloud API
 * ======================
 * Components migration tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

// init global.config
const config = require('./config.js');

const ENV = require('./helperCheckEnv')();
const cfg            = require('../config/config.' + ENV);
const test           = require('tape').test;
const filename       = cfg.knex.connection.filename;
let helperOnFinsh  = require('./helperOnFinish');

let database   = require('../models/database');

const testConfig = {
  knex: {
    client: 'sqlite3',
    connection: {
      filename: filename
    },
    useNullAsDefault: true
  },
  mqtt: {
    mqttUrl: 'mqtt://test.mosquitto.org'
  },
  loggerName: 'test_logs'
};

// List of models to check
const listOfTables = [
  'account',
  'meter',
  'message_from_meter',
  'account_transaction',
  'message_to_meter',
  'country',
  'utility',
  'user',
  'meter_index_history'
];

const listOfModels = [
  'Account',
  'MessageFromMeter',
  'Meter',
  'AccountTransaction',
  'MessageToMeter',
  'Country',
  'Utility',
  'User',
  'MeterIndexHistory'
];

test('Setup environment', function(assert) {
  assert.plan(1);

  database.migrate
    .then(() => {
      assert.pass('DB created');
    })
    .catch(() => {
      assert.fail('DB creation failed');
    });
});

// -----------------
// Private functions
function doesTableExist(table, assert) {
  // Check if table exists by trying to count its lines
  database.bookshelf.knex(table).count('* as id')
    .then((count) => {
      assert.equal(typeof(count[0].id), 'number', table + ' table should exists');
    })
    .catch(() => {
      assert.fail(table + ' table should exists');
    });
}

test('Check tables in DB', function(assert) {
  assert.plan(1 + listOfTables.length);

  assert.equal(typeof(database.bookshelf), 'object', 'module.Bookshelf should be an object');

  listOfTables.forEach((table) => {
    doesTableExist(table, assert);
  });
});


test.onFinish(function() {
  helperOnFinsh({database, filename});
});