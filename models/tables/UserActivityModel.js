let Bookshelf   = require('../database').bookshelf;
/**
 * Represents a userHistory instance
 * @class userHistory
 * @memberof Common#
 */
let userHistory = Bookshelf.Model.extend({
  tableName: 'user_history',
  hasTimestamps: false
}, {
  create,
  getAllAsArrayByUserId,
  getAllAsArray,
  getByResponseCode,
  getByUserIdByDate
});

module.exports = Bookshelf.model('userHistory', userHistory);

function create(interceptorData) {
  const {
    userId : user_id,
    timestamp,
    endPoint : endpoint,
    verb,
    responseCode : response_code,
    reqParams,
    responseTime : response_time
  } = interceptorData;

  const parameter = Object.keys(reqParams).length ? JSON.stringify(reqParams) : null;

  return this.forge({
    user_id, timestamp, endpoint, verb, response_code, parameter, response_time
  }).save();
}

function getAllAsArrayByUserId(user_id, pageSize = 50, page = 1) {
  let self = this;
  return new Promise(function(resolve, reject) {
    self.forge()
      .where({user_id})
      .orderBy('-timestamp')
      .fetchPage({
        pageSize: pageSize,
        page: page
      }).then((activity) => {
      return activity.length > 0 ? resolve(activity) : reject('No data for next row');
    }).catch(function(err) {
      return reject(err);
    });
  });
}

function getAllAsArray(pageSize = 50, page = 1) {
  let self = this;
  return new Promise(function(resolve, reject) {
    self.forge()
      .orderBy('-timestamp')
      .fetchPage({
        pageSize: pageSize,
        page: page
      }).then((activity) => {
      return activity.length > 0 ? resolve(activity) : reject('No data for next row');
    }).catch(function(err) {
      return reject(err);
    });
  });
}

function getByResponseCode(response_code) {
  return this.where({response_code}).fetchAll();
}

function getByUserIdByDate(userId, beginningTimestamp, endTimestamp) {
  return this
    .forge()
    .where({'user_id': userId})
    .query(function(qb) {
      qb.whereBetween('timestamp', [beginningTimestamp, endTimestamp]);
    })
    .fetchAll();
}
