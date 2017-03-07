'use strict';
const leNode   = require('le_node');
const ENV      = process.env.NODE_ENV || 'development';
const s3Bucket = 'citytaps.secrets';
const s3File   = 'aws_API_secrets.json';

module.exports = function loadConfig() {
  return new Promise(function(resolve, reject) {
    let config = {};
    // If ENV is aws, load secrets from S3, else load from config file
    if (ENV === 'aws') {
      const AWS    = require('aws-sdk');
      const s3     = new AWS.S3({signatureVersion: 'v4'});
      const params = {Bucket: s3Bucket, Key: s3File};

      s3.getObject(params, function(err, data) {
        if (err) {
          // an error occurred
          return reject(err + err.stack);
        } else {
          config = buildConfFromS3(JSON.parse(data.Body.toString()));
          return resolve(config);
        }
      });
    } else {
      config = require('./config.' + ENV);
      return resolve(config);
    }
  });
};

function buildConfFromS3(envParams) {
  let config = {
    "knex": {
      "client": "mysql",
      "connection": {
        "host": envParams.MySQL_host,
        "user": envParams.MySQL_user,
        "password": envParams.MySQL_password,
        "database": envParams.MySQL_db,
        "charset": "utf8"
      },
      "useNullAsDefault": true,
      "directory": "models/migrations"
    },
    "loggerConfig": {
      "name": envParams.appName,
      "streams": [
        leNode.bunyanStream({
          secure: true,
          minLevel: envParams.logentriesMinLevel,
          token: envParams.logentriesToken
        }),
        {
          "level": "debug",
          "stream": process.stdout
        }
      ]
    },
    "jwt": {
      jwtSecret: envParams.jwt_secret,
    },
    "awsIot": {
      "host": envParams.AWSIoT_host,
      "port": 8883,
      "caCert": Buffer.from(envParams.AWSIoT_caCert),
      "clientCert": Buffer.from(envParams.AWSIoT_clientCert),
      "privateKey": Buffer.from(envParams.AWSIoT_privateKey)
    },
    "notification": {
      smsApiUrl: envParams.smsApiUrl
    }
  };
  return config;
}
