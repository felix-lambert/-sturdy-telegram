// BASE SETUP
// =============================================================================
// call the packages we need
/*eslint-env node*/
const ENV          = process.env.NODE_ENV || 'development';
// set our port
const bunyan       = require('bunyan');
const port         = process.env.PORT || 8080;
const cors         = require('cors');
const express      = require('express');
const bodyParser   = require('body-parser');
const app          = express();
const compression  = require('compression');
const acl          = require('express-acl');
const loadConfig   = require('./config/configLoader');
const responseTime = require('response-time');

// ACL rules are defined in JSON syntax
// Define the roles that can access our application,
// and the policies that restrict or give access to
// certain resources
acl.config({
  baseUrl: 'v1',
  filename: 'acl.json',
  path: 'config'
});

loadConfig().then(function(config) {

  const loggerConfig = config.loggerConfig ?
    config.loggerConfig : {"name": "ct-app"};

  global.log = bunyan.createLogger(loggerConfig);


  /*  with the advent of ES6 (ES2015), it is actually
   *  possible to use a global variable
   */
  if (!global.config) {
    global.config = config;
  }

  global.log.info('config done...');

  const MQTTProcessMessage = require('./controller/processMessage').MQTTProcessMessage;
  const accountsController = require('./controller/accounts');
  const userController     = require('./controller/users');
  const metersController   = require('./controller/meters');
  const smsController      = require('./controller/sms');
  const auth               = require('./helper/generateToken');
  const authentication     = require('./controller/authentication');
  const accountEvent       = require('./controller/accountEvent');
  const userActivity       = require('./controller/userActivity');

  // CORS support
  if (ENV === 'development') {
    app.use(cors());
  } else {
    app.use(cors({
      origin: [/\.citytaps\.org$/, /\.amazonaws\.com$/, /127\.0\.0\.1/],
    }));
  }

  app.use(compression());
  app.use(responseTime({suffix:false}));
  // configure body parser
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  // ROUTES FOR API
  const defaultRoute = express.Router();
  const router       = express.Router();
  const login        = express.Router();

  // default route
  defaultRoute.get('/', function(req, res) {
    res.json({
      "message": "Welcome to CityTaps API!"
    });
  });

  //login
  login.get('/', function(req, res) {
    res.json({"message": "Welcome to CityTaps API! Please login"});
  });

  login.post('/', function(req, res) {
    authentication.login(req, res, auth, config);
  });
  //login END

  //user TODO: PLEASE PUT THESE ROUTES IN PLURIAL
  router.route('/user')
    .get(userController.getAllUsers)
    .post(userController.createUser);

  router.route('/user/:user_id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

  router.route('/user/:user_id/updatePassword')
    .patch(userController.updatePassword);

  router.route('/user/:user_id/generateClientServerToken')
    .post(function(req, res) {
      authentication.generateClientServerToken(req, res, auth, config);
    });
  //user END

  //meters
  router.route('/meters')
    .get(metersController.getAllMeters)
    .post(metersController.createMeter);

  router.route('/meters/:meter_serial')
    .get(metersController.getMeter)
    .patch(metersController.updateMeter)
    .delete(metersController.deleteMeter);

  router.route('/meters/:meter_serial/messages/:pageSize/:page')
    .get(metersController.getMeterMessage);

  router.route('/meters/:meter_serial/sentmessages/:pageSize/:page')
    .get(metersController.getMeterMessageSent);

  router.route('/meters/:meter_serial/sentmessages/')
    .get(metersController.getMeterMessageSent);

  router.route('/meters/:meter_serial/messages/')
    .get(metersController.getMeterMessage);

  router.route('/meters/:meter_serial/indexHistory')
    .get(metersController.getIndexHistory);

  router.route('/meters/:meter_serial/temperatureHistory')
    .get(metersController.getTemperatureHistory);

  router.route('/meters/:meter_serial/indexCeilingHistory')
    .get(metersController.getIndexCeilingHistory);

  router.route('/meters/:meter_serial/sendMessageToMeter')
    .post(metersController.sendMessageToMeter);

  router.route('/meters/joinAccount')
    .post(metersController.joinAccount);
  //meters END

  //accounts
  router.route('/accounts')
    .get(accountsController.getAllAccounts)
    .post(accountsController.createAccount);

  router.route('/accounts/dashboards')
    .get(accountsController.dashboards);

  //message from timer server
  router.route('/accounts/debitDailyFee')
    .post(accountsController.debitDailyFeeToAll);
  //message from timer server END

  router.route('/accounts/:account_id/addCredit')
    .post(accountsController.addCredit);

  router.route('/accounts/events/:pageSize/:page')
    .get(accountEvent.getAllAsArray);

  router.route('/accounts/:account_id')
    .get(accountsController.getAccount)
    .patch(accountsController.updateAccount)
    .delete(accountsController.deleteAccount);

  router.route('/accounts/:account_id/enablePayment')
    .post(accountsController.enablePayment);

  router.route('/accounts/:account_id/phoneNumber')
    .get(accountsController.getAttachedPhoneNumber)
    .post(accountsController.createAttachedPhoneNumber);

  router.route('/accounts/:account_id/phoneNumber/:attached_phone_number_id')
    .delete(accountsController.deleteAttachedPhoneNumber);

  router.route('/accounts/consumptions/:account_id/:pageSize/:page')
    .get(accountsController.getConsumptions);

  router.route('/accounts/:account_id/credit/:pageSize/:page')
    .get(accountsController.getPositiveTransactions);

  router.route('/accounts/:account_id/debit/:pageSize/:page')
    .get(accountsController.getNegativeTransactions);

  router.route('/accounts/:account_id/events/:pageSize/:page')
    .get(accountEvent.getAllAsArrayByAccountId);

  router.route('/accounts/resetCycles')
    .post(accountsController.resetCycles);
  //accounts END

  // MQTT process message
  // TODO: PLEASE PUT THESE ROUTES IN PLURIAL AND MAYBE MORE SIMPLE ONE
  router.route('/messageFromMeter')
    .post(MQTTProcessMessage);
  //MQTT process message END

  //sms
  router.route('/sms')
    .post(smsController.smsProcess);

  router.route('/sms/:pageSize/:page/getSms')
    .get(smsController.getSms);

  // /notifications/  /account/:id/notifications
  router.route('/sms/:pageSize/:page/getSmsSent')
    .get(smsController.getSmsSent);

  router.route('/accounts/:account_id/:pageSize/:page/getSms/')
    .get(accountsController.getSmsByAccountId);

  router.route('/accounts/:account_id/:pageSize/:page/getSmsSent/')
    .get(accountsController.getSmsSentByAccountId);

  router.route('/accounts/:id/notifications/')
    .post(accountsController.sendSmsByAccountId);

  //sms END

  //authentication middleware
  app.use('/v1', function(req, res, next) {
    authentication.authentMiddleware(req)
      .then((obj) => {
        if (obj.boolean) {
          global.log.trace(`Valid token for ${obj.email}`);
          next();
        } else {
          res.status(obj.resStatus).json({"message": "invalidToken"});
          global.log.info(`Invalid token received for ${obj.email}`);
        }
      }).catch((err) => {
      global.log.error(err);
      res.status(500).json({"error": "ServerError" + err});
    });
  });
  // END authentication middleware


  // This is the middleware that manages your application
  // requests based on the role and acl rules
  // the role is in req.decoded (jsonwebtoken)

  app.use(userActivity.logActivity);
  app.use(acl.authorize.unless({path: ['/login', '/v1/sms']}));
  app.use('/v1', router);
  app.use('/login', login);
  app.use('/', defaultRoute);

  // START THE SERVER
  module.exports.server = app.listen(port);
  global.log.info('Server is running version ' + process.env.npm_package_version + ' on port ' + port);
});
