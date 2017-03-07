let Bookshelf = require('../database').bookshelf;

// Please just put create, get, destroy when it's possible...
const accountEvent = Bookshelf.Model.extend({
  tableName: 'account_event',
  hasTimestamps: false,
}, {
  create,
  getAllAsArray,
  getAllAsArrayByAccountId,
  getByEventType
});

module.exports = Bookshelf.model('accountEvent', accountEvent);

function create(account_id, timestamp, event_type, comment) {
  return this.forge({
    account_id,
    timestamp,
    event_type,
    comment
  }).save();
}

function getAllAsArray(pageSize = 50, page = 1) {
  return this
    .forge()
    .orderBy('-timestamp')
    .fetchPage({
      pageSize,
      page
    });
}

function getAllAsArrayByAccountId(account_id, pageSize = 50, page = 1) {
  return this
    .where({account_id})
    .orderBy('-timestamp')
    .fetchPage({
      pageSize,
      page
    });
}

function getByEventType(event_type, pageSize = 50, page = 1) {
  return this
    .where({event_type})
    .orderBy('-timestamp')
    .fetchPage({
      pageSize,
      page
    });
}
