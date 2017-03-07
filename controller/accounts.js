const addCreditAndUpdateVolume                = require('../component/addCredit');
const Account                                 = require('../lib/Account');
const {NUMBER_OF_BILLING_DAYS, ACCOUNT_EVENT} = require('../config/constants');
let ValveStatusHistoryModel                   = require('../models/tables/ValveStatusHistoryModel');
let AccountModel                              = require('../models/tables/AccountModel');
let AccountConsumptionHistoryModel            = require('../models/tables/AccountConsumptionHistoryModel');
let AccountPhoneNumberModel                   = require('../models/tables/AccountPhoneNumberModel');
let MeterModel                                = require('../models/tables/MeterModel');
let AccountTransactionModel                   = require('../models/tables/AccountTransactionModel');
let SmsIncomingModel                          = require('../models/tables/SmsIncomingModel');
let SmsOutgoingModel                          = require('../models/tables/SmsOutgoingModel');
let sendSMSNotificationToUser                 = require('../component/smsNotificationHelper').sendSMSNotificationToUser;
let accountEvent                              = require('../controller/accountEvent');

/*eslint-env node*/
/*eslint-env es6 */
module.exports = {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */

  /**
   * @api {get} /accounts Get all account
   * @apiName GetAccounts
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} all account
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      [ { id: 5,
   *          utility_id: 2,
   *          utility_identifier: '2',
   *          first_name: 'Jesus',
   *          last_name: 'Garba',
   *          payment_enabled: null,
   *          address: '12 niamey street',
   *          zipcode: null,
   *          city: 'Niamey',
   *          country_code: 'NE',
   *          gps_lat: null,
   *          gps_lon: null,
   *          contact_phone_number: '0140186598',
   *          contact_email: 'lambferfgtr@gmail.com',
   *          activation_date: null,
   *          deactivation_date: null,
   *          current_credit: 405,
   *          cycle_date: null,
   *          cycle_cumulated_consumption: null,
   *          created_at: null,
   *          updated_at: 2016-10-19T13:36:38.000Z
   *        },
   *        { id: 6,
   *          utility_id: null,
   *          utility_identifier: null,
   *          first_name: 'feboula',
   *          last_name: 'lambert',
   *          payment_enabled: null,
   *          address: '8 villa niamey',
   *          zipcode: '75010',
   *          city: 'Niamey',
   *          country_code: null,
   *          gps_lat: null,
   *          gps_lon: null,
   *          contact_phone_number: '0145754578',
   *          contact_email: 'lambertfelix8@gmail.com',
   *          activation_date: null,
   *          deactivation_date: null,
   *          current_credit: 15341,
   *          cycle_date: null,
   *          cycle_cumulated_consumption: 144,
   *          created_at: 2016-10-19T15:19:09.000Z,
   *          updated_at: 2016-10-25T08:21:29.000Z
   *        }
   *      ]
   *
   * @apiError UserNotFound No user correspond.
   * @apiError ServerError Server error.
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "UserNotFound"
   *     }
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getAllAccounts(req, res) {
    // get all accounts information
    AccountModel.getAllAsArray().then((allAccountData) => {
      if (!allAccountData) {
        res.status(404).json({
          "error": "UserNotFound"
        });
      } else {
        global.log.info(`${req.decoded.email} - getAllAccounts`);
        res.json(allAccountData);
      }
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - getAllAccounts - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {post} /accounts/debitDailyFee deduct daily fee from balance
   * @apiName debitDailyFee
   * @apiGroup Account
   * @apiHeader {String} token server unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account accounts deduct daily fee from balance
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 success
   *      {
   *        [accountResultsFromMapping]
   *      }
   *
   * @apiError AccountNotFound Account not found.
   * @apiError ServerError Server error.
   *
   *
   * @apiErrorExample AccountNotFound-Response:
   *      HTTP/1.1 404 Not found
   *      {
   *        "AccountNotFound"
   *      }
   *
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  debitDailyFeeToAll(req, res) {
    global.log.info(`debitDailyFeeToAll - Starts now`);
    AccountModel.getAllAsArray()
      .then((allAccountData) => {
        if (!allAccountData) {
          res.status(404).json({"error": "AccountNotFound"});
        } else {
          /* Node v8 (the latest) will release for of loops
           Why for of?
           - this is the most concise for looping through array elements
           - it avoids all the pitfalls of for–in
           - unlike forEach(), it works with break, continue, and return
           Plain objects are not yet iterable, so I wait for the node v8 implementation in NodeJS
           For the moment I will use a .map
           Why? :
           - .map() is faster than .forEach()
           - doesn't need to use extra memory to create an iterator
           - nicer and simpler to read which is IMHO, the most important
           */
          const accounts = allAccountData.map(accountMapped => {
            //Check if subscription daily fee and the subscription is not null and above 0
            global.log.info(`debitDailyFeeToAll - Starts map function for account ${accountMapped.get('id')}`);
            if (accountMapped.get('subscription_daily_fee') && accountMapped.get('subscription_fee')) {
              // the new keyword causes it to return an object -- this is called making a constructor call
              const account = new Account(
                accountMapped.get('subscription_fee'),
                accountMapped.get('subscription_daily_fee'),
                accountMapped.get('cycle_paid_subscription')
              );
              if (account.cyclePaidSubscription < account.subscriptionFee) {
                account.initializeCyclePaidSubscriptionAndCreditToDeduce();
                return new Promise(function(resolve, reject) {
                  return Promise.all([
                    addCreditAndUpdateVolume(accountMapped.get('id'), -account.newDebit, 'Subscription'),
                    accountMapped.updateCyclePaidSubscription(account.cyclePaidSubscription)
                  ]).then(() => {
                    // in ES6 we can use a new syntax ${NAME} inside of the back-ticked string
                    global.log.info(`debitDailyFeeToAll - Account ${accountMapped.get('id')} - daily fee: ${account.newDebit}, new cycle paid subscription: ${account.cyclePaidSubscription}.`);
                    resolve({id: accountMapped.id});
                  }).catch((err) => {
                    global.log.error(`debitDailyFeeToAll - promise all of messageFromCronTimer - ${err}`);
                    global.log.error(err);
                    reject(accountMapped.id);
                  });
                });
              }
            }
          });
          global.log.info(`debitDailyFeeToAll - Map function done, filter starts`);
          /*
           * Passing an expression
           * account => account
           * is equivalent to the following block
           * account => { return account; }
           */
          Promise.all(accounts.filter(
            account => account
          )).then((accountResultsFromMapping) => {
            /*
             * Will return an array of all results that is
             * of the accounts that has been well subscriptified
             */
            global.log.info(`debitDailyFeeToAll - Billed ${accountResultsFromMapping.length} accounts`);
            return res.json(accountResultsFromMapping);
          }).catch((id) => {
            /*
             * Will return an error if one account has been well
             * subscriptified
             */
            return res.status(500).json({"error": `ServerError on account ${id}`});
          });
        }
      }).catch((err) => {
      global.log.error(`subscription - getAllAsArray - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },
// }


  /**
   * @api {post} /accounts Create account
   * @apiName CreateAccount
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   * @apiVersion 1.0.0
   *
   * @apiParam {String} [first_name] Optional Firstname of the Account.
   * @apiParam {String} [last_name] Optional Lastname of the Account.
   * @apiParam {String} [contact_email] Optional email.
   * @apiParam {String} [address] Optional Address of the Account.
   * @apiParam {String} [zipcode] Optional Zipcode of the Account.
   * @apiParam {String} [country_code] Optional Country code of the Account.
   * @apiParam {String} [contact_phone_number] Optional Phone numer of the Account.
   * @apiParam {String} [activation_date] Optional Activation date of the Account.
   * @apiParam {String} [deactivation_date] Optional Desactivation date of the Account.
   * @apiParam {Number} [current_credit] Optional Credit of the Account.
   * @apiParam {Number} [cycle_date] Optional Cycle date of the Account.
   *
   * @apiSuccess {json} account created returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 201 Created
   *      { contact_email: 'kevinbadou@gmail.com',
   *        utility_identifier: undefined,
   *        first_name: 'kevin',
   *        last_name: 'badou',
   *        address: '12 rue boungi',
   *        zipcode: '75201',
   *        city: 'Niamey',
   *        country_code: 'Niger',
   *        contact_phone_number: '0154785962',
   *        activation_date: undefined,
   *        deactivation_date: undefined,
   *        current_credit: undefined,
   *        cycle_date: undefined,
   *        updated_at: 2016-10-25T08:41:43.159Z,
   *        created_at: 2016-10-25T08:41:43.159Z,
   *        id: 12
   *      }
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  createAccount(req, res) {
    const account = req.body;
    if (account.subscriptionFee) {
      let subscriptionDailyFee     = account.subscriptionFee / NUMBER_OF_BILLING_DAYS;
      account.subscriptionDailyFee = Math.ceil(subscriptionDailyFee);
    } else {
      account.subscriptionDailyFee = 0;
    }

    AccountModel.create(account).then((createdAccount) => {
      global.log.info(`${req.decoded.email} - ${createdAccount.id} - CreateAccount`);
      res.json(createdAccount.attributes);
    }).catch((err) => {
      if (err === "No data for next row") {
        global.log.info(`${req.decoded.email} - getPositiveTransactions - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${req.decoded.email} - getPositiveTransactions - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  },

  /**
   * @api {get} /accounts/consumptions/:account_id/:pageSize/:page get the consumptions history
   * @apiName getConsumptionsHistory
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account consumptions
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 success
   *      [
   *          {
 *            "id": 45895,
 *            "account_id": 1,
 *            "meter_id": 33,
 *            "timestamp": 1480583014,
 *            "index": 32113,
 *            "offset": 51,
 *            "consumption": 0,
 *            "created_at": "2016-12-01T08:03:34.000Z",
 *            "updated_at": "2016-12-01T08:03:34.000Z"
 *          },
   *          {
 *            "id": 45883,
 *            "account_id": 1,
 *            "meter_id": 33,
 *            "timestamp": 1480582161,
 *            "index": 32113,
 *            "offset": 51,
 *            "consumption": 11,
 *            "created_at": "2016-12-01T07:49:22.000Z",
 *            "updated_at": "2016-12-01T07:49:22.000Z"
 *          }
   *       ]

   /**
   * @api {get} /account/:account_id Get account details
   * @apiName GetAccount
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account details returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 201 Created
   *      [
   *        Object { debit7Days=-555.392001},
   *        Object { credit7Days=1750},
   *        Object { debit30Days=-2286.277006},
   *        Object { credit30Days=3450},
   *        Object { accountMeter={...}},
   *        Object { consumptionSum7Days=2894},
   *        Object { consumptionSum30Days=12653}
   *      ]
   *
   * @apiError ServerError Server error.
   * @apiError UserNotFound No user correspond.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "UserNotFound"
   *     }
   */
  getAccount(req, res) {
    const {account_id} = req.params;
    Promise.all([
      AccountTransactionModel.getAmountByDays(account_id, '7', '<', 'debit7Days'),
      AccountTransactionModel.getAmountByDays(account_id, '7', '>', 'credit7Days'),
      AccountTransactionModel.getAmountByDays(account_id, '30', '<', 'debit30Days'),
      AccountTransactionModel.getAmountByDays(account_id, '30', '>', 'credit30Days'),
      AccountModel.getByIdWithMeterAndTransaction(account_id),
      AccountConsumptionHistoryModel.getAmountByDays(account_id, '7', 'consumptionSum7Days'),
      AccountConsumptionHistoryModel.getAmountByDays(account_id, '30', 'consumptionSum30Days')
    ]).then((account) => {
      // in ES6 we can use a new syntax ${NAME} inside of the back-ticked string
      global.log.info(`${req.decoded.email} - ${account_id} - getAccount`);
      res.json(account);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - getAccount - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {patch} /accounts/:account_id Update account details
   * @apiName UpdateAccount
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiParam {String} accountObject Mandatory id
   * @apiSuccess {json} account updated.
   * @apiPermission SuperAdmin, Admin, CustomerManager
   * @apiVersion 1.0.0
   *
   *
   * @apiParamExample param-example:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: '12',
   *        contact_email: 'kevinbadou@gmail.com',
   *        utility_identifier: null,
   *        first_name: 'kevin',
   *        last_name: 'badoula',
   *        address: '12 rue boungi',
   *        zipcode: '75201',
   *        city: 'Niamey',
   *        country_code: 'Niger',
   *        contact_phone_number: '0154785962',
   *        activation_date: null,
   *        deactivation_date: null,
   *        current_credit: null,
   *        cycle_date: null,
   *        updated_at: 2016-10-25T09:00:25.397Z,
   *        installation_date:1484064870,
   *        payement_activation_date 1484739405
   *      }
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: '12',
   *        contact_email: 'kevinbadou@gmail.com',
   *        utility_identifier: null,
   *        first_name: 'kevin',
   *        last_name: 'badoula',
   *        address: '12 rue boungi',
   *        zipcode: '75201',
   *        city: 'Niamey',
   *        country_code: 'Niger',
   *        contact_phone_number: '0154785962',
   *        activation_date: null,
   *        deactivation_date: null,
   *        current_credit: null,
   *        cycle_date: null,
   *        updated_at: 2016-10-25T09:00:25.397Z,
   *        installation_date:1484064870,
   *        payement_activation_date 1484739405
   *      }
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  updateAccount(req, res) {

    let PromisesToDo = [];
    const accountId  = req.params.account_id;
    const account    = req.body;
    if (account.meters && account.meters[0]) {
      const meterId         = account.meters[0].id;
      const radioIdentifier = account.meters[0].radio_identifier;
      PromisesToDo.push(MeterModel.updateRadioIdentifier(meterId, radioIdentifier));
    }
    PromisesToDo.push(AccountModel.update(accountId, account));

    Promise.all(PromisesToDo).then((objSave) => {
      global.log.info(`${req.decoded.email} - ${accountId} - updateAccount`);
      res.json(objSave);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - updateAccount - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {delete} /accounts/:account_id Delete account
   * @apiName DeleteAccount
   * @apiHeader {String} token User unique access-key.
   * @apiGroup Account
   * @apiSuccess {json} account account deleted.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: '12'
   *      }
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  deleteAccount(req, res) {
    const accountId = req.params.account_id;
    AccountModel.destroyAccount(accountId).then((boolean) => {
      if (boolean) {
        global.log.info(`${req.decoded.email} - ${accountId} - deleteAccount`);
        res.json({"id": accountId});
      }
    }).catch((err) => {
      global.log.info(`${req.decoded.email} - deleteAccount - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {post} /accounts/:account_id/addCredit add credit
   * @apiName AddCredit
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   *
   *
   * @apiVersion 1.0.0
   *
   * @apiParam {String} creditToAdd Mandatory credit to add
   *
   * @apiSuccess {json} credit added.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        "volume": 45,
   *        "credit": 12
   *      }
   *
   * @apiError ServerError Server error
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  addCredit(req, res) {
    const accountId = req.params.account_id;
    const credit    = req.body.creditToAdd;
    const email     = req.decoded.email;

    // This needs to refactorize, some values can't be tested...
    addCreditAndUpdateVolume(accountId, credit, 'fromConsole')
      .then((volume) => {
        global.log.info(`${email} - ${credit} credited to account ${accountId}, converts to ${volume}L`);
        return res.json({credit, volume});
      })
      .catch((err) => {
        err.catchErr ? global.log.error(`${email} - addCredit - ${err.catchErr}`) : global.log.error(`${email} - addCredit - ${err.error}`);
        return res.status(err.status).json({"error": err.error});
      });
  },

  /**
   * @api {get} /accounts/:account_id/credit/:pageSize/:page get credit transactions
   * @apiName getCreditTransaction
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account credit transactions.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 success
   *      [
   *          {
   *            "id": 15445,
   *            "account_id": 1,
   *            "timestamp": 1480582161,
   *            "amount": 1000,
   *            "current_credit": 2051.405762,
   *            "origin": "fromMeter",
   *            "created_at": "2016-12-01T07:49:22.000Z",
   *            "updated_at": "2016-12-01T07:49:22.000Z"
   *          },
   *          {
   *            "id": 15438,
   *            "account_id": 1,
   *            "timestamp": 1480581310,
   *            "amount": 50000,
   *            "current_credit": 2052.802734,
   *            "origin": "fromMeter",
   *            "created_at": "2016-12-01T07:35:10.000Z",
   *            "updated_at": "2016-12-01T07:35:10.000Z"
   *          }
   *       ]
   * @apiSuccessExample No data for next row (pagination):
   *      HTTP/1.1 307 success
   *      {
   *        "error": "NoDataForNextRow"
   *      }
   *
   * @apiError ServerError Server error
   * @apiError UserNotFound No user correspond.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 UserNotFound
   *     {
   *       "error": "UserNotFound"
   *     }
   */
  getPositiveTransactions(req, res) {
    const {account_id, pageSize, page} = req.params;

    // get the transaction history information
    // < is asking common to only get the positive amounts
    AccountTransactionModel.getAmountByAccountId(account_id, '>', pageSize, page)
      .then((transactions) => {
        if (!transactions) {
          res.status(404).json({"error": "UserNotFound"});
        } else {
          global.log.info(`${req.decoded.email} - ${account_id} - getPositiveTransactions`);
          res.json(transactions);
        }
      }).catch((err) => {
      if (err === "No data for next row") {
        global.log.warn(`${req.decoded.email} - getPositiveTransactions - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${req.decoded.email} - getPositiveTransactions - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  },

  /**
   * @api {get} /accounts/:account_id/debit/:pageSize/:page get debit transactions
   * @apiName getDebitTransaction
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account debit transactions.
   * @apiSuccess {json} noData No data for next row.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 success
   *      [
   *          {
   *            "id": 15445,
   *            "account_id": 1,
   *            "timestamp": 1480582161,
   *            "amount": -1.397,
   *            "current_credit": 2051.405762,
   *            "origin": "fromMeter",
   *            "created_at": "2016-12-01T07:49:22.000Z",
   *            "updated_at": "2016-12-01T07:49:22.000Z"
   *          },
   *          {
   *            "id": 15438,
   *            "account_id": 1,
   *            "timestamp": 1480581310,
   *            "amount": -3.048,
   *            "current_credit": 2052.802734,
   *            "origin": "fromMeter",
   *            "created_at": "2016-12-01T07:35:10.000Z",
   *            "updated_at": "2016-12-01T07:35:10.000Z"
   *          }
   *       ]
   * @apiSuccessExample No data for next row (pagination):
   *      HTTP/1.1 307 success
   *      {
   *        "error": "NoDataForNextRow"
   *      }
   *
   * @apiError ServerError Server error
   * @apiError UserNotFound No user correspond.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 UserNotFound
   *     {
   *       "error": "UserNotFound"
   *     }
   */
  getNegativeTransactions(req, res) {
    const {account_id, pageSize, page} = req.params;
    // > is asking common to only get the positive amounts
    AccountTransactionModel.getAmountByAccountId(account_id, '<', pageSize, page)
      .then((transactions) => {
        if (!transactions) {
          res.status(404).json({"error": "UserNotFound"});
        } else {
          global.log.info(`${req.decoded.email} - ${account_id} - getNegativeTransactions`);
          res.json(transactions);
        }
      }).catch((err) => {
      if (err === "No data for next row") {
        global.log.warn(`${req.decoded.email} - getNegativeTransactions - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${req.decoded.email} - getNegativeTransactions - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  },

  /**
   * @api {get} /accounts/consumptions/:account_id/:pageSize/:page get the consumptions history
   * @apiName getConsumptionsHistory
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account consumptions
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 success
   *      [
   *          {
   *            "id": 45895,
   *            "account_id": 1,
   *            "meter_id": 33,
   *            "timestamp": 1480583014,
   *            "index": 32113,
   *            "offset": 51,
   *            "consumption": 0,
   *            "created_at": "2016-12-01T08:03:34.000Z",
   *            "updated_at": "2016-12-01T08:03:34.000Z"
   *          },
   *          {
   *            "id": 45883,
   *            "account_id": 1,
   *            "meter_id": 33,
   *            "timestamp": 1480582161,
   *            "index": 32113,
   *            "offset": 51,
   *            "consumption": 11,
   *            "created_at": "2016-12-01T07:49:22.000Z",
   *            "updated_at": "2016-12-01T07:49:22.000Z"
   *          }
   *       ]

   *
   * @apiError ServerError Server error
   * @apiError UserNotFound No user correspond.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 UserNotFound
   *     {
   *       "error": "UserNotFound"
   *     }
   */
  getConsumptions(req, res) {
    const {account_id, pageSize, page} = req.params;
    //get the consumptions history information
    AccountConsumptionHistoryModel.getByAccountId(account_id, pageSize, page)
      .then((consumptions) => {
        if (!consumptions) {
          res.status(404).json({"error": "UserNotFound"});
        } else {
          global.log.info(`${req.decoded.email} - ${account_id} - getConsumptions`);
          res.json(consumptions);
        }
      }).catch((err) => {
      global.log.error(`${req.decoded.email} - getConsumptions - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {post} /accounts/:account_id/enablePayment enable payment for account
   * @apiName enablePayment
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   * @apiParam {Number} enablePayment Mandatory 0 or 1 for the payment status.
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account account updated returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 success
   *      {
   *         "id": 1,
   *         "utility_id": 2,
   *         "utility_identifier": "007.4.16.01",
   *         "first_name": "Abdoul Razak",
   *         "last_name": "Alzouma",
   *         "subscription_daily_fee": null,
   *         "subscription_fee": null,
   *         "cycle_paid_subscription": null,
   *         "payment_enabled": 0,
   *         "warning_message_sent": null,
   *         "address": null,
   *         "zipcode": null,
   *         "city": "Niamey",
   *         "country_code": "NE",
   *         "gps_lat": 13.535832,
   *         "gps_lon": 2.083361,
   *         "contact_phone_number": "+22793379734",
   *         "contact_email": null,
   *         "activation_date": null,
   *         "deactivation_date": null,
   *         "cycle_date": null,
   *         "current_credit": 2051.405762,
   *         "cycle_cumulated_consumption": 1157,
   *         "created_at": "2016-10-27T10:47:38.000Z",
   *         "updated_at": "2016-12-14T09:43:28.436Z"
   *       }
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  enablePayment(req, res) {
    const accountId      = req.params.account_id;
    const paymentEnabled = req.body.enablePayment;
    AccountModel.updatePaymentEnabled(accountId, paymentEnabled)
      .then((accountUpdated) => {
        global.log.info(`${req.decoded.email} - ${accountId} - enablePayment`);
        res.json(accountUpdated);
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - enablePayment - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },

  getAllAttachedPhoneNumber(req, res) {
    AccountPhoneNumberModel.getAllAsArray()
      .then((allAttachedPhoneNumberData) => {
        if (!allAttachedPhoneNumberData) {
          res.status(404).json({"error": "AttachedPhoneNumbersNotFound"});
        } else {
          global.log.info(`${req.decoded.email} - getAllAttachedPhoneNumbers`);
          res.json(allAttachedPhoneNumberData);
        }
      }).catch((err) => {
      global.log.error(`${req.decoded.email} - getAllAttachedPhoneNumbers - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {get} /accounts/:account_id/phoneNumber Get attached phone number
   * @apiName GetAttachedPhoneNumber
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account attached phone number returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 201 Created
   *      [
   *        {
   *          "id": 4,
   *          "account_id": 1,
   *          "phone_number": "+22780325196"
   *        },
   *        {
   *          "id": 5,
   *          "account_id": 1,
   *          "phone_number": "0997987897"
   *        },
   *        {
   *          "id": 6,
   *          "account_id": 1,
   *          "phone_number": "0978979879"
   *        }
   *      ]
   *
   * @apiError ServerError Server error.
   * @apiError AttachedPhoneNUmberNotFound No attached phone number found.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   * @apiErrorExample AttachedPhoneNUmberNotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "AttachedPhoneNumbersNotFound"
   *     }
   */
  getAttachedPhoneNumber(req, res) {
    const accountId = req.params.account_id;
    AccountPhoneNumberModel.getAllAsArrayByAccountId(accountId)
      .then((allAttachedPhoneNumberData) => {
        if (!allAttachedPhoneNumberData) {
          res.status(404).json({"error": "AttachedPhoneNumbersNotFound"});
        } else {
          global.log.info(`${req.decoded.email} - getAllAttachedPhoneNumbers`);
          res.json(allAttachedPhoneNumberData);
        }
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - getAllAttachedPhoneNumbers - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },

  /**
   * @api {post} /accounts/:account_id/phoneNumber create attached phone number
   * @apiName CreateAttachedPhoneNumber
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   *
   *
   * @apiVersion 1.0.0
   *
   * @apiParam {String} phone_number Mandatory attached phone number to add
   *
   * @apiSuccess {json} attached phone number created.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *         "account_id": "1",
   *         "phone_number": 0601020304,
   *         "id": 6
   *       }
   *
   * @apiError ServerError Server error
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  createAttachedPhoneNumber(req, res) {
    const accountId   = req.params.account_id;
    const phoneNumber = req.body.phone_number;
    AccountPhoneNumberModel.create(accountId, phoneNumber).then((createAttachedPhoneNumberData) => {
      global.log.info(`${req.decoded.email} - ${createAttachedPhoneNumberData.id} - CreateAttachedPhoneNumber`);
      res.json(createAttachedPhoneNumberData.attributes);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - createAttachedPhoneNumber - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {delete} /accounts/:account_id/phoneNumber/:attached_phone_number_id Delete attached phone number
   * @apiName DeleteAattachedPhoneNumber
   * @apiHeader {String} token User unique access-key.
   * @apiGroup Account
   * @apiSuccess {json} attached phone number deleted.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: '5'
   *      }
   *
   * @apiError ServerError Server error.
   * @apiError AttachedPhoneNUmberNotFound No attached phone number found.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   * @apiErrorExample AttachedPhoneNUmberNotFound-response
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "NoItem"
   *     }
   */
  deleteAttachedPhoneNumber(req, res) {
    const attachedPhoneNumberId = req.params.attached_phone_number_id;
    AccountPhoneNumberModel.destroy(attachedPhoneNumberId)
      .then((phoneNumber) => {
        if (!phoneNumber) {
          global.log.info(`${req.decoded.email} - ${req.decoded.email} - deleteAttachedPhoneNumber - no item`);
          res.status(404).json({"error": "NoItem"});
        }
        global.log.info(`${req.decoded.email} - ${attachedPhoneNumberId} - deleteAttachedPhoneNumber`);
        res.json({"id": attachedPhoneNumberId});
      }).catch((err) => {
      global.log.error(`${req.decoded.email} - ${req.decoded.email} - deleteAttachedPhoneNumber - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {post} /accounts/resetCycles reset cycles consumption
   * @apiName ResetCycleConsumption
   * @apiGroup Account
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   *
   *
   * @apiVersion 1.0.0
   *
   * @apiParam {String} accountId Mandatory reset cycle consumption for this account id
   *
   * @apiSuccess {json} cycle consumption reset.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        "id": 1,
   *        "cycle_cumulated_consumption": 0,
   *        "cycle_paid_subscription": 0,
   *        "updated_at": "2016-12-14T14:39:04.806Z"
   *      }
   *
   * @apiError ServerError Server error
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  resetCycles(req, res) {
    // Resets the cycle consumption and the cycle fee for subscription
    const accountId = req.body.accountId;
    let promises     = [
      AccountModel.resetCycles(accountId),
      accountEvent.create(accountId, ACCOUNT_EVENT.RESET_CYCLE_CONSUMPTION)
    ];
    Promise.all(promises).then((resetedCycle) => {
      global.log.info(`${req.decoded.email} - ${accountId} - resetCycles`);
      res.json(resetedCycle[0]);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - ${accountId} - resetCycles - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {get} /accounts/:account_id/:pageSize/:page/getSms/ Get sms by account id
   * @apiName getSmsByAccountId
   * @apiGroup Account
   *
   * @apiSuccess {Object[]} all sms messages from account id data received returned.
   * @apiParam {Number} account_id Mandatory account id.
   * @apiParam {Number} [pageSize] Optional page size.
   * @apiParam {Number} [page] Optional page.
   *
   *  @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      [{ 
   *        id: 1,
   *        account_id: 6,
   *        sender: 'julien@citytaps.org',
   *         message: '"Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA"',
   *        operator_id: 10,
   *        timestamp: 1476432069,
   *        status: 'done' 
   *      },
   *      { 
   *        id: 4,
   *        account_id: 6,
   *        sender: 'julien@citytaps.org',
   *        message: '"Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA"',
   *        operator_id: null,
   *        timestamp: 1476432069,
   *        status: 'done' 
   *      }]
   *
   * @apiError ServerError Server error.
   * @apiError EmptyPage Empty page in next row.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 307 Temporary Redirect
   *     {
   *       "error": "EmptyPage"
   *     }
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getSmsByAccountId(req, res) {
    const email                        = req.decoded.email;
    const {account_id, pageSize, page} = req.params;

    SmsIncomingModel.getAllAsArrayByAccountId(account_id, pageSize, page)
      .then((allSms) => {
        global.log.info(email + ' - getSmsByAccountId');
        res.status(200).json(allSms);
      }).catch((err) => {
      if (err === "No data for next row") {
        global.log.warn(`${email} - getSmsByAccountId - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${email} - getSms - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  },

  /**
   * @api {get} /accounts/:account_id/:pageSize/:page/getSmsSent/ Get sms sent by account id
   * @apiName getSmsSentByAccountId
   * @apiGroup Account
   *
   * @apiSuccess {Object[]} all sms messages from account id data sent returned.
   * @apiParam {Number} account_id Mandatory account id.
   * @apiParam {Number} [pageSize] Optional page size.
   * @apiParam {Number} [page] Optional page.
   *
   *  @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *        [{ 
   *            id: 1,
   *            account_id: 6,
   *            sender: 'julien@citytaps.org',
   *            message: '"Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA"',
   *            operator_id: 10,
   *            timestamp: 1476432069,
   *            status: 'done' 
   *        },
   *        { 
   *            id: 4,
   *            account_id: 6,
   *            sender: 'julien@citytaps.org',
   *            message: '"Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA"',
   *            operator_id: null,
   *            timestamp: 1476432069,
   *            status: 'done' 
   *        }]
   *
   * @apiError ServerError Server error.
   * @apiError EmptyPage Empty page in next row.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 307 Temporary Redirect
   *     {
   *       "error": "EmptyPage"
   *     }
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getSmsSentByAccountId(req, res) {
    const email                        = req.decoded.email;
    const {account_id, pageSize, page} = req.params;
    SmsOutgoingModel.getAllAsArrayByAccountId(account_id, pageSize, page)
      .then((allSms) => {
        global.log.info(email + ' - getSmsSentByAccountId');
        res.status(200).json(allSms);
      }).catch((err) => {
      if (err === "No data for next row") {
        global.log.info(`${email} - getSmsByAccountId - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${email} - getSms - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  },

  /**
   * @api {post} /accounts/:account_id/notifications/ Send sms notification by account id
   * @apiName sendSmsNotificationByAccountId
   * @apiGroup Account
   *
   * @apiSuccess {Object[]} success message.
   * @apiParam {String} message Mandatory message.
   * @apiParam {String} phone_number Mandatory phone number.
   *
   *  @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *        [{message: success}]
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  sendSmsByAccountId(req, res) {
    const id                     = req.params.id;
    const {message, phoneNumber} = req.body;
    const email                  = req.decoded.email;
    sendSMSNotificationToUser(id, phoneNumber, message, 'fromConsole')
      .then(() => {
        global.log.info(`${email} - message has been sent for account id ${id}`);
        res.status(200).json({"message": "success"});
      })
      .catch((err) => {
        global.log.error(`${email} - ${err}`);
        res.status(500).json({"message": "server error when add credit"});
      });
  },

  /**
   * @api {get} /accounts/dashboards Get dashboards for year, month and day
   * @apiName dashboards
   * @apiGroup Account
   * @apiHeader {String} token server unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} account Global dashboard data
   *
   * @apiSuccessExample Success-Response:
   *  HTTP/1.1 200 success
   *  {
   *    [
   *      Object { totalAmount30Days=100050},
   *      Object { totalAmount7Days=14850},
   *      Object { totalAmount1Day=null},
   *      Object { consumptionSum30Days=422832},
   *      Object { consumptionSum7Days=61568},
   *      Object { consumptionSum1Day=null},
   *      Object { countValveStatus30Days=16},
   *      Object { countValveStatus7Days=2},
   *      Object { countValveStatus1Day=0},
   *      Object { closedValveCount=1},
   *      Object { elapsed_hour30Days=188},
   *      Object { elapsed_hour7Days=23},
   *      Object { elapsed_hour1Day=null},
   *      Object { currentCreditSum=24035.800278},
   *      Object { nbLowCredit=2}
   *    ]
   *  }
   *
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  dashboards(req, res) {
    Promise.all([
      AccountTransactionModel.getAllAmountByDays('30', '>', 'totalAmount30Days'),
      AccountTransactionModel.getAllAmountByDays('7', '>', 'totalAmount7Days'),
      AccountTransactionModel.getAllAmountByDays('1', '>', 'totalAmount1Day'),
      AccountConsumptionHistoryModel.getAllConsumptionByDays('30', 'consumptionSum30Days'),
      AccountConsumptionHistoryModel.getAllConsumptionByDays('7', 'consumptionSum7Days'),
      AccountConsumptionHistoryModel.getAllConsumptionByDays('1', 'consumptionSum1Day'),
      ValveStatusHistoryModel.getAllClosedValveByDays('30', 'countValveStatus30Days'),
      ValveStatusHistoryModel.getAllClosedValveByDays('7', 'countValveStatus7Days'),
      ValveStatusHistoryModel.getAllClosedValveByDays('1', 'countValveStatus1Day'),
      MeterModel.getAllClosedValveNb(),
      ValveStatusHistoryModel.closedValveTime('30', 'elapsed_hour30Days'),
      ValveStatusHistoryModel.closedValveTime('7', 'elapsed_hour7Days'),
      ValveStatusHistoryModel.closedValveTime('1', 'elapsed_hour1Day'),
      AccountModel.getGlobalCurrentBalance(),
      AccountModel.nbLowCredit('nbLowCredit')
    ]).then((results) => {
      // in ES6 we can use a new syntax ${NAME} inside of the back-ticked string
      global.log.info(`${req.decoded.email} - getDashboards`);
      res.json(results);
    }).catch((err) => {
      if (err === "No data for next row") {
        global.log.info(`${email} - getSmsSentByAccountId - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${email} - getSms - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });

  }
};
