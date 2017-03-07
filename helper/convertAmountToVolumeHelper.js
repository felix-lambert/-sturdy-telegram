'use strict';

// The first 10 cubic meters (10000L) are charged 127 CFA/cubic meter
// From 10 cubic meter to 40 cubic meter, we charge 321 CFA/cubic meter
// From 40 cubic meter to 50 cubic meter, we charge 515 CFA/cubic meter
// Above 50 cubic meter, we charge (515 * 1.19) CFA/cubic meter

const {WATER_PRICES} = require('../config/constants');

let findCurrentLevel = (cycleCumulatedConsumption) => {
  // Find current price level based on cycle cumulated consumption
  let level = 0;
  while (cycleCumulatedConsumption > WATER_PRICES[level].maxVolume) {
    level++;
  }
  return level;
};

// Using 'toPrecision(12)' leaves trailing zeros which 'parseFloat()' removes
// Precision refers to the number of digits you want to preserve after the decimal point during addition
let strip = (number) => parseFloat(number.toPrecision(12));

// Volume is in L, price in $/m^3, hence the 1000 factor
// JS does not handle well sum of float,
let convertMoneyToVolume = (amount, level) => strip(amount * 1000 / WATER_PRICES[level].price);
 
let convertMoneyToVolumeLevels = (amount, cycleCumulatedConsumption, level) => {
  // Estimated volume if price level remains the same for all amount to be converted
  const newVolume = convertMoneyToVolume(amount, level);
  if (amount <= 0) {
    return 0;
  }
  if (newVolume) {
    if (strip(newVolume + cycleCumulatedConsumption) <= WATER_PRICES[level].maxVolume) {
      // If this volume reaches the price level change
      return convertMoneyToVolume(amount, level);
    } else {
      // Find part of volume allowed at current price
      const volumeCurrentLevel = WATER_PRICES[level].maxVolume - cycleCumulatedConsumption;
      // Find credit left for next price level
      const creditLevelUp = strip(amount - (volumeCurrentLevel * WATER_PRICES[level].price / 1000));
      // Find amount of water for next level (recursive)
      const volumeLevelUp = convertMoneyToVolumeLevels(creditLevelUp, cycleCumulatedConsumption + volumeCurrentLevel, level + 1);
      return strip(volumeCurrentLevel + volumeLevelUp);
    }
  }
};

module.exports = function convertAmountToVolume(amount, cycleCumulatedConsumption) {
  let level = findCurrentLevel(cycleCumulatedConsumption);
  let newVolume = convertMoneyToVolumeLevels(amount, cycleCumulatedConsumption, level);
  return Math.floor(newVolume);
};

