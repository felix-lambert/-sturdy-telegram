let Bookshelf = require('../database').bookshelf;

/* INSTANCES
  update(obj)
*/

/*
  create(account_id, phone_number)
  getAllAsArrayByAccountId(accountId)
  getAllAsArray()
  getByPhoneNumber(phone_number)
  getById(id)
  destroy(id)
*/

/**
 * Represents a SmsIncoming instance
 * @class attachedPhoneNumbers
 * @memberof Common#
 */
let accountPhoneNumber = Bookshelf.Model.extend({
  tableName: 'account_phone_number',
  hasTimestamps: false,
  update(obj) {
    return this.save({
      account_id: obj.account_id,
      phone_number: obj.phone_number
    }, {patch: true});
  }
}, {
  /* with property value shorthand
    syntax, you can omit the property
    value if key matches variable
  */
  create(account_id, phone_number) {
    return this.forge({
      account_id, phone_number
    }).save();
  },
  getAllAsArrayByAccountId(accountId) {
    return this.forge().where({'account_id': accountId}).fetchAll();
  },
  getAllAsArray() {
    return new Promise((resolve, reject) => {
      this.forge().fetchAll()
        .then((results) => {
          return resolve(results);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },
  getByPhoneNumber(phone_number) {
    return this.where({phone_number}).fetch();
  },

  getById(id) {
    return this.where({'id': id}).fetch();
  },
  destroy(id) {
    return this.forge({id: id}).destroy();
  }
});

module.exports = Bookshelf.model('accountPhoneNumber', accountPhoneNumber);
