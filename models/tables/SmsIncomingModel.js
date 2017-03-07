let Bookshelf = require('../database').bookshelf;


/*
  create(account_id, sender, message, operator_id, timestamp, status)
  getAllAsArrayByAccountId(account_id, pageSize, page)
  getAllAsArray(pageSize, page)
*/
/**
 * Represents a SmsIncoming instance
 * @class SmsIncoming
 * @memberof Common#
 */
let smsIncoming = Bookshelf.Model.extend({
  tableName: 'sms_incoming',
  hasTimestamps: false
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  create(account_id, sender, message, operator_id, timestamp, status) {
    message = JSON.stringify(message);
    return this.forge({
      account_id, sender, message, operator_id, timestamp, status
    }).save();
  }, 

  getAllAsArrayByAccountId(account_id, pageSize, page) {
    return new Promise((resolve, reject) => {
      this.forge()
        .where({account_id})
        .orderBy('-timestamp')
        .fetchPage({
          pageSize: pageSize,
          page: page
        }).then((sms) => {
        return sms.length > 0 ? resolve(sms) : reject('No data for next row');
      }).catch((err) => {
        return reject(err);
      });
    });
  }, 

  getAllAsArray(pageSize, page) {
    return new Promise((resolve, reject) => {
      this.forge()
        .orderBy('-timestamp')
        .fetchPage({
          pageSize:pageSize,
          page: page
        }).then((sms) => {
        return sms.length > 0 ? resolve(sms) : reject('No data for next row');
      }).catch((err) => {
        return reject(err);
      });
    });
  }
});

module.exports = Bookshelf.model('smsIncoming', smsIncoming);
