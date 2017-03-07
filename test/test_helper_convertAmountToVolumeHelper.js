/**
 * CT Cloud API
 * ======================
 * Components api tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';


// The first 10 cubic meters (10000L) are charged 127 CFA/cubic meter
// From 10 cubic meter to 40 cubic meter, we charge 321 CFA/cubic meter
// From 40 cubic meter to 50 cubic meter, we charge 515 CFA/cubic meter
// Above 50 cubic meter, we charge (515 * 1.19) CFA/cubic meter
// {
//   "level": 0,
//   "price": 127,
//   "maxVolume": 10000
// },
// {
//   "level": 1,
//   "price": 321,
//   "maxVolume": 40000
// },
// {
//   "level": 2,
//   "price": 515,
//   "maxVolume": 50000
// },
// {
//   "level": 3,
//   "price": (515 * 1.19),
//   "maxVolume": 100000000000
// }
'use strict';
const test = require('tape').test;

  const testedModule = require('../helper/convertAmountToVolumeHelper');

  test('convertAmountToVolumeHelper - Price levels', function(assert){
    assert.plan(6);
    assert.equal(testedModule(12.7, 0), 100, 'cycle consumption = 0, 12.7 CFA');
    assert.equal(testedModule(1270, 0), 10000, 'cycle consumption = 0, 1270 CFA');
    assert.equal(testedModule(12.7, 1000), 100, 'cycle consumption = 1000, 12.7 CFA');
    assert.equal(testedModule(32.1, 11000), 100, 'cycle consumption = 11000, 32.1 CFA');
    assert.equal(testedModule(51.5, 42000), 100, 'cycle consumption = 42000, 51.5 CFA');
    assert.equal(testedModule(61.285, 55000), 100, 'cycle consumption = 55000, 61.285 CFA');
  });

  test('convertAmountToVolumeHelper - Price levels - edge cases', function(assert) {
    assert.plan(3);

    assert.equal(testedModule(300, 9990), 940, 'cycle consumption = 9990, 300 CFA');
    assert.equal(testedModule(300, 39990), 586, 'cycle consumption = 39990, 300 CFA');
    assert.equal(testedModule(300, 49990), 491, 'cycle consumption = 49990, 300 CFA');
  });

  test('convertAmountToVolumeHelper - Price levels', function(assert){
    assert.plan(9);

    assert.equal(testedModule(12.7, 0), 100, 'cycle consumption = 0, 12.7 CFA');
    assert.equal(testedModule(127, 0), 1000, 'cycle consumption = 0, 127 CFA');
    assert.equal(testedModule(1591, 0), 11000, 'cycle consumption = 0, 1591 CFA');
    assert.equal(testedModule(1600, 0), 11028, 'cycle consumption = 0, 1600 CFA');
    assert.equal(testedModule(2000, 0), 12274, 'cycle consumption = 0, 2000 CFA');
    assert.equal(testedModule(5000, 0), 21619, 'cycle consumption = 0, 5000 CFA');
    assert.equal(testedModule(10000, 0), 37196, 'cycle consumption = 0, 10000 CFA');
    assert.equal(testedModule(15000, 0), 47961, 'cycle consumption = 0, 15000 CFA');
    assert.equal(testedModule(50000, 0), 105396, 'cycle consumption = 0, 50000 CFA');
  });

  test('convertAmountToVolumeHelper - Price levels - edge cases', function(assert) {
    assert.plan(3);

    assert.equal(testedModule(300, 9700), 1115, 'cycle consumption = 9990, 300 CFA');
    assert.equal(testedModule(300, 39700), 695, 'cycle consumption = 39990, 300 CFA');
    assert.equal(testedModule(300, 49700), 537, 'cycle consumption = 49990, 300 CFA');
  });

  // I know nowbody is going to add so low credit (or should not), but it's for
  // me a good way of checking
  // First step: 1 CFA = +8 liters
  test('convertAmountToVolumeHelper - First level', function(assert) {
    assert.plan(10);
    assert.equal(testedModule(1, 0), 7, 'cycle consumption = 0, 1 CFA');
    assert.equal(testedModule(2, 0), 15, 'cycle consumption = 0, 2 CFA');
    assert.equal(testedModule(3, 0), 23, 'cycle consumption = 0, 3 CFA');
    assert.equal(testedModule(4, 0), 31, 'cycle consumption = 0, 4 CFA');
    assert.equal(testedModule(5, 0), 39, 'cycle consumption = 0, 5 CFA');
    assert.equal(testedModule(6, 0), 47, 'cycle consumption = 0, 6 CFA');
    assert.equal(testedModule(7, 0), 55, 'cycle consumption = 0, 7 CFA');
    assert.equal(testedModule(8, 0), 62, 'cycle consumption = 0, 8 CFA');
    assert.equal(testedModule(9, 0), 70, 'cycle consumption = 0, 9 CFA');
    assert.equal(testedModule(10, 0), 78, 'cycle consumption = 0, 10 CFA');
  });

  // Second step: 1 CFA = +3 liters approximatively
  test('convertAmountToVolumeHelper - Second level', function(assert) {
    assert.plan(10);
    assert.equal(testedModule(1, 10000), 3, 'cycle consumption = 10000, 1 CFA');
    assert.equal(testedModule(2, 10000), 6, 'cycle consumption = 10000, 2 CFA');
    assert.equal(testedModule(3, 10000), 9, 'cycle consumption = 10000, 3 CFA');
    assert.equal(testedModule(4, 10000), 12, 'cycle consumption = 10000, 4 CFA');
    assert.equal(testedModule(5, 10000), 15, 'cycle consumption = 10000, 5 CFA');
    assert.equal(testedModule(6, 10000), 18, 'cycle consumption = 10000, 6 CFA');
    assert.equal(testedModule(7, 10000), 21, 'cycle consumption = 10000, 7 CFA');
    assert.equal(testedModule(8, 10000), 24, 'cycle consumption = 10000, 8 CFA');
    assert.equal(testedModule(9, 10000), 28, 'cycle consumption = 10000, 9 CFA');
    assert.equal(testedModule(10, 10000), 31, 'cycle consumption = 10000, 10 CFA');
  });

  // Third step: 1 CFA = +2 liters approximatively
  test('convertAmountToVolumeHelper - Third level', function(assert) {
    assert.plan(10);
    assert.equal(testedModule(1, 40000), 1, 'cycle consumption = 40000, 1 CFA');
    assert.equal(testedModule(2, 40000), 3, 'cycle consumption = 40000, 2 CFA');
    assert.equal(testedModule(3, 40000), 5, 'cycle consumption = 40000, 3 CFA');
    assert.equal(testedModule(4, 40000), 7, 'cycle consumption = 40000, 4 CFA');
    assert.equal(testedModule(5, 40000), 9, 'cycle consumption = 40000, 5 CFA');
    assert.equal(testedModule(6, 40000), 11, 'cycle consumption = 40000, 6 CFA');
    assert.equal(testedModule(7, 40000), 13, 'cycle consumption = 40000, 7 CFA');
    assert.equal(testedModule(8, 40000), 15, 'cycle consumption = 40000, 8 CFA');
    assert.equal(testedModule(9, 40000), 17, 'cycle consumption = 40000, 9 CFA');
    assert.equal(testedModule(10, 40000), 19, 'cycle consumption = 40000, 10 CFA');
  });
