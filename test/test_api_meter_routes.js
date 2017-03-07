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

let helperOnFinsh  = require('./helperOnFinish');
let authModule     = require('../helper/generateToken');
let MeterModel     = require('../models/tables/MeterModel');
let database       = require('../models/database');

test('Setup environment for meter tests', function(assert) {
  assert.plan(1);
  let dbModule = require('./prepare_db_for_test');
  dbModule(testedModule.models)
    .then(() => {
      assert.pass('DB setup done');
    })
    .catch((err) => {
      assert.fail('DB setup error ' + err);
    });
});

test('Create test meter', function(assert) {
  /* 
    Plan lets you specify how many assertions you expect your test to execute. 
    This comes in handy sometimes, and can double as an extra assertion where you verify that 
    all the other assertions are executed. Note that the test will fail if the count is 
    off even by one, meaning that most of the time going for simply t.end will save you 
    the hassle of updating t.plan statements with the correct assertion count. 
    That being said, t.plan is a useful “guard clause” when you’re unsure whether a 
    callback (presumably containing much needed assertions) will run or not.
   */
  assert.plan(2);
  MeterModel.create({
    "serial": "123",
    "radio_identifier": "00-80-00-00-00-00-a5-d1",
    "firmware": "2.0.0",
    "offset": 1
  }).then((res) => {
      assert.equal(res.attributes.serial, '123', 'MeterModel.create: The meter has been created with a serial number of 123');
      assert.pass('test account created');
    })
    .catch((err) => {
      return assert.fail('test account creation failed ' + err);
    });
});

let token = authModule.generateToken('test@test.com', 'SuperAdmin', cfg.jwt.jwtSecret);

