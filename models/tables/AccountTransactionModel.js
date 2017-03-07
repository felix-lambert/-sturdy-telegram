let Bookshelf             = require('../database').bookshelf;
let findCurrentWaterPrice = require('../../helper/findCurrentWaterPrice');

require('./AccountModel');

/* SCOPES
 byDays(qb, numberOfDays)
 byNegativeOrPositiveAmount(qb, comparator)
 amountSum(qb, amount)
 */

/*
 create(account_id, amount, origin, timestamp, current_credit)
 getAmountByAccountId(accountId, comparator, pageSize, page)
 getById(id)
 getAmountByDays(accountId, numberOfDays, comparator, amount)
 getLastPaymentDate(accountId)
 getAllAmountByDays(numberOfDays, comparator, totalAmount)
 */

// Please just put create, get, destroy when it's possible...
let accountTransaction = Bookshelf.Model.extend({
  tableName: 'account_transaction',
  hasTimestamps: false,
  scopes: {
    byDays(qb, numberOfDays) {
      qb.where(Bookshelf.knex.raw(`timestamp > UNIX_TIMESTAMP(NOW() - INTERVAL ${numberOfDays} DAY)`));
    },
    byNegativeOrPositiveAmount(qb, comparator) {
      qb.where(Bookshelf.knex.raw(`amount ${comparator} 0`));
    },
    amountSum(qb, amount) {
      qb.select(Bookshelf.knex.raw(`sum(amount) as ${amount}`));
    }
  }
}, {
  /* with property value shorthand
   syntax, you can omit the property
   value if key matches variable
   */
  create({
    accountId : account_id,
    amount,
    origin,
    timestamp,
    currentCredit : current_credit,
    consumptionHistoryId : consumption_history_id,
    cycleCumulatedConsumption,
    consumption
  }) {
    const current_water_price = findCurrentWaterPrice(cycleCumulatedConsumption + (consumption || 0));
    return this.forge({
      account_id, timestamp, origin, amount, current_credit, consumption_history_id, current_water_price
    }).save();
  },

  getAmountByAccountId(accountId, comparator, pageSize, page) {
    return new Promise((resolve, reject) => {
      this.forge()
        .where({'account_id': accountId})
        .orderBy('-timestamp')
        .where('amount', comparator, 0)
        .fetchPage({
          pageSize: pageSize,
          page: page
        }).then((sms) => {
        return sms.length > 0 ? resolve(sms) : reject('No data for next row');
      }).catch(function(err) {
        return reject(err);
      });
    });
  },

  getById(id) {
    return this.where({'id': id}).fetch();
  },

  getAmountByDays(accountId, numberOfDays, comparator, amount) {
    return new Promise((resolve, reject) => {
      let account_id = parseInt(accountId);
      return this.forge()
        .amountSum(amount)
        .where({account_id})
        .byNegativeOrPositiveAmount(comparator)
        .byDays(numberOfDays)
        .fetchAll()
        .then((res) => {
          return resolve(res.models[0].attributes);
        }).catch((err) => {
          return reject(err);
        });

    });
  },

  getLastPaymentDate(accountId) {

    return new Promise((resolve, reject) => {
      let account_id = parseInt(accountId);
      return this.where({account_id})
        .query(function(qb) {
          qb.orderBy('id', 'DESC').limit(1);
        }).fetch()
        .then((res) => {
          let obj             = {};
          obj.lastPaymentDate = res.attributes;
          return resolve(obj);
        }).catch((err) => {
          return reject(err);
        });
    });
  },

  getAllAmountByDays(numberOfDays, comparator, totalAmount) {

    // Output >
    /*
     select
     amount as ${totalAmount}
     FROM
     account_transaction
     WHERE
     timestamp > UNIX_TIMESTAMP(NOW() - INTERVAL ${numberOfDays} DAY)
     AND account_id NOT IN (16)
     AND
     amount ${comparator} 0
     AND(
     origin = 'fromConsole'
     OR
     origin = 'OrangeMoney')*/
    return this.forge()
      .amountSum(totalAmount)
      .byNegativeOrPositiveAmount(comparator)
      .byDays(numberOfDays)
      .query('where', 'account_id', '!=', 16)
      .where(function() {
        this.where('origin', 'fromConsole').orWhere('origin', 'OrangeMoney');
      }).fetch();
  }
});

module.exports = Bookshelf.model('accountTransaction', accountTransaction);
