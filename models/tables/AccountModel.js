let Bookshelf = require('../database').bookshelf;

/* SCOPES
  accountCount(qb, asName)
  currentCreditSum(qb)
*/

/* INSTANCES
  updateCycleCumulatedConsumption(cycle_cumulated_consumption)
  addToCycleCumulatedConsumption(newConsumption)
  updateCyclePaidSubscription(cycle_paid_subscription)
  meters()
  transactions()
*/

/*
  resetCycles(id)
  updateWarningMessage(id, warning_message_sent)
  destroyAccount(id)
  update(id, obj)
  create(obj)
  getAllAsArray()
  getById(id)
  getByIdWithMeterAndTransaction(id)
  getByEmail(contact_email)
  addCredit(accountId, creditToAdd)
  getByPhoneNumber(contact_phone_number)
  updateCredit(accountId, current_credit)
  updateCycleCumulatedConsumption(cycle_cumulated_consumption)
  updatePaymentEnabled(accountId, payment_enabled)
  getGlobalCurrentBalance()
  nbLowCredit(lowCreditNb)
*/

const account = Bookshelf.Model.extend({
  tableName: 'account',
  hasTimestamps: true,
  
  // instance functions
  updateCycleCumulatedConsumption(cycle_cumulated_consumption) {
    return this.save({cycle_cumulated_consumption}, {patch: true});
  },
  
  addToCycleCumulatedConsumption(newConsumption) {
    return this.updateCycleCumulatedConsumption(
      newConsumption + this.get('cycle_cumulated_consumption')
    );
  },
  updateCyclePaidSubscription(cycle_paid_subscription) {
    return this.save({cycle_paid_subscription}, {patch: true});
  },
  meters() {
    return this.hasMany('meter');
  },
  transactions() {
    return this.hasMany('accountTransaction', 'account_id');
  },
  scopes: {
    accountCount(qb, asName) {
      qb.select(Bookshelf.knex.raw(`count(id) as ${asName}`));
    },
    currentCreditSum(qb) {
      qb.select(Bookshelf.knex.raw('sum(current_credit) as currentCreditSum'));
    },
  }
}, {
  /* with property value shorthand
   syntax, you can omit the property
   value if key matches variable
   */
  //static functions
  resetCycles(id) {
    return this.forge({id})
      .save({
        cycle_cumulated_consumption: 0,
        cycle_paid_subscription: 0
      }, {patch: true});
  },
  updateWarningMessage(id, warning_message_sent) {
    return this.forge({id})
      .save({warning_message_sent}, {patch: true});

  },
  
  destroyAccount(id) {
    return this.forge({id}).destroy();
  },

  update(id, obj) {
    return this.forge({id})
      .save({
        contact_email: obj.contact_email,
        utility_identifier: obj.utility_identifier,
        first_name: obj.first_name,
        last_name: obj.last_name,
        address: obj.address,
        zipcode: obj.zipcode,
        city: obj.city,
        test_account: obj.test_account || 0,
        payment_enabled: obj.payment_enabled,
        gps_lat: obj.gps_lat,
        gps_lon: obj.gps_lon,
        country_code: obj.country_code,
        contact_phone_number: obj.contact_phone_number,
        activation_date: obj.activation_date,
        deactivation_date: obj.deactivation_date,
        current_credit: obj.current_credit,
        cycle_cumulated_consumption: obj.cycle_cumulated_consumption,
        cycle_date: obj.cycle_date,
        subscription_daily_fee: obj.subscription_daily_fee,
        subscription_fee: obj.subscription_fee,
        installation_date: obj.installation_date || null,
        payement_activation_date: obj.payement_activation_date || null
      }, {patch: true});
  },

  create(obj) {
    return this.forge({
      contact_email: obj.contact_email,
      utility_identifier: obj.utility_identifier,
      first_name: obj.first_name,
      last_name: obj.last_name,
      address: obj.address,
      zipcode: obj.zipcode,
      city: obj.city,
      gps_lat: obj.gps_lat,
      gps_lon: obj.gps_lon,
      payment_enabled: obj.payment_enabled,
      test_account: obj.test_account || 0,
      country_code: obj.country_code,
      contact_phone_number: obj.contact_phone_number,
      activation_date: obj.activation_date,
      deactivation_date: obj.deactivation_date,
      current_credit: obj.current_credit,
      cycle_date: obj.cycle_date,
      subscription_daily_fee: obj.subscriptionDailyFee,
      subscription_fee: obj.subscriptionFee,
      installation_date: obj.installation_date || null,
      payement_activation_date: obj.payement_activation_date || null,
      test_account: obj.test_account || 0
    }).save();
  },

  getAllAsArray() {
    return this.forge().fetchAll({
      withRelated: ['meters']
    });
  },

  getById(id) {
    return this.where({id}).fetch();
  },

  getByIdWithMeterAndTransaction(id) {
    return new Promise((resolve, reject) => {
      return this.where({id}).fetch({
        withRelated: [{
          'transactions': function(qb) {
            qb.where('amount', '>', 0).limit(1).orderBy('id', 'DESC');
          }
        }, {
          'meters': function(qb) {
            qb.where('valve_status', '=', 1);
        }}]
      })
      .then((res) => {
        let obj = {};
        obj.accountMeter = res;
        resolve(obj);
      })
      .catch(function(err) {
        reject(err);
      });
    });
  },
  
  getByEmail(contact_email) {
    return this.where({contact_email}).fetch();
  },

  // This can be simplified
  addCredit(accountId, creditToAdd) {
    return new Promise((resolve, reject) => {
      this.getById(accountId)
        .then((model) => {
          if (!model) {
            throw ReferenceError('Account does not exist');
          }
          let oldCredit = model.get('current_credit');
          if (!oldCredit) {
            oldCredit = 0;
          }
          const current_credit = (oldCredit + creditToAdd).toFixed(8);
          model.save({current_credit}, {patch: true})
            .then(() => {
              return resolve(model);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getByPhoneNumber(contact_phone_number) {
    return this.where({contact_phone_number}).fetch();
  },

  updateCredit(accountId, current_credit) {
    return new Promise((resolve, reject) => {
      this.getById(accountId)
        .then((model) => {
          if (!model) {
            throw ReferenceError('Account does not exist');
          }
          model.save({current_credit}, {patch: true})
            .then(() => {
              resolve(model);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  
  updateCycleCumulatedConsumption(cycle_cumulated_consumption) {
    return this.save({cycle_cumulated_consumption}, {patch: true});
  },

  updatePaymentEnabled(accountId, payment_enabled) {
    return new Promise((resolve, reject) => {
      this.getById(accountId)
        .then((model) => {
          if (!model) {
            throw ReferenceError('Account does not exist');
          }
          model.save({payment_enabled}, {patch: true})
            .then(() => {
              resolve(model);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getGlobalCurrentBalance() {
    return new Promise((resolve, reject) => {
      this.forge()
        .currentCreditSum()
        .where('test_account', 0)
        .fetchAll()
        .then((res) => {
          return resolve(res.models[0].attributes);
        }).catch((err) => {
          return reject(err);
        });
    });
  },
  
  nbLowCredit(lowCreditNb) {
    return new Promise((resolve, reject) => {
      Bookshelf.knex('account AS a')
        .count(`first_name as ${lowCreditNb}`)
        .where({'warning_message_sent': 1})
        .join('meter AS m', 'm.account_id', 'a.id')
        .where({ 'm.valve_status': 1})
        .then((total) => {
          return resolve(total[0]);
        }).catch((err) => {
          return reject(err);
        });
    });
  }
});

module.exports = Bookshelf.model('account', account);

