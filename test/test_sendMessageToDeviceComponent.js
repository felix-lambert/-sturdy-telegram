/**
 * CT Cloud API
 * ======================
 * Components send message to device tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const test         = require('tape').test;
const testedModule = require('../component/sendMessageToDevice');

test('Test sendMessageToDevice component', function(assert){
  assert.plan(2);

  global.config = {mqtt: { mqttUrl: "" }};

  testedModule('', '1234abcd', '{\"data\":\"AwPo\"}')
    .then((data) => {
      assert.fail('Should not succeed without an URL' + data);
    })
    .catch((err) => {
      assert.pass('Throws an error if URL is not defined ' + err);
    });
  global.config = {mqtt: { mqttUrl: 'mqtt://test.mosquitto.org' }};
  testedModule('1234abcd', '{\"data\":\"AwPo\"}')
    .then(() => {
      assert.pass('OK');
    })
    .catch((err) => {  
      assert.pass('KO '+ err);
    });
});
