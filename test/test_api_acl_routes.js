/**
 * CT Cloud API
 * ======================
 * Components api tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const ENV          = require('./helperCheckEnv')();
const cfg          = require('../config/config.' + ENV);
const test         = require('tape').test;
const testedModule = require('../server');
const request      = require('supertest');
const filename     = cfg.knex.connection.filename;

let helperOnFinsh = require('./helperOnFinish');
let authModule    = require('../helper/generateToken');
let database      = require('../models/database');

test('Setup environment for acl tests', function(assert) {
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

test('Test acl as admin', function(assert) {
  assert.plan(1);
  let token = authModule.generateToken('test@test.com', 'Admin', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(403)
    .send({
      "email": "lambertfelix8@gmail.com",
      "first_name": "felix",
      "last_name": "lambert",
      "password": "testtest",
      "role": "Admin"
    })
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});

test('Test acl as CustomerManager', function(assert) {
  assert.plan(1);
  let token = authModule.generateToken('test@test.com', 'CustomerManager', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(403)
    .send({
      "email": "lambertfelix8@gmail.com",
      "first_name": "felix",
      "last_name": "lambert",
      "password": "testtest",
      "role": "CustomerManager"
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});

test('Join account with CustomerManager acl', function(assert) {
  assert.plan(1);
  let token = authModule.generateToken('test@test.com', 'CustomerManager', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/meters/joinAccount')
    .set('authorization', token)
    .expect(403)
    .send({
      "serial": "123",
      "id": 3
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/meters/joinAccount fails ' + err);
      }
      assert.pass('POST /v1/meters/joinAccount');
    });
});

test('Join account with CustomerManager acl', function(assert) {
  assert.plan(2);
  let token = authModule.generateToken('test@test.com', 'CustomerManager', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/meters/joinAccount')
    .set('authorization', token)
    .expect(403)
    .send({
      "serial": "123",
      "id": 3
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/meters/joinAccount fails ' + err);
      }
      assert.pass('POST /v1/meters/joinAccount');
    });

  request(testedModule.server)
    .patch('/v1/meters/1234')
    .set('authorization', token)
    .type('json')
    .send({"index_ceiling": 21, "offset": 13})
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('PATCH /meters/1234 fails ' + err);
      }
      assert.pass('PATCH /meters/1234');
    });
});

test('Test acl as Reader', function(assert) {
  assert.plan(1);
  let token = authModule.generateToken('test@test.com', 'Reader', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/user')
    .set('authorization', token)
    .expect(403)
    .send({
      "email": "lambertfelix8@gmail.com",
      "first_name": "felix",
      "last_name": "lambert",
      "password": "testtest",
      "role": "Reader"
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/user/ fails ' + err);
      }
      assert.pass('POST /v1/user');
    });
});

test('Join account with Reader acl', function(assert) {
  assert.plan(2);
  let token = authModule.generateToken('test@test.com', 'Reader', cfg.jwt.jwtSecret, false, 2);
  request(testedModule.server)
    .post('/v1/meters/joinAccount')
    .set('authorization', token)
    .expect(403)
    .send({
      "serial": "123",
      "id": 3
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/meters/joinAccount fails ' + err);
      }
      assert.pass('POST /v1/meters/joinAccount');
    });
  request(testedModule.server)
    .patch('/v1/meters/1234')
    .set('authorization', token)
    .type('json')
    .send({"index_ceiling": 24, "offset": 14})
    .expect(403)
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('PATCH /meters/1234 fails ' + err);
      }
      assert.pass('PATCH /meters/1234');
    });
});

test.onFinish(function() {
  helperOnFinsh({database, testedModule, filename});
});