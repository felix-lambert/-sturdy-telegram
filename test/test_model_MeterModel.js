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

test('** Setup environment for MeterModel tests **', function(assert) {
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


test('MeterModel: getAllAsArray', function(assert) {
  assert.plan(1);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.getAllAsArray()
    .then((data) => {
      assert.equal(typeof(data), 'object', 'getAllAsArray returns an array');
    })
    .catch((err) => {
      assert.fail('getAllAsArray error: ' + err);
    });
});

test('MeterModel: prepareMessage', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.prepareMessage('1234', 'CLOSE_VALVE')
    .then(() => {
      assert.pass('success');
    })
    .catch((err) => {
      assert.fail('prepareMessage failed ' + err);
    });

  MeterModel.prepareMessage('1234', 'OPEN_VALVE')
    .then(() => {
      assert.pass('success');
    })
    .catch((err) => {
      assert.fail('prepareMessage failed ' + err);
    });
});

test('MeterModel: updateIndexCeiling', function(assert) {
  assert.plan(4);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.updateIndexCeiling(250, 123)
    .then(() => {
      assert.fail('updateIndexCeiling with unknown index should throw error');
    })
    .catch((err) => {
      assert.pass('updateIndexCeiling with unknown index throws error: ' + err);
    });

  MeterModel.updateIndexCeiling(1234, 1000, false)
    .then(() => {
      assert.pass('updateIndexCeiling with existing index, no notif');
    })
    .catch((err) => {
      assert.fail('updateIndexCeiling with existing index error, no notif: ' + err);
    });

  MeterModel.updateIndexCeiling(1234, 1000)
    .then(() => {
      assert.pass('updateIndexCeiling with existing index with MQTT notif');
    })
    .catch((err) => {
      assert.fail('updateIndexCeiling with existing index error with MQTT notif: ' + err);
    });

  MeterModel.updateIndexCeiling(1234, 'ABC')
    .then(() => {
      assert.fail('updateIndexCeiling with string should fail ');
    })
    .catch((err) => {
      assert.pass('updateIndexCeiling with string throws error: ' + err);
    });
});


test('MeterModel: setWakeupFrequency', function(assert) {
  assert.plan(4);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.setWakeupFrequency(250, 123)
    .then(() => {
      assert.fail('setWakeupFrequency with unknown index should throw error');
    })
    .catch((err) => {
      assert.pass('setWakeupFrequency with unknown index throws error: ' + err);
    });

  MeterModel.setWakeupFrequency(1234, 1000, false)
    .then(() => {
      assert.pass('setWakeupFrequency with existing index, no notif');
    })
    .catch((err) => {
      assert.fail('setWakeupFrequency with existing index error, no notif: ' + err);
    });

  MeterModel.setWakeupFrequency(1234, 1000)
    .then(() => {
      assert.pass('setWakeupFrequency with existing index with MQTT notif');
    })
    .catch((err) => {
      assert.fail('setWakeupFrequency with existing index error with MQTT notif: ' + err);
    });

  MeterModel.setWakeupFrequency(1234, 'ABC')
    .then(() => {
      assert.fail('setWakeupFrequency with string should fail ');
    })
    .catch((err) => {
      assert.pass('setWakeupFrequency with string throws error: ' + err);
    });
});


test('MeterModel: sendCloseValveMessage', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.sendCloseValveMessage('ABC')
    .then(() => {
      assert.fail('sendCloseValveMessage with string should fail');
    })
    .catch((err) => {
      assert.pass('sendCloseValveMessage with string throws error: ' + err);
    });

  MeterModel.sendCloseValveMessage('1234')
    .then(() => {
      assert.pass('sendCloseValveMessage with existing index with MQTT notif');
    })
    .catch((err) => {
      assert.fail('sendCloseValveMessage with existing index error with MQTT notif: ' + err);
    });
});


test('MeterModel: sendOpenValveMessage', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.sendOpenValveMessage('ABC')
    .then(() => {
      assert.fail('sendOpenValveMessage with string should fail');
    })
    .catch((err) => {
      assert.pass('sendOpenValveMessage with string throws error: ' + err);
    });

  MeterModel.sendOpenValveMessage('1234')
    .then(() => {
      assert.pass('sendOpenValveMessage with existing index with MQTT notif');
    })
    .catch((err) => {
      assert.fail('sendOpenValveMessage with existing index error with MQTT notif: ' + err);
    });
});

test('MeterModel: getWakeupFrequency', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.getWakeupFrequency('ABC')
    .then(() => {
      assert.fail('getWakeupFrequency with string should fail');
    })
    .catch((err) => {
      assert.pass('getWakeupFrequency with string throws error: ' + err);
    });

  MeterModel.getWakeupFrequency('1234')
    .then(() => {
      assert.pass('getWakeupFrequency with existing index with MQTT notif');
    })
    .catch((err) => {
      assert.fail('getWakeupFrequency with existing index error with MQTT notif: ' + err);
    });
});

test('MeterModel: getWaterIndex', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.getWaterIndex('ABC')
    .then(() => {
      assert.fail('getWaterIndex with string should fail');
    })
    .catch((err) => {
      assert.pass('getWaterIndex with string throws error: ' + err);
    });

  MeterModel.getWaterIndex('1234')
    .then(() => {
      assert.pass('getWaterIndex with existing index with MQTT notif');
    })
    .catch((err) => {
      assert.fail('getWaterIndex with existing index error with MQTT notif: ' + err);
    });
});


