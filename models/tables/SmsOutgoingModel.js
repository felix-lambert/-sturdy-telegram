let Bookshelf = require('../database').bookshelf;

/*
  create(account_id, recipient, message, timestamp, type)
  getAllAsArray(pageSize = 50, page = 1)
  getAllAsArrayByAccountId(account_id, pageSize, page)
*/

/**
 * Represents a SmsOutgoing instance
 * @class SmsOutgoing
 * @member of Common#
 */
let smsOutgoing = Bookshelf.Model.extend({
  tableName: 'sms_outgoing',
  hasTimestamps: false
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  create(account_id, recipient, message, timestamp, type) {
    message = JSON.stringify(message);
    /* with property value shorthand
     *syntax, you can omit the property
     *  value if key matches variable
     */
    return this.forge({
      account_id, recipient, message, timestamp, type
    }).save();
  }, 

  getAllAsArray(pageSize = 50, page = 1) {
    return new Promise((resolve, reject) => {
      this.forge()
        .orderBy('-id')
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

  getAllAsArrayByAccountId(account_id, pageSize, page) {
    return new Promise((resolve, reject) => {
      this.forge()
        .where({account_id})
        .orderBy('-timestamp')
        .fetchPage({
          pageSize, page
        }).then((sms) => {
          return sms.length > 0 ? resolve(sms) : reject('No data for next row');
        }).catch((err) => {
          return reject(err);
        });
    });
  }
});

module.exports = Bookshelf.model('smsOutgoing', smsOutgoing);
