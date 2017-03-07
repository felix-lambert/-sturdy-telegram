let Bookshelf = require('../database').bookshelf;


/*
  create(messageJsonData, meter_id)
  getAllAsArrayByRadioIdentifier(radio_identifier, pageSize = 50, page = 1)
*/

/**
 * Represents a MessageFromMeter instance
 * @class MessageFromMeter
 * @memberof Common#
 */
let messageFromMeter = Bookshelf.Model.extend({
  tableName: 'message_from_meter',
  hasTimestamps: false
}, {

  /* with property value shorthand
    syntax, you can omit the property
    value if key matches variable
  */
  /**
   * Save a message from a meter in message_from_meter table
   * @param  {JSON} messageJsonData         [description]
   * @returns {Promise}                 [description]
   * @memberof MeterMessage#
   * @static
   */
  create(messageJsonData, meter_id) {
    return this.forge({
      radio_identifier: messageJsonData.radioIdentifier,
      timestamp: messageJsonData.timestamp,
      message: messageJsonData.message,
      decodedData: messageJsonData.decodedData,
      meter_id
    }).save();
  }, 

  getAllAsArrayByRadioIdentifier(radio_identifier, pageSize = 50, page = 1) {
    return new Promise((resolve, reject) => {
      this.forge()
        .orderBy('-timestamp')
        .where({radio_identifier})
        .fetchPage({
          pageSize,
          page
        })
        .then((data) => {
          let result = [];
          if (data.models.length > 0) {
            data.forEach(function(res) {
              result.push(
                {
                  decodedData: res.get('decodedData'),
                  timestamp: res.get('timestamp'),
                  message: res.get('message')
                }
              );
            });
          }
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }
});

module.exports = Bookshelf.model('messageFromMeter', messageFromMeter);