test('MeterModel: getByRadioIdentifier', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.getByRadioIdentifier('1234abcd')
    .then((data) => {
      assert.equal(data.id, 1, 'getByRadioIdentifier with existing index ');
    })
    .catch((err) => {
      assert.fail('getByRadioIdentifier with existing index error: ' + err);
    });

  MeterModel.getByRadioIdentifier(250)
    .then((data) => {
      assert.equal(data, null, 'getByRadioIdentifier: unknown index return null');
    });
});

test('MeterModel: getBySerial', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.getBySerial('1234')
    .then((data) => {
      assert.equal(data.id, 1, 'getBySerial with existing index ');
    })
    .catch((err) => {
      assert.fail('getBySerial with existing index error: ' + err);
    });

  MeterModel.getBySerial(250).then((data) => {
    assert.equal(data, null, 'getBySerial: unknown index return null');
  });
});

test('MeterModel: updateLastIndex', function(assert) {
  assert.plan(1);

  const MeterModel = require('../models/tables/MeterModel');

  const newIndex = 1000;

  MeterModel.getById(1)
    .then((model) => {
      return model.updateLastIndex(newIndex);
    })
    .then((model) => {
      assert.equal(model.attributes.last_index, newIndex, 'updateLastIndex store new value in DB');
    })
    .catch((err) => {
      assert.fail('updateLastIndex failed ' + err);
    });
});

test('MeterModel: getWakeupFrequency', function(assert) {
  assert.plan(1);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.getWakeupFrequency('1234')
    .then(() => {
      assert.pass('success');
    })
    .catch((err) => {
      assert.fail('updateLastIndex failed ' + err);
    });
});

test('MeterModel: sendCloseValveMessage', function(assert) {
  assert.plan(1);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.sendCloseValveMessage('1234')
    .then(() => {
      assert.pass('success');
    })
    .catch((err) => {
      assert.fail('sendCloseValveMessage failed ' + err);
    });
});


test('MeterModel: updateIndexCeiling without mqttURL', function(assert) {
  assert.plan(1);

  const MeterModel = require('../models/tables/MeterModel');

  global.config.mqtt.mqttUrl = '';

  MeterModel.updateIndexCeiling(1, 123)
    .then(() => {
      assert.fail('updateIndexCeiling should fails without mqttURL');
    })
    .catch((err) => {
      global.config.mqtt.mqttUrl = 'mqtt://test.mosquitto.org';
      assert.pass('updateIndexCeiling fails without mqttURL with ' + err);
    });
});

test('MeterModel: updateIndexCeiling without mqttURL', function(assert) {
  assert.plan(1);

  const MeterModel = require('../models/tables/MeterModel');

  global.config.mqtt.mqttUrl = '';

  MeterModel.updateIndexCeiling(1, 123)
    .then(() => {
      assert.fail('updateIndexCeiling should fails without mqttURL');
    })
    .catch((err) => {
      global.config.mqtt.mqttUrl = 'mqtt://test.mosquitto.org';
      assert.pass('updateIndexCeiling fails without mqttURL with ' + err);
    });
});

test('MeterModel: createMeter', function(assert) {
  assert.plan(3);

  const MeterModel = require('../models/tables/MeterModel');

  const obj = {
    serial: 123454,
    radio_identifier: 'abcd',
    offset:0
  };
  MeterModel.create(obj)
    .then((data) => {
      assert.equal(data.attributes.serial, 123454, 'createMeter with object return serial');
      assert.equal(data.attributes.radio_identifier, 'abcd', 'createMeter with object return radio_identifier');
    })
    .catch((err) => {
      assert.fail('createMeter with object error: ' + err);
    });
  MeterModel.create({})
    .then(() => {
      assert.fail('createMeter with object null don\'t fail');
    })
    .catch(() => {
      assert.pass('createMeter with object null fail');
    });
});

test('Test Meter model: update', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  const serial = 123454;
  const obj = {
    radio_identifier: 'abcde',
    serial: '123456',
    account_id: 1,
    offset:2
  };

  MeterModel.update(serial, obj)
    .then((data) => {
      assert.equal(data.attributes.radio_identifier, 'abcde', 'update with object');
    })
    .catch((err) => {
      assert.fail('update with object error: ' + err);
    });

  MeterModel.update(serial, {})
    .then(() => {
      assert.fail('update with object null error');
    })
    .catch(() => {
      assert.pass('update with object null fail');
    });
});


test('MeterModel: destroyMeter', function(assert) {
  assert.plan(2);

  const MeterModel = require('../models/tables/MeterModel');

  MeterModel.destroyMeter(123454)
    .then(() => {
      assert.pass('destroyMeter with serial destroy meter');
    })
    .catch((err) => {
      assert.fail('destroyMeter with serial error: ' + err);
    });

  MeterModel.destroyMeter()
    .then(() => {
      assert.fail('destroyMeter with object null');
    })
    .catch(() => {
      assert.pass('destroyMeter with serial destroy meter');
    });
});
