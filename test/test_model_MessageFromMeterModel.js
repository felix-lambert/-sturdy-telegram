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

test('** Setup environment for MessageFromMeterModel tests **', function(assert) {
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

const radioIdentifier     = '00-00-te-st';

  test('Test MessageFromMeter model: createMeterMessage', function(assert) {
  assert.plan(1);

  const MessageFromMeterModel = require('../models/tables/MessageFromMeterModel');

  let testMessage = {};
  testMessage.radioIdentifier = radioIdentifier;
  testMessage.message = '{"chan":1,"cls":0,"codr":"4/5","data":"EQA=","datr":"SF8BW125","freq":"868.3","lsnr":"11.2","mhdr":"400500000600222d","modu":"LORA","opts":"","port":1,"rfch":0,"rssi":-48,"seqn":11554,"size":4,"timestamp":"2016-09-23T23:52:31.376030Z","tmst":942546700,"topic":"conduit1/00-80-00-00-00-00-a5-d8/up"}';
  testMessage.decodedData = '1100';

  MessageFromMeterModel.create(testMessage)
    .then((model) => {
      assert.pass('createMeterMessage with id ' + model.get('id'));
    })
    .catch((err) => {
      assert.fail('createMeterMessage failed ' + err);
    });
});

test('MessageFromMeterModel: getAllAsArrayByRadioIdentifier', function(assert) {
  assert.plan(1);

  const MessageFromMeterModel = require('../models/tables/MessageFromMeterModel');

  MessageFromMeterModel.getAllAsArrayByRadioIdentifier(radioIdentifier)
    .then((data) => {
      assert.equal(typeof(data), 'object', 'getAllAsArrayByRadioIdentifier returns an array');
    })
    .catch((err) => {
      assert.fail('getAllAsArrayByRadioIdentifier failed ' + err);
    });
});
