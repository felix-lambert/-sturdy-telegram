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

let helperOnFinsh  = require('./helperOnFinish');
let authModule = require('../helper/generateToken');
let database   = require('../models/database');

test('Setup environment for user tests', function(assert) {
  assert.plan(1);
  let dbModule = require('./prepare_db_for_test');
  dbModule(testedModule.models)
    .then(function() {
      assert.pass('DB setup done');
    })
    .catch(function(err) {
      assert.fail('DB setup error ' + err);
    });
});

test('Create test user', function(assert) {
  assert.plan(1);
  const token = authModule.generateToken('test@test.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(200)
    .send({
      "email": "julien@citytaps.org",
      "first_name": "julien",
      "last_name": "da silva",
      "password": "password",
      "role": "SuperAdmin",
      "language": "en"
    })
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});

test('Create test user without role', function(assert) {
  assert.plan(1);
  let token = authModule.generateToken('test@test.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(200)
    .send({
      "email": "withOutRole@citytaps.org",
      "first_name": "julien",
      "last_name": "da silva",
      "password": "password",
    })
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});


test('Login', function(assert) {
  assert.plan(6);

  request(testedModule.server)
    .post('/login')
    .expect(200)
    .send({
      "email": "julien@citytaps.org",
      "password": "password",
    })
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('POST /login/ with true identifiers fails ' + err);
      }
      assert.equal(res.body.role, 'SuperAdmin', 'The role should be a SuperAdmin');
      assert.equal(res.body.language, 'en', 'The language should be english');
      assert.pass('POST /login with true identifiers');
    });

  request(testedModule.server)
    .post('/login')
    .expect(404)
    .send({
      "email": "FALSE@gmail.com",
      "password": "password",
    })
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('POST /login/ with false identifiers fails ' + err);
      }
      assert.equal(res.body.error, "UserNotFound", 'POST /login/ with false email');
    });

  request(testedModule.server)
    .post('/login')
    .expect(401)
    .send({
      "email": "julien@citytaps.org",
      "password": "falsePassword",
    })
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('POST /login/ with wrong passport fails ' + err);
      }
      assert.equal(res.body.error, "WrongPassword", 'POST /login/ with false password');
    });

  request(testedModule.server)
    .post('/login')
    .expect(401)
    .send({
    "JsonNotValid": "julien@citytaps.org",
    "password": "password",
  })
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.equal(res.body.error, 'InvalidIdentifiers', 'POST /login/ with json not valid');
      }
      
    });

});

test.onFinish(function() {
  helperOnFinsh({database, testedModule, filename});
});
