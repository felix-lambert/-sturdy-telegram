const sendMessageToDevice         = require('../../component/sendMessageToDevice');
let Bookshelf                     = require('../database').bookshelf;
let MessageToMeterModel           = require('./MessageToMeterModel');
let MeterIndexCeilingHistoryModel = require('./MeterIndexCeilingHistoryModel');
const {TYPES_OF_MESSAGE}          = require('../../config/constants');

/* SCOPES
  accountIdIsNotNull(qb)
  closedValveCount(qb)
*/

/* INSTANCES
  updateLastIndex(last_index)
*/

/*
  getAllAsArray()
  getById(id)
  getBySerial(serial)
  getByRadioIdentifier(radio_identifier)
  create(obj)
  updateIndexCeiling(serial, index_ceiling, notifyDevice = true)
  sendOpenValveMessage(serial)
  sendCloseValveMessage(serial)
  getCredit(serial)
  getWakeupFrequency(serial)
  getWaterIndex(serial)
  setWakeupFrequency(serial, message_frequency)
  getTemperature(serial)
  destroyMeter(serial)
  update(serial, obj)
  prepareMessage(serial, messageType, payload = null)
  clearQueue(serial)
  updateMeterAccount(obj)
  getByAccountId(account_id)
  updateRadioIdentifier(id, radio_identifier)
  getAllClosedValveNb()
*/

