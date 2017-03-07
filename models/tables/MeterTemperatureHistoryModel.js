let Bookshelf = require('../database').bookshelf;

/*
  create(meter_id, temperature, timestamp)
  getByMeterId(meter_id)
  getAllAsArrayByMeterId(meter_id)
*/

/**
 * Represents a MeterTemperatureHistory instance
 * @class MeterTemperatureHistory
 * @memberof Common#
 */
let meterTemperatureHistory = Bookshelf.Model.extend({
  tableName: 'meter_temperature_history',
  hasTimestamps: false,
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  create(meter_id, temperature, timestamp) {
    return this.forge({
      meter_id, temperature, timestamp
    }).save();
  }, 

  getByMeterId(meter_id) {
    return this.where({meter_id}).fetch();
  }, 

  getAllAsArrayByMeterId(meter_id) {
    return new Promise((resolve, reject) => {
      this.forge().where({meter_id}).fetchAll()
        .then((data) => {
          let result = [];
          data.forEach((res) => {
            result.push(res.attributes);
          });
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

});

module.exports = Bookshelf.model('meterTemperatureHistory', meterTemperatureHistory);
