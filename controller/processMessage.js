'use strict';
const processMessageHelper         = require('./../helper/message.js');
const calculateMoneyToDebit        = require('./../helper/calculateMoneyToDebit');
let MeterModel                     = require('../models/tables/MeterModel');
let AccountModel                   = require('../models/tables/AccountModel');
let MessageFromMeterModel          = require('../models/tables/MessageFromMeterModel');
let MeterIndexHistoryModel         = require('../models/tables/MeterIndexHistoryModel');
let AccountTransactionModel        = require('../models/tables/AccountTransactionModel');
let MeterTemperatureHistoryModel   = require('../models/tables/MeterTemperatureHistoryModel');
let ValveStatusHistoryModel        = require('../models/tables/ValveStatusHistoryModel');
let AccountConsumptionHistoryModel = require('../models/tables/AccountConsumptionHistoryModel');
let sendSMSNotificationToUser      = require('../component/smsNotificationHelper').sendSMSNotificationToUser;
let accountEvent                   = require('../controller/accountEvent');

const {
        CURRENT_CREDIT_WARNING_LIMIT,
        JOIN_MESSAGE_DATA,
        NOTIFICATION_TEXT,
        ACCOUNT_EVENT
      }                            = require('../config/constants');

function generateConsumptionHistoryJSON(meterInstance, previousOffset, messageDataJSON) {
  let newIndex      = messageDataJSON.water_index ? messageDataJSON.water_index : 0;
  let previousIndex = meterInstance.get('last_index') ? meterInstance.get('last_index') : 0;
  const newOffset   = meterInstance.get('offset') ? meterInstance.get('offset') : 0;
  previousOffset    = previousOffset ? previousOffset : 0;
  let consumption   = (newIndex > previousIndex) ? (newIndex + newOffset) - (previousIndex + previousOffset) : 0;

  return {
    account_id: meterInstance.get('account_id'),
    meter_id: meterInstance.get('id'),
    consumption: consumption,
    index: newIndex,
    timestamp: messageDataJSON.timestamp,
    offset: meterInstance.get('offset') ? meterInstance.get('offset') : 0
  };
}

