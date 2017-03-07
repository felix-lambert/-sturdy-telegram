/**
 * CT Cloud API
 * ======================
 * Components api tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const ENV = require('./helperCheckEnv')();
const cfg            = require('../config/config.' + ENV);
const test           = require('tape').test;
const testedModule   = require('../server');
const request        = require('supertest');
const filename       = cfg.knex.connection.filename;

let helperOnFinsh     = require('./helperOnFinish');
let authModule        = require('../helper/generateToken');
let database          = require('../models/database');
let AccountModel      = require('../models/tables/AccountModel');
let AccountEventModel = require('../models/tables/AccountEventModel');

test('Setup environment for user tests', function(assert) {
  assert.plan(1);
  let dbModule = require('./prepare_db_for_test');
  dbModule()
    .then(function() {
      assert.pass('DB setup done');
    })
    .catch(function(err) {
      assert.fail('DB setup error ' + err);
    });
});


test('Create test user', function(assert) {
  assert.plan(1);

  let token = authModule.generateToken('julien@citytaps.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(200)
    .send({
      "email": "julien@citytaps.com",
      "first_name": "julien",
      "last_name": "da silva",
      "password": "bestPasswordInTheWorld",
      "role": "SuperAdmin"
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});


test('AccountModel: createAccount', function(assert) {
  let token = authModule.generateToken('julien@citytaps.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);
  assert.plan(7);
  let accountTestId  = 0;
  const AccountModel = require('../models/tables/AccountModel');
  let testAccount    = {
    "contact_email": "test@test.com",
    "utility_identifier": "01234",
    "first_name": "Anne",
    "last_name": "O'Nyme",
    "address": "Main street",
    "zipcode": "01234",
    "city": "Big City",
    "country_code": "FR",
    "contact_phone_number": "0123456789",
    "activation_date": null,
    "deactivation_date": null,
    "current_credit": 10,
    "cycle_date": 3
  };

  //create account
  AccountModel.create(testAccount)
    .then((account) => {
      accountTestId = account.get('id');
      assert.pass('createAccount with id ' + account.get('id'));
      const timestamp = 12345678;
      //create account event
      AccountEventModel.create(accountTestId, timestamp, 'test', 'test')
        .then(function() {
          assert.pass('test Account created');

          //GET event by array by id
          request(testedModule.server)
            .get('/v1/accounts/' + accountTestId + '/events/50/1')
            .set('authorization', token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, result) {
              assert.equal(result.body[0].account_id, accountTestId, 'GET account event by array by id');
              assert.equal(result.body[0].timestamp, timestamp, 'GET account event by array by id');
              if (err) {
                return assert.fail('GET /v1/accounts/' + accountTestId + '/events/50/1 fails ' + err);
              }
              assert.pass('GET /v1/accounts/' + accountTestId + '/events/50/1');
            });

          request(testedModule.server)
            .get('/v1/accounts/events/50/1')
            .set('authorization', token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, result) {
              if (Object.keys(result.body).length > 0) {
                assert.pass('get accountEvents passed');
              } else {
                assert.fail('get accountEvents failed, return no events');
              }
              if (err) {
                return assert.fail('GET /v1/accounts/events/50/1 fails ' + err);
              }
              assert.pass('GET /v1/accounts/events/50/1');
            });
        })
        .catch(function(err) {
          assert.fail('test Account creation failed ' + err);
        });
    })
    .catch((err) => {
      assert.fail('createAccount failed ' + err);
    })
});

test.onFinish(function() {
  helperOnFinsh({database, testedModule, filename});
});
