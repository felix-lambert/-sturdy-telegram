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

let helperOnFinsh = require('./helperOnFinish');
let authModule    = require('../helper/generateToken');
let database      = require('../models/database');
let AccountModel  = require('../models/tables/AccountModel');


test('Setup environment for user tests', function(assert) {
  assert.plan(1);
  let dbModule = require('./prepare_db_for_test');
  dbModule()
    .then(() => {
      assert.pass('DB setup done');
    })
    .catch((err) => {
      assert.fail('DB setup error ' + err);
    });
});


test('Create test user', function(assert) {
  assert.plan(1);

  let token = authModule.generateToken('test@test.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(200)
    .send({
      "email": "lambertfelix8@gmail.com",
      "first_name": "felix",
      "last_name": "lambert",
      "password": "testtest",
      "role": "SuperAdmin"
    })
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});


test('Create test account', function(assert) {
  assert.plan(1);
  AccountModel.create({
    "contact_email": "testSms@test.com",
    "first_name": "test",
    "last_name": "test",
    "contact_phone_number": "92763198"
  })
    .then(() => {
      assert.pass('test Account created');
    })
    .catch((err) => {
      assert.fail('test Account creation failed ' + err);
    });
});

test.onFinish(() => {
  helperOnFinsh({database, testedModule, filename});
});
