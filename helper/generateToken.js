const jwt = require("jwt-simple");
const {TOKEN_DURATION} = require('../config/constants');

module.exports = {
  generateToken(email, role, secret, api_secret, user_id, duration = TOKEN_DURATION) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadToSend = {
      email, user_id, timestamp, api_secret, role
    };
    if (!api_secret) {
      payloadToSend.expiration = timestamp + duration;
    }
    try {
      return jwt.encode(payloadToSend, secret);
    } catch (err) {
      return (err);
    }
  }

};
