let MeterModel                    = require('../models/tables/MeterModel');
let AccountModel                  = require('../models/tables/AccountModel');
let MessageToMeterModel           = require('../models/tables/MessageToMeterModel');
let MeterIndexHistoryModel        = require('../models/tables/MeterIndexHistoryModel');

let MeterTemperatureHistoryModel  = require('../models/tables/MeterTemperatureHistoryModel');
let MeterIndexCeilingHistoryModel = require('../models/tables/MeterIndexCeilingHistoryModel');
let MessageFromMeterModel         = require('../models/tables/MessageFromMeterModel');

/*eslint-env node*/
module.exports = {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  /**
   * @api {get} /meters Get all meters
   * @apiName GetMeters
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, Reader, CustomerManager
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[object]} all meters returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      [
   *        { 
   *          id: 1,
   *          serial: '123',
   *          radio_identifier: '00-80-00-00-00-00-a5-d1',
   *          firmware: '2.0.0',
   *          'pcb-serial': null,
   *          'radio-serial': null,
   *          'meter-serial': null,
   *          last_connection: 1474090424,
   *          last_index: 12,
   *          index_ceiling: null,
   *          valve_status: 1,
   *          temperature: null,
   *          offset: null,
   *          gateway: null,
   *          message_frequency: null,
   *          account_id: 5,
   *          created_at: null,
   *          updated_at: 2016-10-17T11:46:09.000Z 
   *        },
   *        { 
   *          id: 3,
   *          serial: '1234',
   *          radio_identifier: '00-80-00-00-00-00-c3-ee',
   *          firmware: '2.0.0',
   *          'pcb-serial': null,
   *          'radio-serial': null,
   *          'meter-serial': null,
   *          last_connection: 1474090424,
   *          last_index: 1,
   *          index_ceiling: null,
   *           valve_status: 1,
   *          temperature: null,
   *          offset: null,
   *          gateway: null,
   *          message_frequency: null,
   *          account_id: 5,
   *          created_at: null,
   *          updated_at: 2016-10-17T11:46:36.000Z 
   *        }
   *      ]
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getAllMeters(req, res) {
    MeterModel.getAllAsArray().then((allMetersData) => {
      global.log.info(`${req.decoded.email} - getAllMeters`);
      res.json(allMetersData);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - getAllMeters - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {get} /meters/:meter_serial Get meter details
   * @apiName GetMeter
   * @apiGroup Meter
   * @apiParam {String} meter_serial Mandatory meter serial
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, Reader, CustomerManager
   * @apiVersion 1.0.0
   *
   *
   * @apiSuccess {json} meter details returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 201 Created
   *      { 
   *        id: 4,
   *        serial: '125',
   *        radio_identifier: '00-80-00-00-00-00-c9-78',
   *        firmware: '2.0.0',
   *        'pcb-serial': null,
   *        'radio-serial': null,
   *        'meter-serial': null,
   *        last_connection: 1476954077,
   *        last_index: 17,
   *        index_ceiling: 19,
   *        valve_status: 1,
   *        temperature: 21,
   *        offset: null,
   *        gateway: 'dev',
   *        message_frequency: 300,
   *        account_id: 5,
   *        created_at: null,
   *        updated_at: 2016-10-20T08:59:46.000Z,
   *        accountName: 'Jesus Garba' 
   *      }
   *
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
  getMeter(req, res) {
    const meter_serial = req.params.meter_serial;

    // Here we can use one request of th and use withRelated
    MeterModel.getBySerial(meter_serial)
      .then((meterData) => {
        if (meterData && meterData.get('account_id')) {
          AccountModel.getById(meterData.get('account_id')).then((accountData) => {
            if (accountData.attributes) {
              meterData.attributes.accountName = `${accountData.get('first_name')} ${accountData.get('last_name')}`;
            }
            global.log.info(`${req.decoded.email} - ${meterData.get('serial')} - getMeter`);
            res.json(meterData);
          }).catch((err) => {
            global.log.error(`${req.decoded.email} - getById - ${err}`);
            res.status(500).json({"error": "ServerError"});
          });
        } else {
          global.log.info(`${req.decoded.email} - ${meterData.get('serial')} - getMeter`);
          res.json(meterData);
        }
      }).catch((err) => {
      // Maybe we should display the function callback name and the function controller name
      global.log.error(`${req.decoded.email} - getMeter - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {patch} /meters/:meter_serial Update meter details
   * @apiName UpdateMeter
   * @apiGroup Meter
   * @apiParam {String} meter_serial Mandatory meter serial
   * @apiSuccess {json} meter updated.
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager
   * @apiVersion 1.0.0
   *
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: 4,
   *        serial: '125',
   *        radio_identifier: '00-80-00-00-00-00-c9-78',
   *        firmware: '2.0.0',
   *        'pcb-serial': null,
   *        'radio-serial': null,
   *        'meter-serial': null,
   *        last_connection: 1476954077,
   *        last_index: 17,
   *        index_ceiling: 19,
   *        valve_status: 1,
   *        temperature: 21,
   *        offset: null,
   *        gateway: 'dev',
   *        message_frequency: 300,
   *        account_id: 5,
   *        created_at: null,
   *        updated_at: 2016-10-20T08:59:46.000Z,
   *        accountName: 'Jesus Garba' 
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
  updateMeter(req, res) {
    const meterSerial = req.params.meter_serial;
    const meter       = req.body;
    MeterModel.update(meterSerial, meter)
      .then(() => {
        global.log.info(`${req.decoded.email} - ${req.params.meter_serial} - updateMeter`);
        res.json(meter);
      })
      .catch((err) => {
        global.log.error(err);
        res.status(500).json({"error": "ServerError"});
      });
  },

  /**
   * @api {get} /meters/:meter_serial/messages/:pageSize/:page Get all meter message
   * @apiName getMeterMessages
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[object]} all meter messages returned.
   * @apiParam {String} meter_serial Mandatory meter serial.
   * @apiParam {Number} [pageSize] Optional meter serial.
   * @apiParam {Number} [page] Optional page.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      [
   *        { 
   *          decodedData: '1600000868000fe70046',
   *          timestamp: 1477659554,
   *          message: '{
   *            "chan":1,
   *            "cls":0,
   *            "codr":"4/5",
   *            "data":"FgAACGgAD+cARg==",
   *            "datr":"SF11BW125",
   *            "freq":"868.3",
   *            "lsnr":"10",
   *            "mhdr":"400a000006005e1c",
   *            "modu":
   *            "LORA","opts":"",
   *            "port":1,
   *            "rfch":0,
   *            "rssi":-35,
   *            "seqn":7262,
   *            "size":16,
   *            "timestamp":"2016-10-28T12:59:14.158556Z",
   *            "tmst":2158407508,
   *            "topic":"lora/00-80-00-00-00-00-be-7e/up",
   *            "throughAWSIoT":false,
   *            "gateway":"dev",
   *            "radioIdentifier":"00-80-00-00-00-00-be-7e"
   *          }' 
   *        },
   *        { 
   *          decodedData: '1600000868000fe70046',
   *          timestamp: 1477659469,
   *          message: '{
   *            "chan":0,
   *            "cls":0,
   *            "codr":"4/5",
   *            "data":"FgAACGgAD+cARg==",
   *            "datr":"SF11BW125",
   *            "freq":"868.1",
   *            "lsnr":"9.5",
   *            "mhdr":"400a000006005d1c",
   *            "modu":"LORA",
   *            "opts":"",
   *            "port":1,
   *            "rfch":0,
   *            "rssi":-38,
   *            "seqn":7261,
   *            "size":16,
   *            "timestamp":"2016-10-28T12:57:49.898053Z",
   *            "tmst":2074142228,
   *            "topic":"lora/00-80-00-00-00-00-be-7e/up",
   *            "throughAWSIoT":false,
   *            "gateway":"dev",
   *            "radioIdentifier":"00-80-00-00-00-00-be-7e"
   *          }' 
   *        }
   *      ]
   *
   * @apiError ServerError Server error.
   *
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getMeterMessage(req, res) {
    const {meter_serial, pageSize, page} = req.params;
    //get the meter informations
    MeterModel.getBySerial(meter_serial)
      .then((meterData) => {
        if (!meterData) {
          global.log.error(`${req.decoded.email} - getMeterMessage - No meter with the following serial number: ${meter_serial}`);
          // Maybe we should put a 400 and not a 200 here
          return res.json(null);
        } else if (meterData) {
          MessageFromMeterModel.getAllAsArrayByRadioIdentifier(meterData.get('radio_identifier'), pageSize, page)
            .then((data) => {
              global.log.info(`${req.decoded.email} - ${meter_serial} - getMeterMessage`);
              res.json(data);
            }).catch((err) => {
            global.log.error(`${req.decoded.email} - getMeterMessage - ${err}`);
            res.status(500).json({"error": "ServerError"});
          });
        } else {
          res.json(null);
        }
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - getMeterMessage - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },

  /**
   * @api {post} /meters Create meter
   * @apiName createMeter
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager
   * @apiVersion 1.0.0
   *
   * @apiParam {Number} [offset] Optional offset of the Meter.
   * @apiParam {String} serial Mandatory serial of the Meter.
   * @apiParam {String} [firmware] Optional firmware of the Meter.
   *
   * @apiSuccess {json} meter created returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 201 Created
   *      { 
   *        serial: '03',
   *        radio_identifier: '00-80-00-00-00-00-be-4e',
   *        offset: 0,
   *        firmware: '2.0.0',
   *        updated_at: 2016-10-28T13:31:16.221Z,
   *        created_at: 2016-10-28T13:31:16.221Z,
   *        id: 19 
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
  createMeter(req, res) {
    const meter = req.body;
    MeterModel.create(meter)
      .then((meterRes) => {
        global.log.info(`${req.decoded.email} - ${meter.serial} - createMeter`);
        res.json(meterRes);
      }).catch((err) => {
      global.log.error(`${req.decoded.email} - createMeter ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },
  
  /**
   * @api {delete} /meters/:meter_serial Delete meter
   * @apiName deleteMeter
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiParam {String} meter_serial Mandatory meter serial
   *
   * @apiSuccess {json} meter deleted.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        serial: '12'
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
  deleteMeter(req, res) {
    const meterSerial = req.params.meter_serial;
    MeterModel.destroyMeter(meterSerial).then((boolean) => {
      if (boolean) {
        global.log.info(`${req.decoded.email} - ${meterSerial} - deleteMeter`);
        res.json({"serial": meterSerial});
      }
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - deleteMeter - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },
  
  /**
   * @api {post} /meters/:meter_serial/sendMessageToMeter
   * @apiName sendMessageToMeter
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} message success returned.
   * @apiParam {String} typeOfMessage Mandatory type of message.
   * @apiParam {String} meter_serial Mandatory meter serial.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        message: 'success'
   *      }
   *
   * @apiError unknownTypeOfMessage unknown type of message.
   * @apiError ServerError Server error.
   *
   * @apiErrorExample unknownTypeOfMessage-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "error": "unknownTypeOfMessage"
   *     }
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  sendMessageToMeter(req, res) {
    const typesOfMessage           = {
      'updateIndexCeiling': 'updateIndexCeiling',
      'sendOpenValveMessage': 'sendOpenValveMessage',
      'sendCloseValveMessage': 'sendCloseValveMessage',
      'getCredit': 'getCredit',
      'getWakeupFrequency': 'getWakeupFrequency',
      'getWaterIndex': 'getWaterIndex',
      'getTemperature': 'getTemperature',
      'setWakeupFrequency': 'setWakeupFrequency',
      'clearQueue': 'clearQueue'
    };
    const {typeOfMessage, payload} = req.body;
    const meterSerial              = req.params.meter_serial;
    if (typesOfMessage[typeOfMessage]) 
      MeterModel[typesOfMessage[typeOfMessage]](meterSerial, payload)
        .then(() => {
          global.log.info(`${req.decoded.email} - getMeterMessageSent - ${typeOfMessage} for serial ${meterSerial}`);
          res.json({"message": "success"});
        })
        .catch((err) => {
          global.log.error(`${req.decoded.email} - sendMessageToMeter - ${err}`);
          res.status(500).json({"error": "ServerError"});
        });
    } else {
      global.log.error(`${req.decoded.email} - sendMessageToMeter - Unknown type of message`);
      res.status(400).json({"error": "unknownTypeOfMessage"});
    }
  },

  /**
   * @api {get} /meters/:meter_serial/indexHistory Get index history
   * @apiName getIndexHistory
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} all index history returned.
   *
   * @apiError getIndexHistory get index history error.
   * @apiError ServerError Server error.
   *
   * @apiErrorExample getIndexHistory-Response:
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
  getIndexHistory(req, res) {
    const meterSerial = req.params.meter_serial;
    MeterModel.getBySerial(meterSerial)
      .then((meterData) => {
        if (!meterData) {
          global.log.error(`${req.decoded.email} - getIndexHistory - can't find index history of the following meter: ${meterSerial}`);
          res.json(meterData);
        } else {
          MeterIndexHistoryModel.getAllAsArrayByMeterId(meterData.attributes.id)
            .then((data) => {
              global.log.info(`${req.decoded.email} - getIndexHistory - ${meterSerial}`);
              res.json(data);
            })
            .catch((err) => {
              global.log.error(`${req.decoded.email} - getIndexHistory - ${err}`);
              res.status(500).json({"error": "ServerError"});
            });
        }
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - getIndexHistory - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },

  
  /**
   * @api {get} /meters/:meter_serial/temperatureHistory Get temperature history
   * @apiName getTemperatureHistory
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} all temperature history returned.
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getTemperatureHistory(req, res) {
    const meterSerial = req.params.meter_serial;
    MeterModel.getBySerial(meterSerial)
      .then((meterData) => {
        if (!meterData) {
          global.log.error(`${req.decoded.email} - getTemperatureHistory - can't find temperature history of the following meter: ${meterSerial}`);
          res.json(meterData);
        } else {
          MeterTemperatureHistoryModel.getAllAsArrayByMeterId(meterData.attributes.id)
            .then((data) => {
              global.log.info(`${req.decoded.email} - getTemperatureHistory - ${meterSerial}`);
              res.json(data);
            })
            .catch((err) => {
              global.log.error(`${req.decoded.email} - getTemperatureHistory - ${err}`);
              res.status(500).json({"error": "ServerError"});
            });
        }
      }).catch((err) => {
        global.log.error(`${req.decoded.email} - getTemperatureHistory - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },

  /**
   * @api {get} /meters/:meter_serial/indexCeilingHistory Get index ceiling history
   * @apiName getIndexCeilingHistory
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} all index ceiling history returned.
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getIndexCeilingHistory(req, res) {
    MeterModel.getBySerial(req.params.meter_serial)
      .then((meterData) => {
        if (!meterData) {
          res.json(meterData);
        } else {
          MeterIndexCeilingHistoryModel.getAllAsArrayByMeterId(meterData.attributes.id)
            .then((data) => {
              res.json(data);
            })
            .catch((err) => {
              global.log.error(err);
              res.status(500).json({"error": "ServerError"});
            });
        }
      }).catch((err) => {
        global.log.error(err);
        res.status(500).json({"message": "ServerError"});
      });
  },

  /**
   * @api {post} /meters/joinAccount Join account
   * @apiName joinAccount
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} account success returned.
   *
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        message: 'success'
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
  joinAccount(req, res) {
    const meterAccount = req.body;
    MeterModel.updateMeterAccount(meterAccount)
      .then(() => {
        global.log.info(`${req.decoded.email} - joinAccount - Account has been joined to meter`);
        res.json({"message": "success"});
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - joinAccount - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },
  
  /**
   * @api {get} /meters/:meter_serial/sentmessages/:pageSize/:page Get meter messages sent
   * @apiName getMeterMessagesSent
   * @apiGroup Meter
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} all meter messages data sent returned.
   * @apiParam {String} meter_serial Mandatory meter serial.
   * @apiParam {Number} [pageSize] Optional meter serial.
   * @apiParam {Number} [page] Optional page.
   *
   *
   * @apiError UserNotFound user not found.
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
  getMeterMessageSent(req, res) {
    const {meter_serial, pageSize, page} = req.params;
    //get the meter informations
    MeterModel.getBySerial(meter_serial)
      .then(function(meterData) {
        if (!meterData) {
          res.json(meterData);
        } else if (meterData.get('id')) {
          MessageToMeterModel.getAllAsArrayByMeterId(meterData.get('id'), pageSize, page)
            .then((meterSent) => {
              global.log.info(`${req.decoded.email} - ${meter_serial} - getMeterMessageSent`);
              res.json(meterSent);
            })
            .catch((err) => {
              global.log.error(`${req.decoded.email} - getMeterMessageSent - ${err}`);
              res.status(500).json({"message": "ServerError"});
            });
        } else {
          res.json(null);
        }
      }).catch((err) => {
        global.log.error(`${req.decoded.email} - getMeterMessageSent - ${err}`);
        res.status(500).json({"message": "ServerError"});
      });
  }

};
