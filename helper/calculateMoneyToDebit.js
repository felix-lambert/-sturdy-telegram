'use strict';

// The first 10 cubic meters (10000L) are charged 127 CFA/cubic meter
// From 10 cubic meter to 40 cubic meter, we charge 321 CFA/cubic meter
// From 40 cubic meter to 50 cubic meter, we charge 515 CFA/cubic meter
// Above 50 cubic meter, we charge (515 * 1.19) CFA/cubic meter

const {WATER_PRICES} = require('../config/constants');

module.exports = function calculateMoneyToDebit(consumption, cycleCumulatedConsumption) {

  let level        = findCurrentLevel(cycleCumulatedConsumption);
  let moneyToDebit = convertVolumeToMoneyLevels(consumption, cycleCumulatedConsumption, level);

  // We return the credit that is beeing deduced each time there is an augmentation of the consumption
  return moneyToDebit;
};

// the arrow function is just the (volume, level) => volume * WATER_PRICES[level].price / 1000 part, and that function reference happens to be assigned to the variable convertVolumeToMoney
// Volume is in L, price in $/m^3, hence the 1000 factor
let convertVolumeToMoney = (volume, level) => volume * WATER_PRICES[level].price / 1000;


let convertVolumeToMoneyLevels = (volume, cycleCumulatedConsumption, level) => {
  if (volume + cycleCumulatedConsumption <= WATER_PRICES[level].maxVolume) {
    //If the volume remains in the current price level
    return convertVolumeToMoney(volume, level);
  } else {
    //If the volume makes the cycleCumulatedConsumption change price level
    const volumeLevelUp      = volume + cycleCumulatedConsumption - WATER_PRICES[level].maxVolume;
    const volumeCurrentLevel = volume - volumeLevelUp;

    // JS does not handle well sum of float, so convert it to int for sum then divide back to float
    const float_p = 100000;
    return Math.floor(convertVolumeToMoney(volumeCurrentLevel, level) * float_p + convertVolumeToMoneyLevels(volumeLevelUp, cycleCumulatedConsumption + volumeCurrentLevel, level + 1) * float_p) / float_p;
  }
};

let findCurrentLevel = (cycleCumulatedConsumption) => {
  // Find current price level based on cycle cumulated consumption
  let level = 0;
  while (cycleCumulatedConsumption > WATER_PRICES[level].maxVolume) {
    level++;
  }
  return level;
};

