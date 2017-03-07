const http        = require('http');
const SmsOutgoing = require('../models/tables/SmsOutgoingModel');
const apiSmsUrl   = global.config.notification.smsApiUrl;

module.exports = {
  sendSMSNotificationToUser(accountId, num, message, typeOfNotification) {
    return new Promise(function(resolve, reject) {

      if (!accountId || !num || !message) {
        global.log.error(`SMS notification - One parameter is empty`);
        return reject('One parameter is empty');
      }
      const timestamp = Math.floor(new Date() / 1000);
      SmsOutgoing.create(accountId, num, message, timestamp, typeOfNotification)
        .then(function() {

          const numURI     = encodeURIComponent(num);
          const messageURI = encodeURIComponent(message);

          //add phone_number and message in the URL
          let url = apiSmsUrl.replace("{{numURI}}", numURI);
          url     = url.replace("{{messageURI}}", messageURI);


          // Don't send sms when run test
          if (process.env.NODE_ENV !== 'aws') {
            global.log.info(`SMS notification sent (SIMULATION)`);
            return resolve();
          }

          http.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);
                if (!parsedData.data || parsedData.data[0].status !== 'OK') {
                  global.log.error(`SMS notification failed, (CIN: ${accountId}, num: ${num}, message: ${message}), response: ${parsedData.toString()}`);
                  return reject({ERROR: 'response incomplete'});
                } else {
                  global.log.info(`SMS notification sent, (CIN: ${accountId}, num: ${num}, message: ${message})`);
                  return resolve();
                }
              } catch (err) {
                global.log.error(`SMS notification failed, (CIN: ${accountId}, num: ${num}, message: ${message}), ${err.message}`);
                return reject(err);
              }
            });
          }).on('error', (err) => {
            global.log.error(`SMS notification - API call failed, (CIN: ${accountId}, num: ${num}, message: ${message}), ${err.toString()}`);
            return reject(err);
          });

        }).catch((err) => {
        global.log.error(`SMS notification - ${err}`);
        return reject(err);
      });
    });
  }

};
