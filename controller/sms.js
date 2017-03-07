/*eslint-env node*/
const sms                                = require('../helper/sms');
const addCreditAndUpdateVolume           = require('../component/addCredit');

let SmsIncomingModel                     = require('../models/tables/SmsIncomingModel');
let SmsOutgoingModel                     = require('../models/tables/SmsOutgoingModel');
let AccountModel                         = require('../models/tables/AccountModel');
let AccountPhoneNumberModel              = require('../models/tables/AccountPhoneNumberModel');
let sendSMSNotificationToUser            = require('../component/smsNotificationHelper').sendSMSNotificationToUser;
const {NOTIFICATION_TEXT} = require('../config/constants');

module.exports = {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  /**
   * @api {post} /sms
   * @apiName Sms
   * @apiGroup Sms
   * @apiVersion 1.0.0
   * @apiSuccess {json} token returned.
   *
   * @apiParam {Number} [id] Optional operator id.
   * @apiParam {String} message Mandatory message.
   * @apiParam {String} sender Mandatory operator id.
   * @apiParam {Number} timestamp Mandatory timestamp.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      {
   *          "message":"success",
   *      }
   *
   * @apiError UserNotFound No user correspond.
   * @apiError NoIdentifiers Invalid identifiers.
   * @apiError ServerError Server error
   *
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "UserNotFound"
   *     }
   *
   * @apiErrorExample InvalidIdentifiers-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "error": "InvalidIdentifiers"
   *     }
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  smsProcess(req, res) {
    const {sender, message, id, timestamp} = req.body;
    const email                            = req.decoded.email;
    global.log.info(`SMS incoming from ${sender} : ${message}`);
    SmsIncomingModel.create(null, sender, message, id, timestamp, "pending")
      .then((smsInstance) => {

        // If sms is not valid, status = error
        if (!req.body.sender || !req.body.message || !req.body.timestamp) {
          smsInstance.save({status: 'error'});
          global.log.error(`SMS notification, sms incoming error, JSON incomplete : ${JSON.stringify(req.body)}`);
          return res.status(400).json({"error": "SMS incoming error, JSON incomplete"});
        }

        if (req.body.sender !== 'OrangeMoney') {
          smsInstance.save({status: 'error'});
          global.log.warn(`SMS notification, sms incoming error, invalid sender : ${JSON.stringify(req.body)}`);
          return res.status(400).json({"error": "SMS incoming error, invalid sender"});
        }

        const smsDataExtracted = sms.extractSmsData(message);

        if (!smsDataExtracted) {
          smsInstance.save({status: 'error'});
          global.log.warn(`SMS notification - ${email} - phone number or credit are not valid from ${req.body.sender} : ${req.body.message}`);
          return res.status(400).json({"error": "phone number or credit are not valid"});
        }

        searchAccountByPhoneNumber(smsDataExtracted.phoneNumber)
          .then((accountInstance) => {
            if (!accountInstance) {
              smsInstance.save({status: 'error'});
              global.log.warn(email + ` - Phone number ${smsDataExtracted.phoneNumber} is not registered`);
              res.status(404).json({"message": "This phone number is not attached to an account"});
            }

            addCreditUpdateVolumeSmsNotification(email, accountInstance, smsInstance, smsDataExtracted)
              .then(() => {
                smsInstance.save({status: 'done', account_id: accountInstance.get('id')});
                global.log.info(email + ` - ${smsDataExtracted.credit} credit has been added for account id  ${accountInstance.get('id')}`);
                res.status(200).json({"message": "success"});
              })
              .catch((err) => {
                smsInstance.save({status: 'error', account_id: accountInstance.get('id')});
                global.log.error(email + ` - ${err}`);
                res.status(500).json({"message": "server error when add credit"});
              });
          })
          .catch((err) => {
            smsInstance.save({status: 'error'});
            global.log.error(email + ` - get account by phoneNumber (${smsDataExtracted.phoneNumber}) -  ${err}`);
            res.status(500).json({"error": "error when get account by phone number"});
          });
      })
      .catch((err) => {
        global.log.error(email + ` - ${err}`);
        res.status(500).json({"error": "error create sms in sms_incoming table"});
      });

  }, 

  /**
   * @api {get} /sms/getSms/:pageSize/:page Get sms
   * @apiName getSmsSent
   * @apiGroup Sms
   *
   * @apiSuccess {Object[]} all sms messages data received returned.
   * @apiParam {Number} [pageSize] Optional page size.
   * @apiParam {Number} [page] Optional page.
   *
   *  @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      [{
   *        id: 1,
   *        account_id: 6,
   *        sender: 'julien@citytaps.org',
   *        message: '"Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA"',
   *        operator_id: 10,
   *        timestamp: 1476432069,
   *        status: 'done'
   *      },
   *      { 
   *        id: 2,
   *        account_id: null,
   *        sender: null,
   *        message: '"Vous avez recu 1000.00 FCFA du 92700405. Votre nouveau solde est de 1000.00 FCFA"',
   *        operator_id: 10,
   *        timestamp: 1476432069,
   *        status: 'error' 
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
  getSms(req, res) {
    const {pageSize, page} = req.params;
    const email            = req.decoded.email;
    SmsIncomingModel.getAllAsArray(pageSize, page).then((allSms) => {
      // in ES6 we can use a new syntax ${NAME} inside of the back-ticked string
      global.log.info(email + ' - getSms');
      res.status(200).json(allSms);
    }).catch((err) => {
      if (err === "No data for next row") {
        global.log.warn(`${email} - getSms - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${email} - getSms - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  }, 

  /**
   * @api {get} /sms/getSmsSent/:pageSize/:page Get sms sent
   * @apiName getSmsSent
   * @apiGroup Sms
   *
   * @apiSuccess {Object[]} all sms messages data sent returned.
   * @apiParam {Number} [pageSize] Optional page size.
   * @apiParam {Number} [page] Optional page.
   *
   *  @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      {
   *        id: 3,
   *        account_id: 2,
   *        timestamp: 1481884683,
   *        recipient: '+22792705060',
   *        message: '"Vous venez de recharger 1000 FCFA sur votre compte CityTaps. Votre nouveau solde est 2000 FCFA."',
   *      },
   *      { 
   *        id: 1,
   *        account_id: 6,
   *        timestamp: 1481884682,
   *        recipient: '+22792700405',
   *        message: '"Vous venez de recharger 1000 FCFA sur votre compte CityTaps. Votre nouveau solde est 1000 FCFA."'
   *      }
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
  getSmsSent(req, res) {
    const {pageSize, page} = req.params;
    const email            = req.decoded.email;
    SmsOutgoingModel.getAllAsArray(pageSize, page).then((allSms) => {
      // in ES6 we can use a new syntax ${NAME} inside of the back-ticked string
      global.log.info(email + ' - getSmsSent');
      res.status(200).json(allSms);
    }).catch((err) => {
      if (err === "No data for next row") {
        global.log.warn(`${email} - getSmsSent - ${err}`);
        res.status(307).json({"error": "NoDataForNextRow"});
      } else {
        global.log.error(`${email} - getSmsSent - ${err}`);
        res.status(500).json({"error": "ServerError"});
      }
    });
  }


};

function searchAccountByPhoneNumber(phoneNumber) {
  return new Promise((resolve, reject) => {
    AccountModel.getByPhoneNumber(phoneNumber)
      .then((accountInstance) => {
        if (!accountInstance) {
          AccountPhoneNumberModel.getByPhoneNumber(phoneNumber)
            .then((phoneNumberInstance) => {
              if (!phoneNumberInstance) {
                return resolve(false);
              }
              AccountModel.getById(phoneNumberInstance.get('account_id'))
                .then((accountInstanceByPhoneNumber) => {
                  if (!accountInstanceByPhoneNumber) {
                    return resolve(false);
                  }
                  resolve(accountInstanceByPhoneNumber);
                })
                .catch((err) => {
                  reject(err);
                });
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          resolve(accountInstance);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function addCreditUpdateVolumeSmsNotification(email, accountInstance, smsInstance, smsDataExtracted) {
  return new Promise((resolve, reject) => {
    addCreditAndUpdateVolume(accountInstance.get('id'), smsDataExtracted.credit, smsInstance.get('sender'))
      .then(() => {
        const newCredit        = Math.floor(accountInstance.get('current_credit') + smsDataExtracted.credit);
        let typeOfNotification = "paymentNotification";
        const message          = NOTIFICATION_TEXT.PAYMENT_NOTIFICATION.replace('{{credit}}', smsDataExtracted.credit).replace('{{newCredit}}', newCredit);
        sendSMSNotificationToUser(accountInstance.get('id'), smsDataExtracted.phoneNumber, message, typeOfNotification)
          .then(() => {
            return resolve();
          }).catch((err) => {
          return reject(err);
        });
      }).catch((err) => {
      return reject(err);
    });
  });
}
