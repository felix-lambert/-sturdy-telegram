let Bookshelf = require('../database').bookshelf;

/*
  create(json, payload, type_of_message, meter_id)
  getByRadioSerial(serial)
  getAllAsArrayByMeterId(meter_id, pageSize = 50, page = 1)
*/

/**
 * Represents a MessageToMeter instance
 * @class MessageToMeter
 * @memberof Common#
 */
let messageToMeter = Bookshelf.Model.extend({
  tableName: 'message_to_meter',
  hasTimestamps: false,
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  /**
   * Save a message from a meter in message_to_meter table
   * @param  {JSON} MessageToMeterJson         [description]
   * @returns {Promise}                 [description]
   * @memberof MeterMessage#
   * @static
   */
  create(json, payload, type_of_message, meter_id) {
    let message_base_64 = JSON.stringify(json);
    let timestamp = Date.now() / 1000;
    return this.forge({
      type_of_message, message_base_64, payload, meter_id, timestamp
    }).save();
  }, 

  getByRadioSerial(serial) {
    return this.where({'serial': serial}).fetch();
  }, 

  getAllAsArrayByMeterId(meter_id, pageSize = 50, page = 1) {
    return new Promise((resolve, reject) => {
      this.forge()
        .orderBy('-timestamp')
        .where({meter_id})
        .fetchPage({
          pageSize,
          page
        }).then(function(data) {
          if (data.models.length > 0) {
            return resolve(data);
          } else {
            return reject();
          }
        })
        .catch(function(err) {
          return reject(err);
        });
    });
  }
});

module.exports = Bookshelf.model('messageToMeter', messageToMeter);
