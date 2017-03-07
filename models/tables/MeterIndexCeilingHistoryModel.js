let Bookshelf = require('../database').bookshelf;

/*
  create(meter_id, index_ceiling)
  getAllAsArrayByMeterId(meter_id)
*/

/**
 * Represents a MeterIndexCeilingHistory instance
 * @class MeterIndexCeilingHistory
 * @memberof Common#
 */
let meterIndexCeilingHistory = Bookshelf.Model.extend({
  tableName: 'meter_index_ceiling_history',
  hasTimestamps: false
}, {
  /* 
  * with property value shorthand
  * syntax, you can omit the property
  * value if key matches variable
  */
  create(meter_id, index_ceiling) {
    const timestamp = Date.now() / 1000;
    return this.forge({
      meter_id, index_ceiling, timestamp
    }).save();
  }, 

  getAllAsArrayByMeterId(meter_id) {
    return new Promise((resolve, reject) => {
      this.forge().where({meter_id}).fetchAll()
        .then(function(data) {
          let result = [];
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

module.exports = Bookshelf.model('meterIndexCeilingHistory', meterIndexCeilingHistory);
