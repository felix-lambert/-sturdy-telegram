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
const {WATER_PRICES} = require('../config/constants');

test('** Setup environment for AccountTransactionModel tests **', function(assert) {
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

test('AccountTransactionModel: create', function(assert) {
  assert.plan(4);

  const AccountTransactionModel = require('../models/tables/AccountTransactionModel');
  const accountId               = 1;
  const transactionData         = {
    accountId: accountId,
    amount: -42,
    origin: 'Water consumption',
    timestamp: new Date().getTime() / 1000,
    currentCredit: 1000,
    cycleCumulatedConsumption: 3000,
    consumption: 20
  };

  AccountTransactionModel.create(transactionData)
    .then((model) => {
      assert.equal(model.get('account_id'), accountId, 'createAccountTransaction : correct account id');
      assert.equal(model.get('current_credit'), transactionData.currentCredit, 'createAccountTransaction : correct timestamp');
      assert.equal(model.get('origin'), transactionData.origin, 'createAccountTransaction : correct origin');
      assert.equal(model.get('current_water_price'), WATER_PRICES[0].price, 'createAccountTransaction : correct current water price');
    })
    .catch((err) => {
      assert.fail('createAccountTransaction failed ' + err);
    });
});


