'use strict';

module.exports = function sendMessageToDevice(radioIdentifier, messageType, convertedMessage, gateway = null) {
  return new Promise(function(resolve, reject) {
    let topic = '';
    let client;
    if (process.env.NODE_ENV === 'aws') {
      const awsIot = require('aws-iot-device-sdk');
      client       = awsIot.device(global.config.awsIot);
      if (messageType !== 'CLEAR_QUEUE') {
        topic = 'ct-iot/' + gateway + '/' + radioIdentifier + '/down';
      } else {
        topic            = 'ct-iot/' + gateway + '/' + radioIdentifier + '/clear';
        // DON'T NEED ANY CONVERTED MESSAGE
        convertedMessage = '';
      }
    } else {
      const mqtt = require('mqtt');
      if (!global.config.mqtt || !global.config.mqtt.mqttUrl || global.config.mqtt.mqttUrl === '') {
        return reject('Missing URL');
      }

      // UGLY HACK to make the unit test without Internet connection
      if (process.env.NODE_ENV === 'test') {
        return resolve(true);
      }
      // END OF HACK

      client = mqtt.connect(global.config.mqtt.mqttUrl);

      if (messageType !== 'CLEAR_QUEUE') {
        topic = 'lora/' + radioIdentifier + '/down';
      } else {
        topic            = 'lora/' + radioIdentifier + '/clear';
        // DON'T NEED ANY CONVERTED MESSAGE
        convertedMessage = '';
      }
    }
    client.publish(topic, convertedMessage, {qos: 1}, function() {
      client.end(false, function() {
        return resolve(true);
      });
    });
  });
};