let meter = Bookshelf.Model.extend({
  tableName: 'meter',
  hasTimestamps: true,
  updateLastIndex(last_index) {
    return this.save({last_index}, {patch: true});
  },

  scopes: {
    closedValveCount(qb) {
      qb.select(Bookshelf.knex.raw('count(valve_status) as closedValveCount'));
    },

    accountIdIsNotNull(qb) {
      qb.where(Bookshelf.knex.raw('account_id IS NOT NULL'));
    }
  }
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  getAllAsArray() {
    return new Promise((resolve, reject) => {
      this.forge().fetchAll()
        .then((data) => {
          const result = [];
          data.forEach((res) => {
            result.push(res);
          });
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },
  getById(id) {
    return this.where({id}).fetch();
  },

  getBySerial(serial) {
    return this.where({serial}).fetch();
  },

  getByRadioIdentifier(radio_identifier) {
    return this.where({radio_identifier}).fetch();
  },

  create(obj) {

    return new Promise((resolve, reject) => {
      if (typeof(obj.offset) !== 'number' || obj.offset < 0) {
        return reject(TypeError('Offset must be a positive int'));
      }
      this.forge({
        serial: obj.serial,
        radio_identifier: obj.radio_identifier,
        offset: obj.offset,
        firmware: obj.firmware,
        account_id: obj.account_id
      }).save().then((objCreated) => {
        resolve(objCreated);
      }).catch((err) => {
        return reject(err);
      });
    });
  },

  updateIndexCeiling(serial, index_ceiling, notifyDevice = true) {
    return new Promise((resolve, reject) => {
      if (typeof(index_ceiling) !== 'number' || index_ceiling < 0) {
        return reject(TypeError('New index ceiling must be a positive int'));
      }
      this.forge()
        .where({serial})
        .save({index_ceiling}, {patch: true})
        .then(() => {
          if (!notifyDevice) {
            return resolve();
          } else {
            this.prepareMessage(serial, 'UPDATE_INDEX_CEILING', index_ceiling)
              .then((model) => {
                MeterIndexCeilingHistoryModel.create(model.get('id'), model.get('index_ceiling'))
                  .then(() => {
                    resolve(model);
                  })
                  .catch((err) => {
                    return reject(err);
                  });
              })
              .catch((err) => {
                return reject(err);
              });
          }
        }).catch((err) => {
          return reject(err);
        });
    });
  },

  sendOpenValveMessage(serial) {
    return this.prepareMessage(serial, 'OPEN_VALVE');
  },

  sendCloseValveMessage(serial) {
    return this.prepareMessage(serial, 'CLOSE_VALVE');
  },

  getCredit(serial) {
    return this.prepareMessage(serial, 'GET_CREDIT');
  },

  getWakeupFrequency(serial) {
    return this.prepareMessage(serial, 'GET_WAKEUP_FREQUENCY');
  },

  getWaterIndex(serial) {
    return this.prepareMessage(serial, 'GET_WATER_INDEX');
  },

  setWakeupFrequency(serial, message_frequency) {
    return new Promise((resolve, reject) => {
      if (typeof(message_frequency) !== 'number' || message_frequency < 0) {
        return reject(TypeError('newWakeupFrequency must be a positive int'));
      }
      this.prepareMessage(serial, 'SET_WAKEUP_FREQUENCY', message_frequency)
        .then(() => {
          this.forge()
            .where({serial})
            .save({
              message_frequency
            }, {patch: true})
            .then(() => {
              resolve();
            })
            .catch((err) => {
              global.log.error(err);
              return reject(err);
            });
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },


  getTemperature(serial) {
    return this.prepareMessage(serial, 'GET_TEMPERATURE');
  },

  destroyMeter(serial) {
    return this.forge()
      .where({serial})
      .destroy();
  },


  update(serial, obj) {
    return new Promise((resolve, reject) => {
      if (typeof(obj.offset) !== 'number' || obj.offset < 0) {
        return reject(TypeError('Offset must be a positive int'));
      }
      this
        .forge()
        .where({serial})
        .save({
          serial: obj.serial,
          radio_identifier: obj.radio_identifier,
          account_id: obj.account_id,
          offset: obj.offset,
          firmware: obj.firmware
        }, {patch: true})
        .then((objUpdated) => {
          resolve(objUpdated);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  prepareMessage(serial, messageType, payload = null) {
    return new Promise((resolve, reject) => {
      this.getBySerial(serial)
        .then((model) => {
          if (!model) {
            return reject(TypeError('Unknown serial'));
          }
          let message = TYPES_OF_MESSAGE[messageType];
          let json    = {};
          if (payload) {
            // convert decimal to hexa
            let hexString = payload.toString(16);
            // we need to have the string coded on a even number of digits
            if (hexString.length % 2 === 1) {
              hexString = '0' + hexString;
            }
            //setWakeUpFrequency need to receive 2 bytes
            if (messageType === 'SET_WAKEUP_FREQUENCY') {
              if (hexString.length === 2) {
                hexString = '00' + hexString;
              }
            }
            message += hexString;
          }
          // add messageHeader and convert to base64
          json.data = new Buffer(message, 'hex').toString('base64');
          
          MessageToMeterModel.create(json.data, payload, messageType, model.get('id'))
            .then(() => {
              sendMessageToDevice(model.get('radio_identifier'), messageType, JSON.stringify(json), model.get('gateway'))
                .then(() => {
                  resolve(model);
                })
                .catch((err) => {
                  global.log.error(err);
                  return reject(err);
                });
            })
            .catch((err) => {
              global.log.error(err);
              return reject(err);
            });
        })
        .catch((err) => {
          global.log.error(err);
          return reject(err);
        });
    });
  },

  clearQueue(serial) {
    return this.prepareMessage(serial, 'CLEAR_QUEUE');
  },

  updateMeterAccount(obj) {
    return this.forge()
      .where({serial: obj.serial})
      .save({
        account_id: obj.id
      }, {patch: true});
  },

  getByAccountId(account_id) {
    return this.where({account_id}).fetch();
  },
  
  // You instantiate a model with the corresponding ID
  // Then when you call save, it automatically updates the existing record
  updateRadioIdentifier(id, radio_identifier) {
    return this.forge()
      .where({id})
      .save({radio_identifier},
        // Only save attributes supplied in arguments to save
        {patch: true}
      );
  },

  getAllClosedValveNb() {
    return new Promise((resolve, reject) => {
      return this.forge()
        .closedValveCount()
        .where({'valve_status': 0})
        .accountIdIsNotNull()
        .fetchAll()
        .then((res) => {
          return resolve(res.models[0].attributes);
        }).catch((err) => {
          return reject(err);
        });

    });
  }
});

module.exports = Bookshelf.model('meter', meter);
