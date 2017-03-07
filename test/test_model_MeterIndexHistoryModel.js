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

test('** Setup environment for MeterIndexHistoryModel tests **', function(assert) {
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

test('MeterIndexHistoryModel: createMessageToMeter', function(assert) {
  assert.plan(1);

  const MeterIndexHistoryModel = require('../models/tables/MeterIndexHistoryModel');

  const MeterIndexHistoryJson1 = {
    "meter_id": 1,
    "index_history": 7,
    "offset":1
  };

  MeterIndexHistoryModel.create(MeterIndexHistoryJson1)
    .then((model) => {
      assert.pass('createMeterIndexHistory with id ' + model.get('meter_id'));
    })
    .catch((err) => {
      assert.fail('createMeterIndexHistory failed ' + err);
    });
});
