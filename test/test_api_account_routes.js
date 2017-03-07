/**
 * CT Cloud API
 * ======================
 * Components api tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const ENV                   = require('./helperCheckEnv')();
const cfg                   = require('../config/config.' + ENV);
const test                  = require('tape').test;
const testedModule          = require('../server');
const request               = require('supertest');
const filename              = cfg.knex.connection.filename;

let helperOnFinsh           = require('./helperOnFinish');
let authModule              = require('../helper/generateToken');
let database                = require('../models/database');
let AccountModel            = require('../models/tables/AccountModel');
let AccountPhoneNumberModel = require('../models/tables/AccountPhoneNumberModel');
let MeterModel              = require('../models/tables/MeterModel');
let AccountTransactionModel = require('../models/tables/AccountTransactionModel');


test('Setup environment for account tests', function(assert) {
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

test('Create test account', function(assert) {
  assert.plan(1);
  AccountModel.create({
    "contact_email": "test_account@test.com",
    "last_name": "John ",
    "first_name": "Doe",
    "contact_phone_number": "92763100",
    "subscriptionDailyFee": "666"
  }).then(() => {
    assert.pass('test account created');
  }).catch((err) => {
    return assert.fail('test account creation failed ' + err);
  });
});

let token = authModule.generateToken('test@test.com', 'SuperAdmin', cfg.jwt.jwtSecret, false, 2);

const contactEmail1  = 'accountTest@test.com';
const contactEmail2 = 'accountTest2@test.com';

test('Create account', function(assert) {

  assert.plan(4);
  request(testedModule.server)
    .post('/v1/accounts/')
    .set('authorization', token)
    .expect(200)
    .send({
      "contact_email": contactEmail1,
      "last_name": "John ",
      "first_name": "Doe",
      "contact_phone_number": "92763100",
      "subscriptionFee": 666
    })
    .expect('Content-Type', /json/)
    .end((err, accountResults) => {
      if (err) {
        return assert.fail('POST /v1/accounts/ fails ' + err);
      }
      assert.equal(accountResults.body.subscription_daily_fee, 24, 'subscription_daily_fee is = 24 (666 / 28)');
      assert.equal(accountResults.body.subscription_fee, 666, 'subscription_fee is = 666');
      AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
        assert.equal(accountMailInstance.get('contact_email'), contactEmail1, 'account was create');
      });
    });

  request(testedModule.server)
    .post('/v1/accounts/')
    .set('authorization', token)
    .expect(200)
    .send({
      "contact_email": contactEmail2,
      "last_name": "John ",
      "first_name": "Doe",
      "contact_phone_number": "92763100"
    })
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/ fails ' + err);
      }
      AccountModel.getByEmail(contactEmail2).then((accountMailInstance) => {
        assert.equal(accountMailInstance.get('contact_email'), contactEmail2, 'account was create');
      });
    });
});

test('Delete account', function(assert) {
  assert.plan(2);
  AccountModel.getByEmail(contactEmail2).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .delete('/v1/accounts/' + contactEmailID)
      .set('authorization', token)
      .expect(200).expect('Content-Type', /json/)
      .end((err) => {
        if (err) {
          return assert.fail('DELETE /v1/accounts/' + contactEmailID + ' fails ' + err);
        }
        return assert.pass('DELETE /v1/accounts/' + contactEmailID);
      });
  }).catch((err) => {
    return assert.fail('DELETE /v1/accounts/ fails ' + err);
  });

  request(testedModule.server)
    .delete('/v1/accounts/freerrf')
    .set('authorization', token)
    .expect(200).expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('DELETE /v1/accounts/freerrf fails ' + err);
      }
      return assert.pass('DELETE /v1/accounts/freerrf');
    });

});

test('patch account', function(assert) {
  assert.plan(1);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .patch('/v1/accounts/' + contactEmailID)
      .set('authorization', token)
      .expect(200).expect('Content-Type', /json/)
      .end((err) => {
        if (err) {
          return assert.fail('PATCH /v1/accounts/' + contactEmailID + ' fails ' + err);
        }
        return assert.pass('PATCH /v1/accounts/' + contactEmailID);
      });
  }).catch((err) => {
    return assert.fail('PATCH /v1/accounts/ fails ' + err);
  });

});

test('reset cycles', function(assert) {
  assert.plan(3);

  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .post('/v1/accounts/resetCycles')
      .set('authorization', token)
      .send({'accountId': contactEmailID})
      .expect(200).expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          return assert.fail('POST /v1/accounts/resetCycles fails ' + err);
        }
        assert.equal(res.body.cycle_cumulated_consumption, 0, 'cycle cumulated consumption = 0');
        assert.equal(res.body.cycle_paid_subscription, 0, 'cycle paid fee = 0');
        return assert.pass('POST /v1/accounts/resetCycles');
      });
  })
    .catch((err) => {
      return assert.fail('POST /v1/accounts/' + contactEmail1 + '/resetCycleCumulatedConsumption' + err);
    });
});

test('reset cycles with invalid id', function(assert) {
  assert.plan(2);

  AccountModel.getByEmail(contactEmail1)
    .then(() => {
      request(testedModule.server)
        .post('/v1/accounts/resetCycles')
        .set('authorization', token)
        .send({'accountId': 'invalidId'})
        .expect(500).expect('Content-Type', /json/)
        .end((err, res) => {
          assert.equal(res.body.error, 'ServerError', 'ServerError when you reset cycles');
          if (err) {
            return assert.fail('POST /v1/accounts/resetCycles fails ' + err);
          }

          return assert.pass('POST /v1/accounts/resetCycles');
        });
    })
    .catch((err) => {
      return assert.fail('POST /v1/accounts/resetCycles' + err);
    });
});


test('GET attachedPhoneNumber', function(assert) {
  assert.plan(1);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .get('/v1/accounts/' + contactEmailID + '/phoneNumber')
      .set('authorization', token)
      .expect(200).expect('Content-Type', /json/)
      .end((err) => {
        if (err) {
          return assert.fail('GET /v1/accounts/' + contactEmailID + '/phoneNumber fails ' + err);
        }
        return assert.pass('PATCH /v1/accounts/' + contactEmailID + '/phoneNumber');
      });
  })
    .catch((err) => {
      return assert.fail('PATCH /v1/accounts/phoneNumber fails ' + err);
    });
});

test('GET attachedPhoneNumber with false ID', function(assert) {
  assert.plan(1);
  const falseID = 10000;
  request(testedModule.server)
    .get('/v1/accounts/' + falseID + '/phoneNumber')
    .set('authorization', token)
    .send({})
    .expect(200).expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('GET /v1/accounts/' + falseID + '/phoneNumber with false ID fails ' + err);
      }
      return assert.pass('GET /v1/accounts/' + falseID + '/phoneNumber with false ID');
    });
});

test('POST attachedPhoneNumber with false ID', function(assert) {
  assert.plan(1);
  const falseID = 10000;
  request(testedModule.server)
    .post('/v1/accounts/' + falseID + '/phoneNumber')
    .set('authorization', token)
    .send({phone_number: '0102030405'})
    .expect(200).expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/' + falseID + '/phoneNumber with false ID fails ' + err);
      }
      AccountPhoneNumberModel.getByPhoneNumber('0102030405').then((AccountPhoneNumber) => {
        assert.equal(AccountPhoneNumber.get('account_id'), falseID, 'attached phone number was create');
      });
    });
});

test('Create attached phone number', function(assert) {
  assert.plan(2);

  let phoneNumber     = '667248757';
  const testAccountId = 3;
  request(testedModule.server)
    .post('/v1/accounts/' + testAccountId + '/phoneNumber')
    .set('authorization', token)
    .expect(200)
    .send({
      "phone_number": phoneNumber
    })
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/3/phoneNumber fails ' + err);
      }
      AccountPhoneNumberModel.getByPhoneNumber(phoneNumber).then((AccountPhoneNumber) => {
        assert.equal(AccountPhoneNumber.get('account_id'), testAccountId, 'attached phone number was create');
        request(testedModule.server)
          .delete(`/v1/accounts/${testAccountId}/phoneNumber/${AccountPhoneNumber.attributes.id}/`)
          .set('authorization', token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((error) => {
            if (error) {
              return assert.fail('POST /v1/accounts/3/phoneNumber fails ' + err);
            }
            return assert.pass('DELETE /v1/accounts/${testAccountId}/phoneNumber/${AccountPhoneNumber.attributes.id}/ success');
          });
      });
    });
});

test('Check account GET', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .get('/v1/accounts')
    .set('authorization', token)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err) => {
      if (err) {
        return assert.fail('GET /v1/accounts fails ' + err);
      }
      assert.pass('GET /v1/accounts');
    });
});

// Check routes to see if credit is well added
// We can also see the result of the volume, which will be the future index ceiling
test('Check account enablePayment', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .post('/v1/accounts/4/enablePayment')
    .set('authorization', token)
    .expect(200)
    .send({
      "enablePayment": 1
    })
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/enablePayment fails ' + err);
      }
      assert.pass('/v1/accounts/4/enablePayment');
    });
});

test('Check account get transactions credited', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .get('/v1/accounts/4/credit/50/1')
    .set('authorization', token)
    .expect(307)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/4/credit/50/1 fails ' + err);
      }
      assert.pass('/v1/accounts/4/credit/50/1');
    });
});

test('Check account get transactions debited', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .get('/v1/accounts/4/debit/50/1')
    .set('authorization', token)
    .expect(307)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/4/credit/50/1 fails ' + err);
      }
      assert.pass('/v1/accounts/4/credit/50/1');
    });
});

test('Check account addCredit', function(assert) {
  assert.plan(18);

  function testIndexCeilingAndCurrentDebit1270(res) {
    //We come back at 6007 of volume as expected
    assert.equal(res.body.volume, 6007, 'volume = 6007, CFA = 509');
    assert.pass('/v1/accounts/1/addCredit (add 509 credit)');
    MeterModel.getByAccountId(1).then((meter) => {
      assert.equal(meter.get('index_ceiling'), 33207, 'index ceiling = 33207');
      AccountTransactionModel.getById(5).then((transaction) => {
        // return 77 but 77 + 50CFA, so 127 + 127 + 509 + 1270 - 1270 = 763
        assert.equal(transaction.get('current_credit'), 763, 'current credit = 763');
      });
    });
  }

  function testIndexCeilingAndCurrentCredit127(res) {
    assert.equal(res.body.volume, 2000, 'volume = 2000, CFA = 127');
    assert.pass('/v1/accounts/4/addCredit');
    testedModule.models.Meter.getByAccountId(1).then((meter) => {
      // The index ceiling is the last index of 27200 which has been added in the env
      // I need to add 27200 + 1000 + 1000 = 29200
      assert.equal(meter.get('index_ceiling'), 29200, 'index ceiling = 28200');
      testedModule.models.AccountTransaction.getById(2).then((transaction) => {
        // return 77 but 77 + 50CFA, so 127 + 127 = 254
        assert.equal(transaction.get('current_credit'), 254, 'current credit = 50 + 77 + 127 -> 254');
        return request(testedModule.server)
          .post('/v1/accounts/1/addCredit')
          .set('authorization', token)
          .expect(200)
          .send({
            "creditToAdd": -1270
          })
          .expect('Content-Type', /json/);
      }).then(testIndexCeilingAndCurrentDebit1270);
    });
  }


  function testIndexCeilingAndCurrentCredit77(res) {
    assert.equal(res.body.volume, 1000, 'volume = 1000, CFA = 50+77 -> 127');
    MeterModel.getByAccountId(1).then((meter) => {
      // The index ceiling is the last index of 27200 which has been added in the env
      // I need to add 27200 + 1000 = 28200
      assert.equal(meter.get('index_ceiling'), 28200, 'index ceiling = 27200 + 1000 = 28200');
      AccountTransactionModel.getById(1).then((transaction) => {
        // In the SetUp environment 50CFA has already been added. So it should not
        // return 77 but 77 + 50CFA, so 127
        assert.equal(transaction.get('current_credit'), 127, 'current credit = 50+77 -> 127');
        return request(testedModule.server)
          .post('/v1/accounts/1/addCredit')
          .set('authorization', token)
          .expect(200)
          .send({
            "creditToAdd": 127
          }).expect('Content-Type', /json/);
      }).then(testIndexCeilingAndCurrentCredit127);
    });
  }

  function testIndexCeilingAndCurrentCredit1270(res) {
    assert.equal(res.body.volume, 12376, 'volume = 12376, CFA = 1270');
    MeterModel.getByAccountId(1).then((meter) => {
      // 33207 + 12376 (volume just added) is under 45583
      // Because you just reached the second step (>1000 of volume of water)
      // So the value of the volume is lower
      assert.equal(meter.get('index_ceiling'), 39576, 'index ceiling = 39576');
      AccountTransactionModel.getById(4).then((transaction) => {
        // return 77 but 77 + 50CFA, so 127 + 127 + 509 + 1270 = 2033
        assert.equal(transaction.get('current_credit'), 2033, 'current credit = 2033');
        return request(testedModule.server)
          .post('/v1/accounts/1/addCredit')
          .set('authorization', token)
          .expect(200)
          .send({
            "creditToAdd": -1270
          })
          .expect('Content-Type', /json/);
      }).then(testIndexCeilingAndCurrentDebit1270);
    });
  }

  function testIndexCeilingAndCurrentCredit509(res) {
    assert.equal(res.body.volume, 6007, 'volume = 6007, CFA = 509');
    assert.pass('/v1/accounts/1/addCredit (add 509 credit)');
    MeterModel.getByAccountId(1).then((meter) => {
      // 29200 + 6007
      assert.equal(meter.get('index_ceiling'), 33207, 'index ceiling = 37595');
      AccountTransactionModel.getById(3).then((transaction) => {
        // return 77 but 77 + 50CFA, so 127 + 127 + 509 = 763
        assert.equal(transaction.get('current_credit'), 763, 'current credit = 763');
        return request(testedModule.server)
          .post('/v1/accounts/1/addCredit')
          .set('authorization', token)
          .expect(200)
          .send({
            "creditToAdd": 1270
          })
          .expect('Content-Type', /json/);
      }).then(testIndexCeilingAndCurrentCredit1270);
    });
  }

  function testIndexCeilingAndCurrentCredit127(res) {
    assert.equal(res.body.volume, 2000, 'volume = 2000, CFA = 127');
    assert.pass('/v1/accounts/3/addCredit');
    MeterModel.getByAccountId(1).then((meter) => {
      // The index ceiling is the last index of 27200 which has been added in the env
      // I need to add 27200 + 1000 + 1000 = 29200
      assert.equal(meter.get('index_ceiling'), 29200, 'index ceiling = 28200');
      AccountTransactionModel.getById(2).then((transaction) => {
        // return 77 but 77 + 50CFA, so 127 + 127 = 254
        assert.equal(transaction.get('current_credit'), 254, 'current credit = 50 + 77 + 127 -> 254');
        return request(testedModule.server)
          .post('/v1/accounts/1/addCredit')
          .set('authorization', token)
          .expect(200)
          .send({
            "creditToAdd": 509
          }).expect('Content-Type', /json/);
      }).then(testIndexCeilingAndCurrentCredit509);
    });
  }

  function testIndexCeilingAndCurrentCredit77(res) {
    assert.equal(res.body.volume, 1000, 'volume = 1000, CFA = 50+77 -> 127');
    MeterModel.getByAccountId(1).then((meter) => {
      // The index ceiling is the last index of 27200 which has been added in the env
      // I need to add 27200 + 1000 = 28200
      assert.equal(meter.get('index_ceiling'), 28200, 'index ceiling = 27200 + 1000 = 28200');
      AccountTransactionModel.getById(1).then((transaction) => {
        // In the SetUp environment 50CFA has already been added. So it should not
        // return 77 but 77 + 50CFA, so 127
        assert.equal(transaction.get('current_credit'), 127, 'current credit = 50+77 -> 127');
        return request(testedModule.server)
          .post('/v1/accounts/1/addCredit')
          .set('authorization', token)
          .expect(200)
          .send({
            "creditToAdd": 127
          }).expect('Content-Type', /json/);
      }).then(testIndexCeilingAndCurrentCredit127);
    });
  }

  function startConvertCreditToVolumeTest() {
    request(testedModule.server)
      .post('/v1/accounts/1/addCredit')
      .set('authorization', token)
      .expect(200)
      .send({
        "creditToAdd": 77
      })
      .expect('Content-Type', /json/)
      .then(testIndexCeilingAndCurrentCredit77);
  }

  // I will test the conversion (credit to volume)
  // + the index ceiling result (after adding credit)
  // + the credit accumulated
  // + I also test if we want to debit credit from console
  startConvertCreditToVolumeTest();

});

test('Check account get transactions credited', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .get('/v1/accounts/1/credit/50/1')
    .set('authorization', token)
    .expect(200)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/3/credit/50/1 fails ' + err);
      }
      assert.pass('/v1/accounts/3/credit/50/1');
    });
});

test('Check account get transactions debited', function(assert) {
  assert.plan(1);

  request(testedModule.server)
    .get('/v1/accounts/1/debit/50/1')
    .set('authorization', token)
    .expect(200)
    .end((err) => {
      if (err) {
        return assert.fail('POST /v1/accounts/3/credit/50/1 fails ' + err);
      }
      assert.pass('/v1/accounts/3/credit/50/1');
    });
});

test('Get all accounts', function(assert) {
  assert.plan(2);

  request(testedModule.server)
    .get('/v1/accounts/')
    .set('authorization', token)
    .expect(200)
    .end((err, res) => {
      if (err) {
        return assert.fail('GET /v1/accounts/ fails ' + err);
      }
      assert.equal(res.body[0].id, 1, 'GET /v1/accounts/: The first id of all the accounts');
      assert.pass('GET /v1/accounts/');
    });
});

test('Get consumptions', function(assert) {
  assert.plan(1);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .get('/v1/accounts/consumptions/' + contactEmailID + '/1/10')
      .set('authorization', token)
      .expect(500)
      .end((err) => {
        if (err) {
          return assert.fail('GET /v1/accounts/consumptions/' + contactEmailID + ' fails ' + err);
        }
        assert.pass('GET /v1/accounts/consumptions/' + contactEmailID);
      });
  });
});

test('Get all attached phone number', function(assert) {
  assert.plan(1);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .get('/v1/accounts/' + contactEmailID + '/phoneNumber')
      .set('authorization', token)
      .expect(200)
      .end((err) => {
        if (err) {
          return assert.fail('/v1/accounts/' + contactEmailID + '/phoneNumber fails ' + err);
        }
        assert.pass('GET /v1/accounts/' + contactEmailID + '/phoneNumber');
      });
  });
});

test('Get SMS by account id', function(assert) {
  assert.plan(1);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .get('/v1/accounts/' + contactEmailID + '/50/1/getSms/')
      .set('authorization', token)
      .expect(307)
      .end((err) => {
        if (err) {
          return assert.fail('GET /v1/accounts/' + contactEmailID + '/50/1/getSms/ fails ' + err);
        }
        assert.pass('GET /v1/accounts/' + contactEmailID + '/50/1/getSms/');
      });
  });
});

test('Get SMS sent by account id', function(assert) {
  assert.plan(1);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .get('/v1/accounts/' + contactEmailID + '/50/1/getSmsSent/')
      .set('authorization', token)
      .expect(307)
      .end((err) => {
        if (err) {
          return assert.fail('GET /v1/accounts/' + contactEmailID + '/50/1/getSmsSent/ fails ' + err);
        }
        assert.pass('GET /v1/accounts/' + contactEmailID + '/50/1/getSmsSent/');
      });
  });
});

test('Send SMS by account id', function(assert) {
  assert.plan(2);
  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .post('/v1/accounts/' + contactEmailID + '/notifications/')
      .set('authorization', token)
      .send({
        message: 'test',
        phoneNumber: '014455745565'
      })
      .expect(200)
      .end((err) => {
        if (err) {
          return assert.fail('POST /v1/accounts/' + contactEmailID + '/notifications/ fails ' + err);
        }
        assert.pass('POST /v1/accounts/' + contactEmailID + '/notifications/');
      });
  });

  AccountModel.getByEmail(contactEmail1).then((accountMailInstance) => {
    const contactEmailID = accountMailInstance.get('id');
    request(testedModule.server)
      .post('/v1/accounts/' + contactEmailID + '/notifications/')
      .set('authorization', token)
      .send({
        phoneNumber: '014455745565'
      })
      .expect(500)
      .end((err) => {
        if (err) {
          return assert.fail('POST /v1/accounts/' + contactEmailID + '/notifications/ fails ' + err);
        }
        assert.pass('POST /v1/accounts/' + contactEmailID + '/notifications/');
      });
  });
});

test('Check cron service', function(assert) {
  assert.plan(2);

  function startCronServiceTest() {
    request(testedModule.server)
      .post('/v1/accounts/debitDailyFee')
      .set('authorization', token)
      .expect(200)
      .send({
        "signal": 1
      })
      .expect('Content-Type', /json/)
      .end((err, cronServiceResult) => {
        if (err) {
          return assert.fail('POST /v1/accounts/debitDailyFee fails ' + err);
        }
        // The returned value is an array of ids

        if (typeof cronServiceResult.body[0].id === 'number') {
          assert.pass('The cron return an id');
        } else {
          assert.fail("The cron don't return an id");
        }

        assert.pass('/v1/accounts/debitDailyFee');
      });
  }

  startCronServiceTest();
});

test.onFinish(() => {
  helperOnFinsh({database, testedModule, filename});
});
