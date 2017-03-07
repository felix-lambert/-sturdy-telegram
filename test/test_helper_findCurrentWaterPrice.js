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
const testedModule = require('../helper/findCurrentWaterPrice');

test('findCurrentWaterPrice', function(assert) {
  assert.plan(9);

  assert.equal(testedModule(1000), 127, 'Current water price = 127');
  assert.equal(testedModule(9999), 127, 'Current water price = 127');
  assert.equal(testedModule(10000), 127, 'Current water price = 127');
  assert.equal(testedModule(30000), 321, 'Current water price = 321');
  assert.equal(testedModule(40000), 321, 'Current water price = 321');
  assert.equal(testedModule(45000), 515, 'Current water price = 515');
  assert.equal(testedModule(50000), 515, 'Current water price = 515');
  assert.equal(testedModule(50001), 612.85, 'Current water price = 612.85');
  assert.equal(testedModule(50000000), 612.85, 'Current water price = 612.85');

});