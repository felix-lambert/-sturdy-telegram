const userActivity = require('../models/tables/UserActivityModel');
const interceptor  = require('express-interceptor');

const logActivity = interceptor(function(req, res) {
  const interceptorData = {
    timestamp: Date.now() / 1000,
    responseCode: res.statusCode,
    ipAdress: req.connection.remoteAddress,
    endPoint: req.path,
    verb: req.method,
    reqParams: req.params
  };

  return {
    isInterceptable: function() {
      return (isInterceptable(interceptorData));
    },
    intercept: function(body, send) {
      send(body);
      // Need to be after the response
      interceptorData.responseTime = res.get('X-Response-Time');
      if (!req.decoded || !req.decoded.user_id) {
        return global.log.error(`User activity interceptor - extract data failed - ${JSON.stringify(interceptorData)}`);
      }

      interceptorData.userId = req.decoded.user_id;
      userActivity.create(interceptorData)
        .then(() => {
          global.log.info(`${req.decoded.email} - user activity interceptor success`);
        })
        .catch((err) => {
          global.log.error(`${req.decoded.email} - user activity interceptor - create failed - ${JSON.stringify(err)}`);
        });
    }
  };
});

function isInterceptable(interceptorData) {
  const {endPoint, verb} = interceptorData;
  const doNotIntercept   = [
    {endpoint: '/login', method: 'GET'},
    {endpoint: '/', method: 'GET'},
    {endpoint: '/', method: 'HEAD'}
  ];
  return !doNotIntercept.some(elem => elem.endpoint === endPoint && elem.method === verb);
}

module.exports = {
  logActivity
};

