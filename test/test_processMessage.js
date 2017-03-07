/**
 * CT Cloud API
 * ======================
 * Components process message tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const test           = require('tape').test;
const ENV            = require('./helperCheckEnv')();
const cfg            = require('../config/config.' + ENV);
const processMessage = require('../controller/processMessage').processMessage;
const testedModule   = require('../server');
const filename       = cfg.knex.connection.filename;

// require models
let helperOnFinsh    = require('./helperOnFinish');
let database         = require('../models/database');
let AccountModel     = require('../models/tables/AccountModel');
let MeterModel       = require('../models/tables/MeterModel');
let SmsOutgoingModel = require('../models/tables/SmsOutgoingModel');

let ValveStatusHistoryModel = require('../models/tables/ValveStatusHistoryModel');

test('Setup environment for processMessage', function(assert) {
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


test('Create test Meter with v2.0.0 firmware', function(assert) {
  assert.plan(1);

  MeterModel.create({
    'radio_identifier': 'ae-44',
    'serial': '44',
    'offset': 42,
    'firmware': '2.0.0',
    'index': 15,
    'account_id': 2
  })
    .then((instance) => {
      assert.pass('test meter created with v2.0.0 firmware ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('test meter creation failed with v2.0.0 firmware' + err);
    });
});

test('Create test Meter without firmware', function(assert) {
  assert.plan(1);

  MeterModel.create({
    'radio_identifier': 'ae-45',
    'serial': '45',
    'offset': 43,
    'index': 15,
    'account_id': 1
  })
    .then((instance) => {
      assert.pass('test meter created without firmware, ID: ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('test meter creation failed without firmware' + err);
    });
});

test('Create test Meter with firmware and with account id 1 that us under 450CFA', function(assert) {
  assert.plan(1);

  MeterModel.create({
    'radio_identifier': 'ae-48',
    'serial': '48',
    'offset': 43,
    'index': 15,
    'firmware': '2.0.0',
    'account_id': 1
  })
    .then((instance) => {
      assert.pass('test meter created without firmware, ID: ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('test meter creation failed without firmware' + err);
    });
});

test('Create test Meter without account_id', function(assert) {
  assert.plan(1);

  MeterModel.create({
    'radio_identifier': 'ae-46',
    'serial': '46',
    'offset': 42,
    'firmware': '2.0.0',
    'index': 15,
  })
    .then((instance) => {
      assert.pass('test meter created without account_id, ID: ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('test meter creation failed without account_id' + err);
    });
});

test('Create test Meter with unreal account_id', function(assert) {
  assert.plan(1);

  MeterModel.create({
    'radio_identifier': 'ae-47',
    'serial': '47',
    'offset': 42,
    'firmware': '2.0.0',
    'index': 15,
    'account_id': 10000000
  })
    .then((instance) => {
      assert.pass('test meter created with unreal account_id, ID: ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('test meter creation failed with unreal account_id' + err);
    });
});

test('Create test Meter with unreal account_id', function(assert) {
  assert.plan(1);

  MeterModel.create({
    'radio_identifier': 'ae-47',
    'serial': '47',
    'offset': 42,
    'firmware': '2.0.0',
    'index': 15,
    'account_id': 10000000
  })
    .then((instance) => {
      assert.pass('test meter created with unreal account_id, ID: ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('test meter creation failed with unreal account_id' + err);
    });
});

test('valve status history', function(assert) {
  assert.plan(1);

  ValveStatusHistoryModel.create({
    account_id: 1,
    meter_id: 1,
    timestamp: Date.now() / 1000,
    valve_status: 0
  }).then((instance) => {
    assert.pass('test meter created with v2.0.0 firmware ' + instance.get('id'));
  }).catch((err) => {
    assert.fail('test meter creation failed with v2.0.0 firmware' + err);
  });
});

test('v2 processMessage("temperature, water_index, valve_status, index_ceiling, wakeUp_frequency with v2.0.0 firmware")', function(assert) {
  assert.plan(7);

  const message = {
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
    "topic": "lora/1234abcd/up",
    "timestamp": '2016-10-07T14:05:41.141204Z',
    "tmst": 368037195
  };

  processMessage(message)
    .then(function() {

      MeterModel.getByRadioIdentifier('1234abcd')
        .then((meter) => {
          assert.equal(meter.get('valve_status'), 1, 'processMessage("valve_status") passed with v2.0.0 firmware');
          assert.equal(meter.get('temperature'), 31, 'processMessage("temperature") passed with v2.0.0 firmware');
          assert.equal(meter.get('last_index'), 27276, 'processMessage("last_index") passed with v2.0.0 firmware');
          assert.equal(meter.get('message_frequency'), 300, 'processMessage("message_frequency") passed with v2.0.0 firmware');
          assert.equal(meter.get('index_ceiling'), 1000000, 'processMessage("index_ceiling") passed with v2.0.0 firmware');
        });
      AccountModel.getById(1)
        .then((account) => {
          assert.equal(account.get('cycle_cumulated_consumption'), 76, 'processMessage cumulated_consumption OK');
          assert.equal(account.get('current_credit'), 40.348, 'processMessage current_credit OK');
        });

    })
    .catch(function(err) {
      assert.fail('processMessage("temperature, water_index, valve_status, index_ceiling, wakeUp_frequency") failed with v2.0.0 firmware' + err);
    });
});


test('v2 processMessage with unknown radio_identifier', function(assert) {
  assert.plan(1);
  const unknownRadioIdentifier            = '1234Unknown';
  const messageWithUnknownRadioIdentifier = {
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
    "topic": "lora/" + unknownRadioIdentifier + "/up",
    "timestamp": '2016-10-07T14:05:41.141204Z',
    "tmst": 368037195
  };
  // `Meter with radio identifier ${message.radioIdentifier} is not registered`
  processMessage(messageWithUnknownRadioIdentifier)
    .then((response) => {
      assert.equal(response.message, 'Meter with radio identifier ' + unknownRadioIdentifier + ' is not registered', 'processMessage with unknown radio_identifier OK');
    })
    .catch(() => {
      assert.fail('processMessage fail with unknown radio_identifier');
    });
});


test('v2 processMessage without firmware registered', function(assert) {
  assert.plan(1);
  const messageWithoutFirmwareRegistered = {
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
    "topic": "lora/ae-45/up",
    "timestamp": '2016-10-07T14:05:41.141204Z',
    "tmst": 368037195
  };
  processMessage(messageWithoutFirmwareRegistered)
    .then((res) => {
      assert.fail('processMessage pass without firmware');
    })
    .catch((err) => {
      assert.equal(err, 'Meter with serial 45 doesn\'t have a valid firmware', 'processMessage without firmware OK');
    });
});


test('v2 processMessage without account_id', function(assert) {
  assert.plan(1);
  const messageMithoutAccountID = {
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
    "topic": "lora/ae-46/up",
    "timestamp": '2016-10-07T14:05:41.141204Z',
    "tmst": 368037195
  };
  processMessage(messageMithoutAccountID)
    .then(() => {
      assert.pass('v2 processMessage without account_id');
    })
    .catch((err) => {
      assert.fail('v2 processMessage without account_id fail, ' + err);
    });
});

test('v2 processMessage with unreal account_id', function(assert) {
  assert.plan(1);
  const messageMithoutAccountID = {
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
    "topic": "lora/ae-47/up",
    "timestamp": '2016-10-07T14:05:41.141204Z',
    "tmst": 368037195
  };
  processMessage(messageMithoutAccountID)
    .then(() => {
      assert.fail('v2 processMessage with unreal account_id fail');
    })
    .catch((err) => {
      assert.equal(err, 'Account 10000000 does not exist', 'processMessage without firmware OK');
    });
});

test('v2 processMessage with firmware registered with account id and with CFA under 350', function(assert) {
  assert.plan(9);
  const messageWithoutFirmwareRegistered = {
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
    "topic": "lora/ae-48/up",
    "timestamp": '2016-10-07T14:05:41.141204Z',
    "tmst": 368037195
  };
  processMessage(messageWithoutFirmwareRegistered)
    .then(() => {
      SmsOutgoingModel.getAllAsArray()
        .then((allSms) => {
          assert.equal(allSms.models[0].get('message'), '"Bonjour, votre accès à l\'eau est désormais rétabli."', 'An account id has been registered OK');
          AccountModel.getById(1)
            .then((account) => {
              assert.equal(account.get('cycle_cumulated_consumption'), 27395, 'processMessage cumulated_consumption OK');
              assert.equal(account.get('current_credit'), -6803.795, 'processMessage current_credit OK');
              MeterModel.getByRadioIdentifier('ae-48')
                .then((meter) => {
                  assert.equal(meter.get('valve_status'), 1, 'processMessage("valve_status") passed with v2.0.0 firmware');
                  assert.equal(meter.get('temperature'), 31, 'processMessage("temperature") passed with v2.0.0 firmware');
                  assert.equal(meter.get('last_index'), 27276, 'processMessage("last_index") passed with v2.0.0 firmware');
                  assert.equal(meter.get('message_frequency'), 300, 'processMessage("message_frequency") passed with v2.0.0 firmware');
                  assert.equal(meter.get('index_ceiling'), 1000000, 'processMessage("index_ceiling") passed with v2.0.0 firmware');
                  assert.pass('v2 processMessage with firmware registered with account id and with CFA under 350');
                });
            });
        });


    })
    .catch((err) => {
      assert.fail(`v2 processMessage with firmware registered with account id and with CFA under 350 FAILED processMessage ${err}`);
    });
});

test.onFinish(() => {
  helperOnFinsh({database, testedModule, filename});
});
