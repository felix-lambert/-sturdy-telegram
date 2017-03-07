let Bookshelf = require('../database').bookshelf;

/*
  create(meter_id, index, offset, timestamp) 
  getByRadioSerial(serial)
  getAllAsArrayByMeterId(meter_id)
*/

/**
 * Represents a MeterIndexHistory instance
 * @class MeterIndexHistory
 * @memberof Common#
 */
let meterIndexHistory = Bookshelf.Model.extend({
  tableName: 'meter_index_history',
  hasTimestamps: false
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  create(meter_id, index, offset, timestamp) {
    return this.forge({
      meter_id, index, offset, timestamp
    }).save();
  }, 

  getAllAsArrayByMeterId(meter_id) {
    return new Promise((resolve, reject) => {
      this.forge().where({meter_id}).fetchAll()
        .then(function(data) {
          const result = [];
          data.forEach(function(res) {
            result.push(res.attributes);
          });
          return resolve(result);
        })
        .catch(function(err) {
          return reject(err);
        });
    });
  }

});

module.exports = Bookshelf.model('meterIndexHistory', meterIndexHistory);
