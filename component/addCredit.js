const convertAmountToVolume                          = require('./../helper/convertAmountToVolumeHelper');
const {CURRENT_CREDIT_WARNING_LIMIT, ACCOUNT_EVENT} = require('../config/constants');
let MeterModel                                       = require('../models/tables/MeterModel');
let AccountModel                                     = require('../models/tables/AccountModel');
let AccountTransactionModel                          = require('../models/tables/AccountTransactionModel');
let accountEvent                                     = require('../controller/accountEvent');

// Add some logs here
module.exports = function addCreditAndUpdateVolume(accountId, creditToAdd, origin = 'unknown') {
  return new Promise(function(resolve, reject) {
    // We can do only one request here
    MeterModel.getByAccountId(accountId).then((meter) => {
      AccountModel.getById(accountId).then((account) => {
        if (!account) {
          return reject({status: 400, error: 'MeterNotAttached'});
        }
        let currentCredit;
        currentCredit     = account.get('current_credit') ? account.get('current_credit') : 0;
        currentCredit     = currentCredit + creditToAdd;
        const transactionData = {
          accountId : account.get('id'),
          amount : creditToAdd,
          origin: origin,
          timestamp : Math.floor(new Date() / 1000),
          currentCredit : currentCredit,
          cycleCumulatedConsumption : account.get('cycle_cumulated_consumption'),
        };
        let PromisesToRun = [
          AccountTransactionModel.create(transactionData),
          AccountModel.addCredit(accountId, creditToAdd),
        ];

        //Events only for credit
        if (creditToAdd > 0) {
          PromisesToRun.push(
            accountEvent.create(accountId, ACCOUNT_EVENT.CREDIT_ADDED, {creditAdded: creditToAdd})
          );
        }

        if (currentCredit > CURRENT_CREDIT_WARNING_LIMIT) {
          PromisesToRun.push(AccountModel.updateWarningMessage(accountId, 0));
        }
        const cycleCumulatedConsumption = account.get('cycle_cumulated_consumption') ? account.get('cycle_cumulated_consumption') : 0;
        const allowedVolume             = convertAmountToVolume(currentCredit, cycleCumulatedConsumption);
        if (!allowedVolume && allowedVolume !== 0) {
          return reject({status: 400, error: 'NotANumber'});
        }
        if (account.get('payment_enabled') && meter) {
          let lastIndex       = meter.get('last_index') ? meter.get('last_index') : 0;
          let newIndexCeiling = lastIndex + allowedVolume;
          // Our database stores water volume in L as integer values 
          PromisesToRun.push(MeterModel.updateIndexCeiling(meter.get('serial'), newIndexCeiling));
        }
        Promise.all(PromisesToRun).then(() => {
          return resolve(allowedVolume);
        }).catch((err) => {
          return reject({status: 500, error: 'ServerError', catchErr: err});
        });
      });
    }).catch((err) => {
      return reject({status: 500, error: 'ServerError', catchErr: err});
    });
  });
};