test('Check meters/ routes', function(assert) {
  assert.plan(48);

  request(testedModule.server)
    .get('/v1/meters')
    .expect(403)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('GET /v1/meters/ without token fails ' + err);
      }
      // Maybe the answer should be noToken and not invalidToken
      assert.equal(res.body.message, 'invalidToken', 'GET /v1/meters/: Tried to get meter but with no token');
      assert.pass('GET /v1/meters/ without token');
    });

  request(testedModule.server)
    .get('/v1/meters')
    .set('authorization', token)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('GET /v1/meters/ fails ' + err);
      }
      assert.equal(res.body[0].serial, '1234', 'GET /v1/meters: Get meter with good token returns the first json in array with serial of 1234');
      assert.pass('GET /v1/meters/ with token');
    });

  request(testedModule.server)
    .get('/v1/meters/1234')
    .set('authorization', token)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((error, res) => {
      if (error) {
        return assert.fail('GET /v1/meters/1234 fails ' + error);
      }
      assert.equal(res.body.serial, '1234', 'GET /v1/meters/1234: Get meter with good token returns the first json in array with serial of 1234');
      if (res.body.serial === '1234') {
        assert.pass('GET /v1/meters/1234 with token');
      } else {
        return assert.fail('GET /v1/meters/1234 fails ' + error);
      }
    });

  request(testedModule.server)
    .get('/v1/meters/123dssdds4')
    .set('authorization', token)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((error, res) => {
      if (error) {
        return assert.pass('GET /v1/meters/123dssdds4 fails ' + error);
      }
      assert.equal(res.body.error, 'ServerError', 'GET /v1/meters/123dssdds4: Needs to return a server error because the serial id is wrong');
      if (res.body.error === 'ServerError') {
        assert.pass('GET /v1/meters/123dssdds4' + res.body.error);
      } else {
        return assert.fail('GET /v1/meters/123dssdds4 fails ' + error);
      }
    });

  request(testedModule.server)
    .patch('/v1/meters/1234')
    .set('authorization', token)
    .type('json')
    .send({"index_ceiling": 20, "offset": 125})
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('PATCH /meters/1234 fails ' + err);
      }
      assert.equal(res.body.index_ceiling, 20, '/v1/meters/1234: Patch meter with good token and serial id of 1234 test if index_ceiling has been updated');
      assert.pass('PATCH /v1/meters/1234');
    });

  request(testedModule.server)
    .patch('/v1/meters/12dezzedze34')
    .set('authorization', token)
    .type('json')
    .send({"index_ceiling": 20, "offset": 125})
    .expect(200)
    .expect('Content-Type', /json/)
    .end((error, res) => {
      if (error) {
        return assert.pass('GET /v1/meters/1234 fails ' + error);
      }
      assert.equal(res.body.error, 'ServerError', 'PATCH /v1/meters/12dezzedze34: Needs to return a server error because the serial id is wrong');
      if (res.body.error === 'ServerError') {
        assert.pass('GET /v1/meters/123dssdds4 fails ' + res.body.error);
      } else {
        return assert.fail('GET /v1/meters/123dssdds4 informations');
      }
    });

  request(testedModule.server)
    .post('/v1/meters/joinAccount')
    .set('authorization', token)
    .expect(200)
    .send({
      "serial": "123",
      "id": 2
    })
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('POST /v1/meters/joinAccount fails ' + err);
      }
      assert.equal(res.body.message, 'success', 'POST /v1/meters/joinAccount: Join account 2 to meter 123');
      assert.pass('POST /v1/meters/joinAccount');
    });

  request(testedModule.server)
    .post('/v1/meters/joinAccount')
    .set('authorization', token)
    .expect(500)
    .send({
      "serial": "12sqsq3",
      "id": 2545
    })
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('POST /v1/meters/joinAccount fails ' + err);
      }
      assert.equal(res.body.error, 'ServerError', 'POST /v1/meters/joinAccount: Needs to return a server error because the serial id is wrong');
      assert.pass('POST /v1/meters/joinAccount');
    });

  request(testedModule.server)
    .get('/v1/meters/1234/messages/')
    .set('authorization', token)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) {
        return assert.fail('GET /v1/meters/1234/messages fails ' + err);
      }
      assert.equal(res.body[0].message, 'test', 'GET /v1/meters/1234/messages/: Get messages of meter 1234');
      assert.pass('GET /v1/meters/1234/messages');
    });

  request(testedModule.server)
    .get('/v1/meters/12dsdsdsd34/messages/')
    .set('authorization', token)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((error, res) => {
      if (error) {
        return assert.pass('GET /v1/meters/12dsdsdsd34/messages/ fails ' + error);
      }
      assert.equal(res.body.error, 'ServerError', 'GET /v1/meters/12dsdsdsd34/messages/: Needs to return a server error because the serial id is wrong');
      if (res.body.error === 'ServerError') {
        assert.pass('GET /v1/meters/12dsdsdsd34/messages/' + res.body.error);
      } else {
        return assert.fail('GET /v1/meters/12dsdsdsd34/messages/ informations fails ' + error);
      }
    });

  request(testedModule.server)
    .post('/v1/meters')
    .set('authorization', token)
    .expect(200)
    .expect('Content-Type', /json/)
    .send({
      serial: 15,
      radio_identifier: 'dezfrefre-1545-785212',
      offset: 12,
      firmware: '2.1.0',
      account_id: 1
    })
    .end((error, res) => {
      if (error) {
        return assert.fail('POST /v1/meters/ fails ' + error);
      }
      assert.equal(res.body.serial, 15, 'POST /v1/meters: Save meter with serial id 15');
      if (res.body.error === 'ServerError') {
        assert.fail('POST /v1/meters/ fails ' + res.body.error);
      } else {
        return assert.pass('POST /v1/meters/');
      }
    });

  request(testedModule.server)
    .delete('/v1/meters/1')
    .set('authorization', token)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((error, res) => {
      if (error) {
        return assert.fail('DELETE /v1/meters/ fails ' + error);
      }
      if (res.body.error === 'ServerError') {
        assert.fail('DELETE /v1/meters/ fails ' + res.body.error);
      } else {
        assert.equal(res.body.serial, '1', 'DELETE /v1/meters/1: Delete meter with serial id 1');
        return assert.pass('DELETE /v1/meters/');
      }
    });

    request(testedModule.server)
      .post('/v1/meters/1/sendMessageToMeter/')
      .set('authorization', token)
      .expect(400)
      .expect('Content-Type', /json/)
      .send({
        serial: 15,
        radio_identifier: 'dezfrefre-1545-785212',
        offset: 12,
        firmware: '2.1.0',
        account_id: 1
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1/sendMessageToMeter/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          // The error name is wrong. It should maybe be 'idSerialDoesNotExist'
          assert.equal(res.body.error, 'unknownTypeOfMessage', 'POST /v1/meters/1/sendMessageToMeter/: Create message with serial that does not exist');
          return assert.pass('POST /v1/meters/1/sendMessageToMeter/ ');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1234/sendMessageToMeter/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'updateIndexCeiling',
        'payload': 10
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          assert.equal(res.body.message, 'success', 'POST /v1/meters/1234/sendMessageToMeter/: Send message to meter success on test');
          return assert.pass('POST /v1/meters/1234/sendMessageToMeter/');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1/sendMessageToMeter/')
      .set('authorization', token)
      .expect(500)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'updateIndexCeiling',
        'payload': 10
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1/sendMessageToMeter/ fails ' + error);
        }
        assert.equal(res.body.error, 'ServerError', 'POST /v1/meters/1/sendMessageToMeter/: Needs to return a server error because the serial id is wrong');
        if (res.body.error === 'ServerError') {
          assert.pass('POST /v1/meters/1/sendMessageToMeter/' + res.body.error);
        } else {
          return assert.fail('POST /v1/meters/1/sendMessageToMeter/ informations fails ');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1234/sendMessageToMeter/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'sendOpenValveMessage',
        'payload': 10
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          assert.equal(res.body.message, 'success', 'POST /v1/meters/1234/sendMessageToMeter/: Send message to meter success on test');
          return assert.pass('POST /v1/meters/1234/sendMessageToMeter/');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1234/sendMessageToMeter/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'sendCloseValveMessage',
        'payload': 10
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          assert.equal(res.body.message, 'success', 'POST /v1/meters/1234/sendMessageToMeter/: Send message to meter success on test');
          return assert.pass('POST /v1/meters/1234/sendMessageToMeter/');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1234/sendMessageToMeter/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'setWakeupFrequency',
        'payload': 10
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          assert.equal(res.body.message, 'success', 'POST /v1/meters/1234/sendMessageToMeter/: Send message to meter success on test');
          return assert.pass('POST /v1/meters/1234/sendMessageToMeter/ informations fails ');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1234/sendMessageToMeter/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'clearQueue',
        'payload': 10
      })
      .end((error, res) => {
        if (error) {
          return assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          assert.equal(res.body.message, 'success', 'POST /v1/meters/1234/sendMessageToMeter/: Send message to meter success on test');
          return assert.pass('POST /v1/meters/1234/sendMessageToMeter/ informations fails ');
        }
    });

    request(testedModule.server)
      .post('/v1/meters/1234/sendMessageToMeter/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .send({
        'typeOfMessage': 'clfrefrerfer',
        'payload': 10
      })
      .end((error, res) => {
        assert.equal(res.body.error, 'unknownTypeOfMessage', 'POST /v1/meters/1234/sendMessageToMeter/: Create message with message that does not exist');
        if (error) {
          return assert.pass('POST /v1/meters/1234/sendMessageToMeter/' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('POST /v1/meters/1234/sendMessageToMeter/ fails ' + res.body.error);
        } else {
          return assert.fail('POST /v1/meters/1234/sendMessageToMeter/ informations fails ');
        }
    });

    request(testedModule.server)
      .get('/v1/meters/1234/indexHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, res) => {
        if (error) {
          return assert.fail('GET /v1/meters/1234/indexHistory/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('GET /v1/meters/1234/indexHistory/ fails ' + res.body.error);
        } else {
          return assert.pass('GET /v1/meters/1234/indexHistory/ informations pass');
        }
    });

    request(testedModule.server)
      .get('/v1/meters/1/indexHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error) => {
        if (error) {
          return assert.fail('GET /v1/meters/1/indexHistory/ fails ' + error);
        }
        return assert.pass('GET /v1/meters/1/indexHistory/ informations pass');
    });

    request(testedModule.server)
      .get('/v1/meters/1234/temperatureHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, res) => {
        if (error) {
          return assert.fail('GET /v1/meters/1234/temperatureHistory/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('GET /v1/meters/1234/temperatureHistory/ fails ' + res.body.error);
        } else {
          return assert.pass('GET /v1/meters/1234/temperatureHistory/ informations pass');
        }
    });

    request(testedModule.server)
      .get('/v1/meters/1/temperatureHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error) => {
        if (error) {
          return assert.fail('GET /v1/meters/1/temperatureHistory/ fails ' + error);
        }
        return assert.pass('GET /v1/meters/1/temperatureHistory/ informations pass');
    });

    request(testedModule.server)
      .get('/v1/meters/1234/indexCeilingHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, res) => {
        if (error) {
          return assert.fail('GET /v1/meters/1234/indexCeilingHistory/ fails ' + error);
        }
        if (res.body.error === 'ServerError') {
          assert.fail('GET /v1/meters/1234/indexCeilingHistory/ fails ' + res.body.error);
        } else {
          return assert.pass('GET /v1/meters/1234/indexCeilingHistory/ informations pass');
        }
    });

    request(testedModule.server)
      .get('/v1/meters/1/indexCeilingHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error) => {
        if (error) {
          return assert.fail('GET /v1/meters/1/indexCeilingHistory/ fails ' + error);
        }
        return assert.pass('GET /v1/meters/1/indexCeilingHistory/ informations pass');
    });

    request(testedModule.server)
      .get('/v1/meters/1/indexCeilingHistory/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error) => {
        if (error) {
          return assert.fail('GET /v1/meters/1/indexCeilingHistory/ fails ' + error);
        }
        return assert.pass('GET /v1/meters/1/indexCeilingHistory/ informations pass');
    });

    request(testedModule.server)
      .get('/v1/meters/1234/sentmessages/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error, res) => {
        if (error) {
          return assert.fail('GET /v1/meters/1234/sentmessages/ fails ' + error);
        }
        assert.equal(res.body[0].meter_id, 1, 'GET /v1/meters/1234/sentmessages/: GET messages and check if it\'s the good meter id');
        return assert.pass('GET /v1/meters/1234/sentmessages/ informations pass');
    });

    request(testedModule.server)
      .get('/v1/meters/1234ferfefrerf/sentmessages/')
      .set('authorization', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((error) => {
        if (error) {
          // Generate a failing assertion with a message msg.
          return assert.fail('GET /v1/meters/1234ferfefrerf/sentmessages/ fails ' + error);
        }
        // If the meter serial does not exist, it should not return a 200, and the message should not be null
        // Generate a passing assertion with a message msg.
        return assert.pass('GET /v1/meters/1234ferfefrerf/sentmessages/ informations pass');
    });
});

/* 
  The onFinish hook will get invoked when ALL tape tests have 
  finished right before tape is about to print the test summary 
 */
test.onFinish(() => {
  helperOnFinsh({database, testedModule, filename});
});
