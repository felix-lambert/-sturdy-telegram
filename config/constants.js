/* After some investigation, I realize that this is
 the closest way for ES6.
 Of course, Node will soon use a simple export and a simple
 import. */
const CURRENT_CREDIT_WARNING_LIMIT = 350;
module.exports                     = {
  NUMBER_OF_BILLING_DAYS: 28,
  CURRENT_CREDIT_WARNING_LIMIT: CURRENT_CREDIT_WARNING_LIMIT,
  TOKEN_DURATION: 86400,
  JOIN_MESSAGE_DATA: 'IQ==',
  NOTIFICATION_TEXT: {
    VALVE_CLOSED_NO_CREDIT: "Bonjour, votre crédit CityTaps est épuisé. L'accès à l'eau est coupé. Veuillez recharger votre compte et fermer votre robinet en attendant le rétablissement.",
    VALVE_CLOSED: "Bonjour, votre accès à l'eau est désormais coupé.",
    VALVE_OPEN: "Bonjour, votre accès à l'eau est désormais rétabli.",
    LOW_CREDIT_NOTIFICATION: `Bonjour, votre crédit CityTaps est bientôt épuisé. Il vous reste moins de ${CURRENT_CREDIT_WARNING_LIMIT} CFA. Pensez à recharger votre compte.`,
    PAYMENT_NOTIFICATION: 'Bonjour, vous venez de recharger {{credit}} FCFA sur votre compte CityTaps. Votre nouveau solde est {{newCredit}} FCFA.'
  },
  WATER_PRICES: [
    {
      "level": 0,
      "price": 127,
      "maxVolume": 10000
    },
    {
      "level": 1,
      "price": 321,
      "maxVolume": 40000
    },
    {
      "level": 2,
      "price": 515,
      "maxVolume": 50000
    },
    {
      "level": 3,
      "price": 612.85,
      "maxVolume": 100000000000
    },
  ],
  MOST_SIGNIFICANT_BIT: 0x7ffffff,
  TYPES_OF_MESSAGE: {
    'CLOSE_VALVE': '01',
    'OPEN_VALVE': '02',
    'UPDATE_INDEX_CEILING': '03',
    'SET_WAKEUP_FREQUENCY': '04',
    'GET_TEMPERATURE': '05',
    'GET_WAKEUP_FREQUENCY': '06',
    'GET_WATER_INDEX': '08',
    'CLEAR_QUEUE': '09'
  },
  PASSWORD_SALT_LENGTH: 20,
  ACCOUNT_EVENT: {
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
    CREDIT_SUBSCRIPTION: "CREDIT_SUBSCRIPTION",
    CREDIT_ADDED: "CREDIT_ADDED",
    CREDIT_SUBTRACT: "CREDIT_SUBTRACT",
    LOW_CREDIT_ALERT_SENT: "LOW_CREDIT_ALERT_SENT",
    WATER_ACCESS_CLOSE: "WATER_ACCESS_CLOSE",
    WATER_ACCESS_OPEN: "WATER_ACCESS_OPEN",
    RESET_CYCLE_CONSUMPTION: "RESET_CYCLE_CONSUMPTION"
  }
};