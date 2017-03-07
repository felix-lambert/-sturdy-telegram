/**
 * CT Cloud API
 * ======================
 * Components model tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const test = require('tape');

test('** Setup environment for AccountModel tests **', function(assert) {
  assert.plan(1);

  const prepare_test_env = require('./prepare_test_env');

  prepare_test_env()
    .then(() => {
      assert.pass('Test env setup done');
    }).catch((err) => {
      assert.fail('Test env setup error ' + err);
    });
});

/**
 * Tests
 */

test('AccountModel: createAccount', function(assert) {
  assert.plan(1);

  const AccountModel = require('../models/tables/AccountModel');
  let testAccount = {
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

  AccountModel.create(testAccount)
    .then((model) => {
      assert.pass('createAccount with id ' + model.get('id'));
    })
    .catch((err) => {
      assert.fail('createAccount failed ' + err);
    });
});


test('AccountModel: updateCycleCumulatedConsumption', function(assert) {
  assert.plan(1);

  const AccountModel = require('../models/tables/AccountModel');

  AccountModel.getById(1)
    .then((instance) => {
      instance.updateCycleCumulatedConsumption(100)
        .then((data) => {
          assert.equal(data.get('cycle_cumulated_consumption'), 100, 'updateCycleCumulatedConsumption has been updated');
        })
        .catch((err) => {
          assert.fail('updateCycleCumulatedConsumption failed ' + err);
        });
    })
    .catch((err) => {
      assert.fail('getById failed ' + err);
    });
});


test('AccountModel: addToCycleCumulatedConsumption', function(assert) {
  assert.plan(1);

  const AccountModel = require('../models/tables/AccountModel');

  AccountModel.getById(1)
    .then((instance) => {

      instance.addToCycleCumulatedConsumption(50)
        .then((data) => {
          assert.equal(data.get('cycle_cumulated_consumption'), 150, 'addToCycleCumulatedConsumption has been updated');
        })
        .catch((err) => {
          assert.fail('addToCycleCumulatedConsumption failed ' + err);
        });
    }).catch((err) => {
    assert.fail('getById failed ' + err);
  });

});

test('AccountModel: resetCycleCumulatedConsumption', function(assert) {
  assert.plan(2);

  const AccountModel = require('../models/tables/AccountModel');

  AccountModel.resetCycles(1)
    .then((cycleReseted) => {
      assert.equal(cycleReseted.get('cycle_cumulated_consumption'), 0, 'resetCycleCumulatedConsumption has been updated');
      assert.equal(cycleReseted.get('cycle_paid_subscription'), 0, 'cycle_paid_subscription has been updated');
    }).catch((err) => {
    assert.fail('getById failed ' + err);
  });

});
