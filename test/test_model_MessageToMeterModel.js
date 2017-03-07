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

test('** Setup environment for MessageToMeterModel tests **', function(assert) {
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

test('MessageToMeterModel: createMessageToMeter', function(assert) {
  assert.plan(2);

  const MessageToMeterModel = require('../models/tables/MessageToMeterModel');

  MessageToMeterModel.create(1, 'toto')
    .then((model) => {
      assert.pass('createMessageToMeter with id ' + model.get('id'));
    })
    .catch((err) => {
      assert.fail('createMessageToMeter failed ' + err);
    });

  MessageToMeterModel.create(1, 'toto')
    .then((model) => {
      assert.pass('createMessageToMeter with id ' + model.get('id'));
    })
    .catch((err) => {
      assert.fail('createMessageToMeter failed ' + err);
    });
});
