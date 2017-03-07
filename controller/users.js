// require models
let UserModel = require('../models/tables/UserModel');

module.exports = {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */
  /**
   * @api {get} /users Get all users
   * @apiName getAllUsers
   * @apiGroup User
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiSuccess {[Object]} all users returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 OK
   *      [
   *        { 
   *          id: 1,
   *          first_name: 'Admin',
   *          last_name: 'CityTaps',
   *          email: 'admin@citytaps.org',
   *          api_secret: null,
   *          password_hash: '$2a$10$h0JFI3uAUuJ4umriNir/seQpuOEAQuvjekMmMuPgRaiO3.d/K4BvG',
   *          salt: 'e62c4d0be4e8369b1ca4815ab0d8297afa96a8c5',
   *          api_token: null,
   *          created_at: null,
   *          updated_at: 2016-09-27T16:20:26.000Z 
   *        },
   *        { 
   *          id: 4,
   *          first_name: 'Martin',
   *          last_name: 'Bruder',
   *          email: 'martin@citytaps.org',
   *          api_secret: null,
   *          password_hash: '$2a$10$WP0gRNSsvZDEsSIU3CnIXuhDxZCPLzcds67bSblkR7AO39qxQ4EyW',
   *          salt: 'e883278a7e235cbb660e50b0958e7b56244176cc',
   *          api_token: null,
   *          created_at: 2016-09-21T06:06:06.000Z,
   *          updated_at: 2016-09-26T15:23:26.000Z 
   *        }
   *      ]
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  getAllUsers(req, res) {
    // get all users informations
    UserModel.getAllAsArray().then((allUsers) => {
      global.log.info(`${req.decoded.email} - getAllUsers`);
      res.json(allUsers);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - getAllUsers - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {post} /user Create user account
   * @apiName createUser
   * @apiGroup User
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiParam {String} email Mandatory email.
   * @apiParam {String} first_name Mandatory Firstname of the Account.
   * @apiParam {String} last_name Mandatory Lastname of the Account.
   * @apiParam {String} password Mandatory password.
   *
   * @apiSuccess {json} user created returned.
   *
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   */
  createUser(req, res) {
    const user = req.body;
    UserModel.create(user)
      .then((obj) => {
        global.log.info(`${req.decoded.email} - createUser`);
        res.json(obj);
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - createUser - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  },

  /**
   * @api {get} /user/:user_id Get user details
   * @apiName GetUser
   * @apiGroup User
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
   * @apiVersion 1.0.0
   *
   * @apiParam {String} meter_id Mandatory user id
   *
   * @apiSuccess {json} user details returned.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 201 Created
   *      { 
   *        id: 1,
   *        first_name: 'Admin',
   *        last_name: 'CityTaps',
   *        email: 'admin@citytaps.org',
   *        api_secret: null,
   *        password_hash: '$2a$10$h0JFI3uAUuJ4umriNir/seQpuOEAQuvjekMmMuPgRaiO3.d/K4BvG',
   *        salt: 'e62c4d0be4e8369b1ca4815ab0d8297afa96a8c5',
   *        api_token: null,
   *        created_at: null,
   *        updated_at: 2016-09-27T16:20:26.000Z
   *      }
   *
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  getUser(req, res) {
    const userId = req.params.user_id;
    //get the meter information
    UserModel.getById(userId).then((user) => {
      global.log.info(`${req.decoded.email} - ${userId} - getUser`);
      res.json(user);
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - getUser - ${err}`);
      res.status(500).json({
        "error": "ServerError"
      });
    });
  },
  
  /**
   * @api {patch} /user/:user_id Update user details
   * @apiName UpdateUser
   * @apiGroup User
   * @apiParam {String} user_id Mandatory user id
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiSuccess {json} user updated.
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: 1,
   *        first_name: 'Admin',
   *        last_name: 'citytaps',
   *        email: 'admin@citytaps.org',
   *        api_secret: null,
   *        password_hash: '$2a$10$h0JFI3uAUuJ4umriNir/seQpuOEAQuvjekMmMuPgRaiO3.d/K4BvG',
   *        salt: 'e62c4d0be4e8369b1ca4815ab0d8297afa96a8c5',
   *        api_token: null,
   *        created_at: null,
   *        updated_at: '2016-09-27T16:20:26.000Z' 
   *      }
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  updateUser(req, res) {
    const userID = req.params.user_id;
    const user   = req.body;
    UserModel.getById(userID).then((userInstance) => {
      let newUserInfo = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      };
      if (req.decoded.role === 'SuperAdmin' || req.decoded.role === 'Admin') {
        newUserInfo.role = user.role;
      }
      userInstance.update(newUserInfo)
        .then(() => {
          global.log.info(`${req.decoded.email} - updateUser - ${newUserInfo.email}`);
          res.json(user);
        })
        .catch((err) => {
          global.log.error(`${req.decoded.email} - updateUser - ${err}`);
          res.status(500).json({"error": "ServerError"});
        });

    }).catch((err) => {
      global.log.error(`${req.decoded.email} - ${userID} - updateUser - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {delete} /user/:user_id Delete user
   * @apiName deleteUser
   * @apiGroup User
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiParam {String} user id Mandatory user id
   *
   * @apiSuccess {json} user deleted.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        id: '12'
   *      }
   *
   * @apiError ServerError Server error.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   */
  deleteUser(req, res) {
    const userId = req.params.user_id;
    UserModel.destroyUser(userId).then((userDestroy) => {
      if (userDestroy) {
        global.log.info(`${req.decoded.email} - ${userId} - deleteUser`);
        res.json(req.params);
      }
    }).catch((err) => {
      global.log.error(`${req.decoded.email} - deleteUser - ${err}`);
      res.status(500).json({"error": "ServerError"});
    });
  },

  /**
   * @api {patch} /user/:user_id/updatePassword Delete user
   * @apiName updatePassword
   * @apiGroup User
   * @apiHeader {String} token User unique access-key.
   * @apiPermission SuperAdmin, Admin
   * @apiVersion 1.0.0
   *
   * @apiParam {String} user id Mandatory user id
   *
   * @apiSuccess {json} password updated.
   *
   * @apiSuccessExample Success-Response:
   *      HTTP/1.1 200 Ok
   *      {
   *        "message": "success"
   *      }
   *
   * @apiError ServerError Server error.
   * @apiError UpdatedFailed The password has not been changed.
   *
   * @apiErrorExample ServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "ServerError"
   *     }
   *
   *  @apiErrorExample UpdatedFailed-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "error": "UpdateFailed"
   *     }
   *
   */
  updatePassword(req, res) {
    const userId   = req.params.user_id;
    const password = req.body.newPassword;
    UserModel.updatePassword(userId, password)
      .then((userPasswordChange) => {
        if (userPasswordChange) {
          global.log.info(`${req.decoded.email} - ${userId} - updatePassword`);
          res.json({"message": "success"});
        } else {
          global.log.error(`${req.decoded.email} - ${userId} - don't exist`);
          res.status(403).json({"error": "UpdateFailed"});
        }
      })
      .catch((err) => {
        global.log.error(`${req.decoded.email} - updatePassword - ${err}`);
        res.status(500).json({"error": "ServerError"});
      });
  }

};
