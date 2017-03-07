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
const fs   = require('fs');

test('** Setup environment for AccountPhoneNumberModel tests **', function(assert) {
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

const accountId             = 3;
const phoneNumber           = 96557654987;

test('AccountPhoneNumberModel: create', function(assert) {
  assert.plan(1);

  const AccountPhoneNumberModel = require('../models/tables/AccountPhoneNumberModel');

  AccountPhoneNumberModel.create(accountId, phoneNumber)
    .then((model) => {
      assert.pass('createAccountPhoneNumber with id ' + model.get('id'));
    }).catch((err) => {
      assert.fail('createAccountPhoneNumber failed ' + err);
    });
});


test('AccountPhoneNumberModel: getByPhoneNumber', function(assert) {
  assert.plan(1);

  const AccountPhoneNumberModel = require('../models/tables/AccountPhoneNumberModel');

  AccountPhoneNumberModel.getByPhoneNumber(phoneNumber)
    .then((phoneNumberInstance) => {
      assert.equal(phoneNumberInstance.get('account_id'), accountId, 'getByPhoneNumber pass');
    })
    .catch((err) => {
      assert.fail('addToCycleCumulatedConsumption failed ' + err);
    });
});
