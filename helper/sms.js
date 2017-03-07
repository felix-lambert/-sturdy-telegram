// Please put this code in constants file
const callingCode = {
  'NE': '+227'
};

/*eslint-env node*/
module.exports = {
  extractSmsData(message, countryCode = 'NE') {
    let smsDataExtracted     = {};
    const extractPhoneNumber = new RegExp("du ([0-9]*).");
    const extractCredit      = new RegExp("recu ([0-9\.]*) FCFA");
    const phoneNumberExtract = extractPhoneNumber.exec(message);
    const creditExtract      = extractCredit.exec(message);
    if (!phoneNumberExtract || !creditExtract) {
      return false;
    } else if (!phoneNumberExtract[1] || !creditExtract[1]) {
      return false;
    } else {
      try {
        smsDataExtracted.phoneNumber = callingCode[countryCode] + phoneNumberExtract[1];
        smsDataExtracted.credit      = parseInt(creditExtract[1]);
        return smsDataExtracted.credit > 0 ? smsDataExtracted : false;
      } catch (err) {
        return false;
      }
    }
  }
};

