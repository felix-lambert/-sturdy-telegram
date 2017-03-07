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
let MeterModel    = require('../models/tables/MeterModel');
let database      = require('../models/database');

test('Setup environment for meter tests', function(assert) {
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

test('Create test meter', function(assert) {
  assert.plan(1);
  MeterModel.create({
    "serial": "123",
    "radio_identifier": "00-80-00-00-00-00-a5-d1",
    "firmware": "2.0.0",
    "offset": 1
  })
    .then(function() {
      assert.pass('test account created');
    })
    .catch(function(err) {
      return assert.fail('test account creation failed ' + err);
    });
});

let token = authModule.generateToken('test@test.com', 'MQTT_listener', cfg.jwt.jwtSecret);

let message = {
  "chan": 2,
  "cls": 0,
  "codr": '4/5',
  "data": 'HwAGqMgPQkABLA==',
  "datr": 'SF7BW125',
  "freq": '868.5',
  "lsnr": '7.2',
  "mhdr": '4002000006002400',
  "modu": 'LORA',
  "opts": '',
  "port": 1,
  "rfch": 0,
  "rssi": -41,
  "seqn": 36,
  "size": 16,
  "topic": "lora/00-80-00-00-00-00-a5-d1/up",
  "timestamp": '2016-10-07T14:05:41.141204Z',
  "tmst": 368037195
};

test('Check messageFromMeter routes', function(assert) {
  assert.plan(3);
  request(testedModule.server)
    .get('/v1/messageFromMeter')
    .expect(403)
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail('GET /v1/messageFromMeter/ without token fails ' + err);
      }
      assert.pass('GET /v1/messageFromMeter/ without token');
    });

  request(testedModule.server)
    .post('/v1/messageFromMeter')
    .set('authorization', token)
    .expect(500)
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.pass('POST /v1/messageFromMeter/ without content');
      }
      assert.fail('POST /v1/messageFromMeter/ without content should return error 500');
    });

  request(testedModule.server)
    .post('/v1/messageFromMeter')
    .set('authorization', token)
    .send({message : message})
    .expect(200)
    .end(function(err) {
      if (err) {
        return assert.fail('POST /v1/messageFromMeter/ fails ' + err);
      }
      assert.pass('POST /v1/messageFromMeter/');
    });
});


test.onFinish(function() {
  helperOnFinsh({database, testedModule, filename});
});
