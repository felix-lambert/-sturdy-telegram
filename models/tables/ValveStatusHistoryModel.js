let Bookshelf = require('../database').bookshelf;

require('./AccountModel');

/* SCOPES
  byDays(qb, numberOfDays)
  valveStateSum(qb, countValveStatus)
*/
/*
  create(obj)
  getByAccountId(account_id)
  getLastValveStatusHistory(account_id)
  getAllClosedValveByDays(numberOfDays, countValveStatus)
  closedValveTime(numberOfDays, countValveStatus)
*/
let valveStatusHistory = Bookshelf.Model.extend({
  tableName: 'valve_status_history',
  hasTimestamps: false,
  scopes: {
    byDays(qb, numberOfDays) {
      qb.where(Bookshelf.knex.raw(`timestamp > UNIX_TIMESTAMP(NOW() - INTERVAL ${numberOfDays} DAY);`));
    },
    valveStateSum(qb, countValveStatus) {
      qb.select(Bookshelf.knex.raw(`count(valve_status) as ${countValveStatus}`));
    }
  }
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  
  // Please just put create, get, destroy when it's possible...
  create(obj) {
    return this.forge({
      account_id: obj.account_id,
      meter_id: obj.meter_id,
      timestamp: obj.timestamp,
      valve_status: obj.valve_status
    }).save();
  }, 

  getByAccountId(account_id) {
    return this.where({account_id}).fetchAll();
  }, 

  getLastValveStatusHistory(account_id) {
    return this.where({account_id})
      .query(function(qb) {
        qb.orderBy('id', 'DESC').limit(1);
      }).fetch();
  }, 

  getAllClosedValveByDays(numberOfDays, countValveStatus) {
    return new Promise((resolve, reject) => {
      return this.forge()
        .valveStateSum(countValveStatus)
        .where({'valve_status': 0})
        .byDays(numberOfDays)
        .fetchAll()
        .then((res) => {
          return resolve(res.models[0].attributes);
        }).catch((err) => {
          return reject(err);
        });
    });
  }, 

  closedValveTime(numberOfDays, countValveStatus) {
    return new Promise((resolve) => {

      /* We are sit­u­a­tion where one just needs to write a raw query to extract data. 
      One such sit­u­a­tion is when you have large queries */
      // I'm using new feature (back tick) of ES6 to write query in multiple lines
      return Bookshelf.knex.raw(
        `
          select 
            sum(timestampdiff(hour, FROM_UNIXTIME(closure_start), FROM_UNIXTIME(closure_stop))) ${countValveStatus}
            FROM (
              SELECT t1.account_id, t1.timestamp AS closure_start, 
              (
                SELECT IFNULL ((SELECT min(t2.timestamp) 
                FROM valve_status_history t2 
                WHERE t2.timestamp > t1.timestamp 
                AND t2.valve_status = 1 
                AND t2.account_id = t1.account_id 
                GROUP BY t1.account_id), UNIX_TIMESTAMP(NOW()))
              ) AS closure_stop, 
            WEEK(FROM_UNIXTIME(t1.timestamp), 3) AS week_number 
            FROM valve_status_history t1 
            WHERE t1.valve_status = 0 
            ORDER BY account_id, t1.timestamp
            ) t
            WHERE closure_start > UNIX_TIMESTAMP(NOW() - INTERVAL ${numberOfDays} DAY)
        `
      ).then((res) => {
        resolve(res[0][0]);
      });
    });
  }

});

module.exports = Bookshelf.model('valveStatusHistory', valveStatusHistory);
