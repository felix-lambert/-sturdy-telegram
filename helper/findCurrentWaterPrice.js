'use strict';

const {WATER_PRICES} = require('../config/constants');

module.exports = function findCurrentWaterPrice(cycleCumulatedConsumption) {
  // Find current price level based on cycle cumulated consumption
  let level             = 0;
  let currentWaterPrice = WATER_PRICES[0].price;
  while (cycleCumulatedConsumption > WATER_PRICES[level].maxVolume) {
    level++;
    currentWaterPrice = WATER_PRICES[level].price;
  }
  return currentWaterPrice;
};
