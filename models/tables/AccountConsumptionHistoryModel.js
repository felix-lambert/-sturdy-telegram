let Bookshelf = require('../database').bookshelf;

// Please just put create, get, destroy when it's possible...

/* SCOPES
  byDays(qb, numberOfDays)
  consumptionSum(qb, consumptionByDay)
*/

/*
  createConsumptionHistory(consumption)
  getByAccountId(account_id, pageSize, page)
  getLastConsumptionHistory(accountId)
  getAmountByDays(accountId, numberOfDays, totalAmount)
  getAllConsumptionByDays(numberOfDays, consumptionByDay)
*/


const accountConsumtionHistory = Bookshelf.Model.extend({
  tableName: 'account_consumption_history',
  hasTimestamps: false,
  scopes: {
    byDays(qb, numberOfDays) {
      qb.where(Bookshelf.knex.raw(`timestamp > UNIX_TIMESTAMP(NOW() - INTERVAL ${numberOfDays} DAY)`));
    },
    consumptionSum(qb, consumptionByDay) {
      qb.select(Bookshelf.knex.raw(`sum(consumption) as ${consumptionByDay}`));
    }
  }
}, {
  /* with property value shorthand
     syntax, you can omit the property
     value if key matches variable
  */
  createConsumptionHistory(consumption) {
    return this.forge({
      account_id: consumption.account_id,
      timestamp: consumption.timestamp,
      index: consumption.index,
      offset: consumption.offset,
      consumption: consumption.consumption,
      meter_id: consumption.meter_id
    }).save();
  }, 
  getByAccountId(account_id, pageSize, page) {

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

  }, 
  getLastConsumptionHistory(accountId) {
    return this.where({'account_id': parseInt(accountId)})
      .query(function(qb) {
        qb.orderBy('id', 'DESC').limit(1);
      }).fetch();
  }, 
  getAmountByDays(accountId, numberOfDays, totalAmount) {
    let account_id = parseInt(accountId);
    return this.forge()
      .consumptionSum(totalAmount)
      .where({account_id})
      .byDays(numberOfDays)
      .fetch();
  }, 
  getAllConsumptionByDays(numberOfDays, consumptionByDay) {
    return new Promise((resolve, reject) => {
      return this.forge()
      .consumptionSum(consumptionByDay)
      .byDays(numberOfDays)
      .fetchAll()
      .then((res) => {
        return resolve(res.models[0].attributes);
      }).catch((err) => {
        return reject(err);
      });
    });
  }
});

module.exports = Bookshelf.model('accountConsumptionHistory', accountConsumtionHistory);
