'use strict';
const {MOST_SIGNIFICANT_BIT} = require('../config/constants');

module.exports = {
  addGatewayAndRadioIdentifier(message) {
    if (message.throughAWSIoT === 'true') {
      //if message is received through AWS, topic is ct-iot/[gatewayId]/[radioID]/up
      message.gateway         = message.topic.split('/')[1];
      message.radioIdentifier = message.topic.split('/')[2]; // return ae-43
    } else {
      //if message is received directly from the gateway, topic is lora/[radioID]/up
      message.gateway         = 'dev';
      message.radioIdentifier = message.topic.split('/')[1]; // return ae-43
    }
    return message;
  },

  extractData(message) {
    /*  8 bits of temperature
     28 bits (3.5 bytes) of water index
     1 bit of valve
     27 bits of index ceiling
     16 bits for wake up frequency */
    let messageJsonData = extractCommonData(message);
    let buffer          = new Buffer(message.data, 'base64');
    /*
     *  temperature in °C as integer values
     *  parseInt(messageJsonData.decodedData.substr(0, 2), 16);
     */
    messageJsonData.temperature  = buffer.readUInt8(0);
    messageJsonData.water_index  = parseInt(messageJsonData.decodedData.substr(2, 7), 16);
    messageJsonData.valve_status = parseInt(messageJsonData.decodedData.substr(9, 1), 16);
    // valve_ceiling is a 28-bits number
    let valveCeiling             = parseInt(messageJsonData.decodedData.substr(9, 7), 16);
    // Check if the most significant bit is 1
    if (valveCeiling > MOST_SIGNIFICANT_BIT) {
      //set valve-status as the most significant bit
      // TO DO Find a way to avoid underscore
      messageJsonData.valve_status = 1;
      // setting the index_ceiling as the 27 first bits of valve_ceiling
      // TO DO Find a way to avoid underscore
      messageJsonData.index_ceiling = valveCeiling - 0x8000000;
    } else {
      //most significant bit is 0
      // TO DO Find a way to avoid underscore
      messageJsonData.valve_status = 0;
      //set valve-status as the most significant bit
      // TO DO Find a way to avoid underscore
      messageJsonData.index_ceiling = valveCeiling;
    }
    messageJsonData.wakeUpFrequency = parseInt(messageJsonData.decodedData.substr(16, 4), 16);
    return messageJsonData;
  },

  updateMeterInstance(meterInstance, messageJsonData) {
    return meterInstance
      .save({
        last_connection: messageJsonData.timestamp,
        last_index: messageJsonData.water_index,
        valve_status: messageJsonData.valve_status,
        temperature: messageJsonData.temperature,
        index_ceiling: messageJsonData.index_ceiling,
        message_frequency: messageJsonData.wakeUpFrequency,
        gateway: messageJsonData.gateway
      }, {patch: true});
  }

};

let extractCommonData = (message) => {
  let messageJsonData             = {};
  messageJsonData.timestamp       = Math.floor(Date.parse(message.timestamp) / 1000);
  messageJsonData.message         = JSON.stringify(message);
  messageJsonData.gateway         = message.gateway;
  messageJsonData.radioIdentifier = message.radioIdentifier;
  //1043
  messageJsonData.decodedData     = new Buffer(message.data, 'base64').toString('hex');
  return messageJsonData;
};

