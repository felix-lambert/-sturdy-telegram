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

let helperOnFinsh           = require('./helperOnFinish');
let authModule              = require('../helper/generateToken');
let database                = require('../models/database');
let AccountModel            = require('../models/tables/AccountModel');
let UserModel               = require('../models/tables/UserModel');
let AccountPhoneNumberModel = require('../models/tables/AccountPhoneNumberModel');


test('Setup environment for sms tests', function(assert) {
  assert.plan(1);
  let dbModule = require('./prepare_db_for_test');
  dbModule(testedModule.models)
    .then(function() {
      assert.pass('DB setup done');
    })
    .catch(function(err) {
      assert.fail(`DB setup error ${err}`);
    });
});

let token;
let testAccountId = 0;
test('Create test account', function(assert) {
  assert.plan(1);
  AccountModel.create({
    "contact_email": "test_account@test.com",
    "last_name": "John ",
    "first_name": "Doe",
    "contact_phone_number": "+22792700405"
  }).then(function(accountInstance) {
    testAccountId = accountInstance.get('id');
    assert.pass('test account created');
  })
    .catch(function(err) {
      return assert.fail(`test account creation failed ${err}`);
    });
});

let tokenSuperAdmin = authModule.generateToken('test@test.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);

test('Create attached phone number', function(assert) {
  let phoneNumber = '+22792705060';
  assert.plan(1);
  // const testAccountId = 2;
  request(testedModule.server)
    .post('/v1/accounts/' + testAccountId + '/phoneNumber')
    .set('authorization', tokenSuperAdmin)
    .expect(200)
    .send({
      "phone_number": phoneNumber
    })
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail(`POST /v1/accounts/3/phoneNumber fails ${err}`);
      }
      AccountPhoneNumberModel.getByPhoneNumber(phoneNumber).then((accountPhoneNumber) => {
        assert.equal(accountPhoneNumber.get('account_id'), testAccountId, 'attached phone number was create');
      });
    });
});

test('Check sms/ routes', function(assert) {
  assert.plan(13);

  const apiSecret = 'randomApiSecretCharacter';
  const userId    = 1;

  UserModel.updateUserApiSecret(userId, apiSecret)
    .then(function() {
      token = authModule.generateToken("testSms@test.com", 'SMS_server', cfg.jwt.jwtSecret, apiSecret, userId);
      assert.pass('post /smsApi pass');
      sendSms();
    })
    .catch(function(err) {
      return assert.fail('post /smsApi fail ' + err);
    });

  function sendSms() {
    // TODO Maybe test the response of each messages?
    const allTypeOfMessage = [{
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 200,
      "messageName": "messageComplete"
    }, {
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithoutSender"
    }, {
      "sender": "OrangeMoney",
      "message": "Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithoutTimestamp"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA",
      "statusExpect": 200,
      "messageName": "messageWithoutID"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithoutMessage"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithoutCredit"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du . Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithoutPhoneNumber"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du cidbscidhcbds. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithPhoneNumberInLetter"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu cjdsnkjnscjks FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithCreditInLetter"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du 92705060. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 200,
      "messageName": "messageWithAttachedPhoneNumber"
    }, {
      "sender": "OrangeMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du +564654654646. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithUnknowPhoneNumber"
    }, {
      "sender": "GreenMoney",
      "timestamp": "1476432069",
      "message": "Vous avez recu 1000.00 FCFA du +564654654646. Votre nouveau solde est de 1000.00 FCFA",
      "id": "10",
      "statusExpect": 400,
      "messageName": "messageWithUnknowPhoneNumber"
    }];
    allTypeOfMessage.forEach((message) => {
      request(testedModule.server)
        .post('/v1/sms')
        .set('authorization', token)
        .type('json')
        .send(message)
        .expect('Content-Type', /json/)
        .expect(message.statusExpect)
        .end(function(err) {
          if (err) {
            return assert.fail(`post /v1/sms fail (${message.messageName}) ${err}`);
          }
          assert.pass(`post /v1/sms pass (${message.messageName})`);
        });
    });
  }

});

const smsToSend = {
  id: 10,
  message: "Hello I'm just a test message, nothing more.",
  phoneNumber: "0945245844"
};

test('Send sms/', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .post('/v1/sms')
    .set('authorization', token)
    .type('json')
    .send(smsToSend)
    .expect('Content-Type', /json/)
    .end(function(err) {
      if (err) {
        return assert.fail(`post /v1/sms fail`);
      }
      assert.pass(`post /v1/sms pass`);
    });
});


test('Get sms/', function(assert) {
  assert.plan(2);

  request(testedModule.server)
    .get('/v1/sms/50/1/getSms')
    .set('authorization', tokenSuperAdmin)
    .type('json')
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return assert.fail(`get /v1/sms/50/1/getSms/ fail ${err}`);
      }
      assert.equal(res.body[0].id, 1, 'Sms received results has been found');
      assert.pass(`post /v1/sms/getSms/50/1 pass`);
    });
});

test('Get sms sent/', function(assert) {
  assert.plan(3);
  request(testedModule.server)
    .get('/v1/sms/50/1/getSmsSent')
    .set('authorization', tokenSuperAdmin)
    .type('json')
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return assert.fail(`get /v1/sms/50/1/getSmsSent fail ${err}`);
      }
      assert.equal(res.body[0].id, 4, 'Sms sent results has been found');
      assert.equal(res.body[0].type, 'paymentNotification', 'type of notification send is OK');
      assert.pass(`get /v1/sms/50/1/getSmsSent pass`);
    });
});

test('Get sms by id/', function(assert) {
  assert.plan(2);

  request(testedModule.server)
    .get('/v1/accounts/' + testAccountId + '/50/1/getSms/')
    .set('authorization', tokenSuperAdmin)
    .type('json')
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return assert.fail(`get /v1/accounts/${testAccountId}/50/1/getSms/ fail ${err}`);
      }
      assert.equal(res.body[0].account_id, testAccountId, 'Sms by account id received results has been found');
      assert.pass(`get /v1/accounts/5/50/1/getSms/ pass`);
    });
});

test('Get sms sent by id/', function(assert) {
  assert.plan(2);

  request(testedModule.server)
    .get('/v1/accounts/' + testAccountId + '/50/1/getSmsSent/')
    .set('authorization', tokenSuperAdmin)
    .type('json')
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return assert.fail(`get /v1/accounts/${testAccountId}/50/1/getSmsSent fail ${err}`);
      }
      assert.equal(res.body[0].account_id, testAccountId, 'Sms by account id sent results has been found');
      assert.pass(`get /v1/accounts/${testAccountId}/50/1/getSmsSent' pass`);
    });
});

test('Send sms notification by id/', function(assert) {
  assert.plan(2);

  request(testedModule.server)
    .post('/v1/accounts/' + testAccountId + '/notifications/')
    .set('authorization', tokenSuperAdmin)
    .type('json')
    .send(smsToSend)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) {
        return assert.fail(`post /v1/accounts/${testAccountId}/notifications/ fail ${err}`);
      }
      assert.equal(res.body.message, 'success', 'Send sms notification by account id succeeded');
      assert.pass(`post /v1/accounts/10/notifications/ pass`);
    });
});


test.onFinish(function() {
  helperOnFinsh({database, testedModule, filename});
});
