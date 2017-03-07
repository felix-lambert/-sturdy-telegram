/*eslint-env node*/
const AccountEventModel = require('../models/tables/AccountEventModel');
module.exports           = {
  create,
  getAllAsArrayByAccountId,
  getAllAsArray
};

function create(accountId, eventType, comment) {
  const timestamp        = Date.now() / 1000;
  const stringifyComment = comment ? JSON.stringify(comment) : null;
  return AccountEventModel.create(accountId, timestamp, eventType, stringifyComment);
}


/**
 * @api {get} /accounts/:account_id/events/:pageSize/:page Get all account events by id
 * @apiName getAccountEventsById
 * @apiGroup Account
 * @apiHeader {String} token User unique access-key.
 * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
 * @apiVersion 1.0.0
 *
 * @apiSuccess {[object]} all account events by id returned.
 * @apiParam {String} account_id Mandatory account id.
 * @apiParam {Number} [pageSize] Optional meter serial.
 * @apiParam {Number} [page] Optional page.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 {
   "id": 1,
   "account_id": 25,
   "timestamp": 1485781169,
   "event_type": "CREDIT_ADDED",
   "comment": "{\"creditAdded\":1}"
 },
 {
   "id": 2,
   "account_id": 25,
   "timestamp": 1485783873,
   "event_type": "CREDIT_ADDED",
   "comment": "{\"creditAdded\":1}"
 }
 ]
 *
 * @apiError ServerError Server error.
 *
 *
 * @apiErrorExample ServerError-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ServerError"
 *     }
 */
function getAllAsArrayByAccountId(req, res) {
  const {account_id, pageSize, page} = req.params;
  AccountEventModel.getAllAsArrayByAccountId(account_id, pageSize, page)
    .then((eventsData) => {
      if (!eventsData) {
        return res.json([]);
      } else {
        global.log.info(`${req.decoded.email} - ${account_id} - getAccountEventsById`);
        return res.json(eventsData);
      }
    })
    .catch((err) => {
      global.log.error(`${req.decoded.email} - getMeterMessage - ${err}`);
      return res.status(500).json({"error": "ServerError"});
    });
}


/**
 * @api {get} /accounts/events/:pageSize/:page Get all account events
 * @apiName getAccountEvents
 * @apiGroup Account
 * @apiHeader {String} token User unique access-key.
 * @apiPermission SuperAdmin, Admin, CustomerManager, Reader
 * @apiVersion 1.0.0
 *
 * @apiSuccess {[object]} all account events returned.
 * @apiParam {Number} [pageSize] Optional meter serial.
 * @apiParam {Number} [page] Optional page.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 {
   "id": 1,
   "account_id": 25,
   "timestamp": 1485781169,
   "event_type": "CREDIT_ADDED",
   "comment": "{\"creditAdded\":1}"
 },
 {
   "id": 2,
   "account_id": 29,
   "timestamp": 1485783873,
   "event_type": "CREDIT_ADDED",
   "comment": "{\"creditAdded\":1}"
 }
 ]
 *
 * @apiError ServerError Server error.
 *
 *
 * @apiErrorExample ServerError-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "ServerError"
 *     }
 */
function getAllAsArray(req, res) {
  const {pageSize, page} = req.params;
  AccountEventModel.getAllAsArray(pageSize, page)
    .then((eventsData) => {
      if (!eventsData) {
        return res.json([]);
      } else {
        global.log.info(`${req.decoded.email} - getAccountEvents`);
        return res.json(eventsData)
      }
    })
    .catch((err) => {
      global.log.error(`${req.decoded.email} - getMeterMessage - ${err}`);
      return res.status(500).json({"error": "ServerError"});
    });
}