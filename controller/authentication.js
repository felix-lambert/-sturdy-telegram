const randomString = require("randomstring");
const jwt          = require("jwt-simple");

// require models
let UserModel = require('../models/tables/UserModel');

/*eslint-env node*/
module.exports = {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  /**
   * @api {post} /login
   * @apiName Login
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiSuccess {json} token returned.
   *
   * @apiParam {String} email Mandatory email.
   * @apiParam {String} password Mandatory password.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      {
   *          "token":"frejhjhfo424çdez4eiuhazmdh445",
   *          "role": "Admin",
   *          "language": "en"
   *      }
   *
   * @apiError WrongPassword Invalid password.
   * @apiError UserNotFound No user correspond.
   * @apiError NoPermission No permission.
   * @apiError NoIdentifiers Invalid identifiers.
   * @apiError ServerError Server error
   *
   * @apiErrorExample WrongPassword-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": "WrongPassword"
   *     }
   *
   * @apiErrorExample UserNotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "UserNotFound"
   *     }
   *
   * @apiErrorExample NoPermission-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": "NoPermission"
   *     }
   *
   * @apiErrorExample InvalidIdentifiers-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "error": "InvalidIdentifiers"
   *     }
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  login(req, res, auth, cfg) {
    const {email, password} = req.body;
    if (email && password) {
      UserModel.getByEmail(email)
        .then((userInstance) => {
          if (!userInstance) {
            global.log.error(`${email} - login - No user correspond`);
            return res.status(404).json({
              "error": "UserNotFound"
            });
          } else {
            userInstance.isPasswordValid(password)
              .then((userValid) => {
                if (userValid) {
                  global.log.info(`Token sent for ${email}`);
                  userInstance.getRole().then((role) => {
                    req.decoded = {email: email, role: role, user_id: userInstance.get('id')};
                    //status of 200 will be the default when using res.send, res.json
                    res.json({
                      "token": auth.generateToken(email, role, cfg.jwt.jwtSecret, false, userInstance.get('id')),
                      "role": role,
                      "language": userInstance.get('language')
                    });
                  }).catch((err) => {
                    global.log.error(err);
                    return res.status(401).json({"error": "NoPermission"});
                  });

                } else {
                  global.log.warn(`Password error for ${email}`);
                  res.status(401).json({"error": "WrongPassword"});
                }
              })
              .catch((err) => {
                global.log.error(err);
                return res.status(500).json({"error": "ServerError"});
              });
          }
        }).catch((err) => {
        global.log.error(`${email} - login - ${err}`);
        return res.status(500).json({"error": "ServerError"});
      });
    } else {
      global.log.warn("Invalid identifiers");
      res.status(400).json({"error": "InvalidIdentifiers"});
    }

  },


  /**
   * @api {post} /user/:user_id/generateClientServerToken Generate client server token
   * @apiName generateClientServerToken
   * @apiGroup User
   * @apiVersion 1.0.0
   * @apiSuccess {json} token server returned.
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CronService, CustomerManager
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      {
   *          "token":"frejhjhfo424çdez4eiuhazmdh445",
   *          "message": "success"
   *      }
   *
   * @apiError NoPermission No permission.
   * @apiError ServerError Server error
   *
   * @apiErrorExample NoPermission-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "error": "NoPermission"
   *     }
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  generateClientServerToken(req, res, auth, cfg) {
    const userId    = parseInt(req.params.user_id);
    const apiSecret = randomString.generate(10);

    UserModel.getById(userId)
      .then((userInstance) => {
        UserModel.updateUserApiSecret(userId, apiSecret)
          .then(() => {
            global.log.info('Client server token was generate for user ID ' + userId);

            userInstance.getRole().then((role) => {
              //status of 200 will be the default when using res.send, res.json
              return res.json({
                "message": "success",
                "token": auth.generateToken(req.decoded.email, role, cfg.jwt.jwtSecret, apiSecret, userId)
              });
            }).catch((err) => {
              global.log.error(err);
              return res.status(401).json({"error": "NoPermission"});
            });
          })
          .catch((err) => {
            global.log.error(err);
            return res.status(500).json({"error": "ServerError"});
          });
      })
      .catch((err) => {
        global.log.error(err);
        return res.status(500).json({"error": "ServerError"});
      });
  }, 

  authentMiddleware(req) {
    return new Promise(function(resolve, reject) {
      if (!req.headers.authorization || req.headers.authorization === 'null') {
        global.log.warn('req.headers.authorization not valid');
        return resolve({boolean: false, resStatus: 403});
      } else {
        let payload;
        try {
          payload = jwt.decode(req.headers.authorization, global.config.jwt.jwtSecret);
        } catch (err) {
          return err.toString() === 'Error: Signature verification failed' ? resolve({
              boolean: false,
              resStatus: 403
            }) : reject(err);
        }

        //Add req.decoded for the ACL middleware
        req.decoded = payload;
        if (payload.api_secret) {
          UserModel.getById(payload.user_id)
            .then((userInstance) => {
              if (!userInstance) {
                global.log.info(`User ID ${payload.user_id} doesn't exist`);
                return resolve({boolean: false, email: payload.email, resStatus: 401});
              }
              if (userInstance.get('api_secret') === payload.api_secret) {
                global.log.info(`Valid token for user Email  ${payload.email}`);

                return resolve({boolean: true, email: payload.email});
              } else {
                global.log.info(`Doesn't have access rights ${payload.email}`);
                return resolve({boolean: false, email: payload.email, resStatus: 401});
              }
            }).catch(function(err) {
            global.log.error(err);
            return reject(err);
          });
        } else {
          //if timestamp < 1 day, find if the email exists
          Math.floor(Date.now() / 1000) < payload.expiration ? resolve({
              boolean: true,
              email: payload.email
            }) : resolve({boolean: false, email: payload.email, resStatus: 401});
        }
      }
    });
  }
};
