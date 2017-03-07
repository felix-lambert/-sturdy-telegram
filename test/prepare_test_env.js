/**
 * CT Cloud API
 * ======================
 * Components env
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const test           = require('tape');
const loadConfig     = require('../config/configLoader');
let helperOnFinsh    = require('./helperOnFinish');
const cfg            = require('../config/config.' + require('./helperCheckEnv')());
const filename       = cfg.knex.connection.filename;

module.exports = function prepare_env() {

  return new Promise((resolve, reject) => {
    loadConfig().then(function(config) {
      /*  with the advent of ES6 (ES2015), it is actually
       *  possible to use a global variable
       */

      if (!global.config) {
        global.config = config;
      }

      let Bookshelf               = require('../models/database').bookshelf;
      let migrate                 = require('../models/database').migrate;
      // require models
      let UserModel               = require('../models/tables/UserModel');
      let AccountModel            = require('../models/tables/AccountModel');
      let AccountPhoneNumberModel = require('../models/tables/AccountPhoneNumberModel');
      let MeterModel              = require('../models/tables/MeterModel');
      let MessageFromMeterModel   = require('../models/tables/MessageFromMeterModel');

      // Inserts seed entries one by one in series
      migrate
        .then(() => {
          return Bookshelf.knex('account_phone_number').del();
        })
        .then(() => {
          return Bookshelf.knex('country').del();
        })
        .then(() => {
          return Bookshelf.knex('account_consumption_history').del();
        })
        .then(() => {
          return Bookshelf.knex('account_event').del();
        })
        .then(() => {
          return Bookshelf.knex('account_transaction').del();
        })
        .then(() => {
          return Bookshelf.knex('message_from_meter').del();
        })
        .then(() => {
          return Bookshelf.knex('message_to_meter').del();
        })
        .then(() => {
          return Bookshelf.knex('meter_index_ceiling_history').del();
        })
        .then(() => {
          return Bookshelf.knex('meter_index_history').del();
        })
        .then(() => {
          return Bookshelf.knex('meter_temperature_history').del();
        })
        .then(() => {
          return Bookshelf.knex('sms_incoming').del();
        })
        .then(() => {
          return Bookshelf.knex('sms_outgoing').del();
        })
        .then(() => {
          return Bookshelf.knex('utility').del();
        })
        .then(() => {
          return Bookshelf.knex('valve_status_history').del();
        })
        .then(() => {
          return Bookshelf.knex('account').del();
        })
        .then(() => {
          return Bookshelf.knex('meter').del();
        })
        .then(() => {
          return Bookshelf.knex('user').del();
        })
        .then(() => {
          return AccountModel.forge().save({
            "id": 1,
            "contact_email": "test@test.com",
            "utility_identifier": "01234",
            "first_name": "John",
            "last_name": "Doe",
            "address": "Main street",
            "zipcode": "01234",
            "city": "Big City",
            "country_code": "FR",
            "current_credit": 10,
            "cycle_date": 3,
            "payment_enabled": 1,
            "contact_phone_number": "90909090",
            "warning_message_sent": "0",
            "cycle_cumulated_consumption": 200,
            "cycle_paid_subscription": 180
          });
        })
        // .then(() => {
        //   return AccountModel.forge().save({ "id": 2, "current_credit": 1000.00 });
        // })
        .then(() => {
          return AccountPhoneNumberModel.forge().save({"account_id": 1, "phone_number": "92705060"});
        })
        .then(() => {
          return MeterModel.forge().save({
            "id": 1,
            "serial": "1234",
            "radio_identifier": "1234abcd",
            "account_id": 1,
            "index_ceiling": 5,
            "firmware": "2.0.1",
            "last_index": 27200,
          });
        })
        .then(() => {
          return MessageFromMeterModel.forge().save({
            "radio_identifier": "1234abcd",
            "message": "test"
          });
        })
        .then(() => {
          return UserModel.forge().save({
            "id": 1,
            "email": "anne@test.fr",
            "first_name": "Anne",
            "last_name": "O'Nyme",
            "password_hash": "secret",
            "role": "SuperAdmin"
          });
        })
        .then(() => {
          resolve('Data inserted in tables');
        })
        .catch((err) => {
          reject('DB setup failure ' + err);
        });

      test.onFinish(function() {
        let database = require('../models/database');
        helperOnFinsh({database, filename});
      });
    });
  });
};