// We need to export this for tests
// Please refactorize this code
function processMessage(message, userId) {
  return new Promise((resolve, reject) => {
      if (!message) {
        return reject(`message from user_id ${userId} is undefined`);
      }
      let messageWithGatewayAndRadioIdentifier = processMessageHelper.addGatewayAndRadioIdentifier(message);

      // get gateway and radio identifier from topic
      MeterModel.getByRadioIdentifier(messageWithGatewayAndRadioIdentifier.radioIdentifier)
        .then((meter) => {
          if (!meter) {
            return resolve({
              logType: 'warn',
              message: `Meter with radio identifier ${messageWithGatewayAndRadioIdentifier.radioIdentifier} is not registered`
            });
          }

          // Check firmware
          const firmware = meter.get('firmware');
          if (!firmware) {
            return reject(`Meter with serial ${meter.get('serial')} doesn't have a valid firmware`);
          }
          // global.log.info(`MQTT - Meter with serial ${meter.get('serial')} has firmware ${firmware}`);

          const messageDataJSON     = processMessageHelper.extractData(messageWithGatewayAndRadioIdentifier);
          const updateMeterInstance = processMessageHelper.updateMeterInstance;

          // Check if message is a join message
          if (message.data === JOIN_MESSAGE_DATA) {
            MessageFromMeterModel.create(messageDataJSON, meter.get('id'))
              .then(function() {
                return resolve({
                  logType: 'info',
                  message: `Meter with radio identifier ${messageWithGatewayAndRadioIdentifier.radioIdentifier} sent a join message`
                });
              }).catch(function(err) {
              return reject(err);
            });
          }

          // Always store the message in message_from_meter
          let PromisesToDo     = [];
          let NotificationToDo = [];
          // create meter_message, meter_index_history and meter_temperature_history entries
          PromisesToDo.push(
            MessageFromMeterModel.create(messageDataJSON, meter.get('id')),
            MeterIndexHistoryModel.create(meter.get('id'), messageDataJSON.water_index, meter.get('offset'), messageDataJSON.timestamp),
            MeterTemperatureHistoryModel.create(meter.get('id'), messageDataJSON.temperature, messageDataJSON.timestamp)
          );
          // If the meter is attached to an account
          if (meter.get('account_id')) {
            global.log.info(`MQTT - Meter with serial ${meter.get('serial')} is linked to account ${meter.get('account_id')}`);
            AccountModel.getById(meter.get('account_id'))
              .then((account) => {

                if (!account) {
                  return reject(`Account ${meter.get('account_id')} does not exist`);
                }

                // If valve status changed, create valve status history
                if (meter.get('valve_status') !== messageDataJSON.valve_status) {
                  let smsMessageToUser   = "";
                  let typeOfNotification = "";
                  if (messageDataJSON.valve_status === 0) {
                    PromisesToDo.push(
                      accountEvent.create(account.get('id'), ACCOUNT_EVENT.WATER_ACCESS_CLOSE, null)
                    );
                    if (messageDataJSON.index_ceiling <= messageDataJSON.water_index) {
                      smsMessageToUser   = NOTIFICATION_TEXT.VALVE_CLOSED_NO_CREDIT;
                      typeOfNotification = "valveClosedNoCredit";
                    } else {
                      typeOfNotification = "valveClosed";
                      smsMessageToUser   = NOTIFICATION_TEXT.VALVE_CLOSED;
                    }
                  } else {
                    PromisesToDo.push(
                      accountEvent.create(account.get('id'), ACCOUNT_EVENT.WATER_ACCESS_OPEN, null)
                    );
                    typeOfNotification = "valveOpen";
                    smsMessageToUser   = NOTIFICATION_TEXT.VALVE_OPEN;
                  }

                  NotificationToDo.push(
                    sendSMSNotificationToUser(account.get('id'), account.get('contact_phone_number'), smsMessageToUser, typeOfNotification)
                  );
                  global.log.warn(`MQTT - Meter with serial ${meter.get('serial')} changed his valve_status to ${messageDataJSON.valve_status}`);
                  PromisesToDo.push(
                    ValveStatusHistoryModel.create({
                      account_id: meter.get('account_id'),
                      meter_id: meter.get('id'),
                      timestamp: messageDataJSON.timestamp,
                      valve_status: messageDataJSON.valve_status
                    })
                  );
                }
                AccountConsumptionHistoryModel.getLastConsumptionHistory(account.get('id'))
                  .then((lastConsumption) => {
                    let offset = 0;
                    if (lastConsumption) {
                      offset = lastConsumption.get('offset');
                      global.log.info(`MQTT - Account ${account.get('id')} already has consumption`);
                    } else {
                      global.log.warn(`MQTT - First consumption for account ${account.get('id')}`);
                    }
                    // Calculate consumption since previous message and store it in account_consumption_history
                    const ConsumptionHistoryJSON = generateConsumptionHistoryJSON(meter, offset, messageDataJSON);

                    global.log.info(`MQTT - Account ${account.get('id')} used ${ConsumptionHistoryJSON.consumption} L`);

                    if (account.get('payment_enabled')) {
                      const creditToDeduce = calculateMoneyToDebit(ConsumptionHistoryJSON.consumption, account.get('cycle_cumulated_consumption'));
                      // If water consumption is > 0, deduce its money value from account's credit
                      // consumption is the amount that depends on the water prices and the volume of water used during the billing period
                      // Debits water consumption from credit balance only if payment_enabled
                      if (ConsumptionHistoryJSON.consumption) {
                        AccountConsumptionHistoryModel.createConsumptionHistory(ConsumptionHistoryJSON)
                          .then((consumptionHistoryInstance) => {
                          const transactionData = {
                            accountId : account.get('id'),
                            amount : -creditToDeduce,
                            origin: 'Water consumption',
                            timestamp : messageDataJSON.timestamp,
                            currentCredit : account.get('current_credit') - creditToDeduce,
                            consumptionHistoryId : consumptionHistoryInstance.get('id'),
                            cycleCumulatedConsumption : account.get('cycle_cumulated_consumption'),
                            consumption : ConsumptionHistoryJSON.consumption
                          };
                            PromisesToDo.push(
                              AccountTransactionModel.create(transactionData)
                            );
                          })
                          .catch((err) => {
                            global.log.error(err);
                            return reject(err);
                          });
                        // the credit is a CFA per cubic meter price, which value depends on the volume consumed during the billing period
                        // Every time we receive a new index and detects a consumption, we debits the user’s account of the value of this
                        // consumption based on her current consumption
                        global.log.info(`MQTT - Account ${account.get('id')} will be deduce ${creditToDeduce}`);
                        /* If the current credit is under 350 FCA, I need to send a message to the
                         customer to warn him that he will need to refill his account */
                        const finalCredit = account.get('current_credit') + creditToDeduce;

                        if (finalCredit < CURRENT_CREDIT_WARNING_LIMIT && finalCredit > 0 && account.get('warning_message_sent') == false) {
                          const smsMessageToUser = NOTIFICATION_TEXT.LOW_CREDIT_NOTIFICATION;
                          let typeOfNotification = "lowCreditNotification";
                          PromisesToDo.push(
                            AccountModel.updateWarningMessage(account.get('id'), 1),
                            accountEvent.create(account.get('id'), ACCOUNT_EVENT.LOW_CREDIT_ALERT_SENT, null)
                          );
                          NotificationToDo.push(
                            sendSMSNotificationToUser(account.get('id'), account.get('contact_phone_number'), smsMessageToUser, typeOfNotification)
                          );
                        }

                        PromisesToDo.push(
                          account.addToCycleCumulatedConsumption(ConsumptionHistoryJSON.consumption),
                          AccountModel.updateCredit(account.get('id'), account.get('current_credit') - creditToDeduce)
                        );
                      }

                    } else {
                      PromisesToDo.push(
                        AccountConsumptionHistoryModel.createConsumptionHistory(ConsumptionHistoryJSON)
                      );
                      global.log.info(`MQTT - Account ${meter.get('account_id')} : payment_enabled = false`);
                    }


                    Promise.all(PromisesToDo)
                      .then(() => {
                        global.log.info(`MQTT - Meter with serial ${meter.get('serial')} will now be updated'`);
                        updateMeterInstance(meter, messageDataJSON)
                          .then(() => {

                            Promise.all(NotificationToDo)
                              .catch((err) => {
                                global.log.error(err);
                              });

                            return resolve({
                              logType: 'info',
                              message: `MQTT - Message from ${message.topic} processed`
                            });
                          })
                          .catch((err) => {
                            reject('updateMeterInstance failed: ' + err);
                          });
                      })
                      .catch((err) => {
                        reject('One promise failed: ' + err);
                      });
                  });
              }).catch((err) => {
              reject('Account.getById failed: ' + err);
            });
          }
          // If the meter is not attached to an account
          else {
            global.log.warn(`MQTT - Meter with serial ${meter.get('serial')} is not linked to an account`);
            Promise.all(PromisesToDo)
              .then(() => {
                updateMeterInstance(meter, messageDataJSON)
                  .then(() => {
                    return resolve({
                      logType: 'info',
                      message: `MQTT - Message from ${message.topic} processed`
                    });
                  })
                  .catch((err) => {
                    reject('updateMeterInstance failed: ' + err);
                  });
              })
              .catch((err) => {
                reject('One promise failed: ' + err);
              });
          }
        })
        .catch((err) => {
          reject('getByRadioIdentifier failed: ' + err);
        });
    }
  );
}

module.exports = {

  // Put process message here for tests
  processMessage,

  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  MQTTProcessMessage(req, res) {
    const topic   = req.body.message.topic;
    const message = req.body.message;
    global.log.info(`MQTT - Incoming message on  ${topic}`);
    processMessage(message, req.user_id)
      .then((response) => {
        global.log[response.logType](response.message);
        res.send();
      })
      .catch((err) => {
        global.log.error(`MQTT - Message from ${topic} processing failed ${err} - ${message}`);
        res.status(500).json({"error": "ServerError" + err});
      });
  }
};
