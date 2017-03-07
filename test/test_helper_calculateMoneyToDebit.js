/**
 * CT Cloud API
 * ======================
 * Components api tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const test         = require('tape').test;
const testedModule = require('../helper/calculateMoneyToDebit');

test('calculateMoneyToDebit - Price levels', function(assert) {
  assert.plan(4);

  assert.equal(testedModule(19, 1000), 2.413, 'cycle consumption = 1000');
  assert.equal(testedModule(101, 11000), 32.421, 'cycle consumption = 11000');
  assert.equal(testedModule(115, 42000), 59.225, 'cycle consumption = 42000');
  assert.equal(testedModule(156, 55000), 95.6046, 'cycle consumption = 55000');

});

test('calculateMoneyToDebit - Price levels - edge cases', function(assert) {
  assert.plan(5);

  assert.equal(testedModule(103, 9990), 31.123, 'cycle consumption = 9990, volume = 103');
  assert.equal(testedModule(111, 39990), 55.225, 'cycle consumption = 39990, volume = 111');
  assert.equal(testedModule(117, 49990), 70.72495, 'cycle consumption = 49990, volume = 117');

  assert.equal(testedModule(31013, 9990), 10147.815, 'cycle consumption = 9990, volume = 31013');
  assert.equal(testedModule(50019, 9990), 20915.28565, 'cycle consumption = 9990, volume = 50019');
});


test('calculateMoneyToDebit - Cycle Consumption = 0', function(assert) {
  assert.plan(11);

  assert.equal(testedModule(112, 0), 14.224, '112 L');
  assert.equal(testedModule(1001, 0), 127.127, '1001 L');

  assert.equal(testedModule(8003, 0), 1016.381, '8003 L');
  assert.equal(testedModule(10003, 0), 1270.963, '10003 L');

  assert.equal(testedModule(11005, 0), 1592.605, '11005 L');
  assert.equal(testedModule(15003, 0), 2875.963, '15003 L');
  assert.equal(testedModule(40000, 0), 10900, '40000 L');
  assert.equal(testedModule(46000, 0), 13990, '46000 L');
  assert.equal(testedModule(51000, 0), 16662.85, '51000 L');
  assert.equal(testedModule(52000, 0), 17275.7, '52000 L');
  assert.equal(testedModule(55000, 0), 19114.25, '55000 L');

});
