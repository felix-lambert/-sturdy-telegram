/**
 * CT Cloud API
 * ======================
 * Components model tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const test = require('tape');
// const config = require('./config.js');

test('** Setup environment for AccountEventModel tests **', function(assert) {
  assert.plan(1);

  const prepare_test_env = require('./prepare_test_env');

  prepare_test_env()
    .then(() => {
      assert.pass('Test env setup done');
    }).catch((err) => {
    assert.fail('Test env setup error ' + err);
  });
});

/**
 * Tests
 */
test('AccountEventModel: create', function(assert) {
  assert.plan(8);

  const UserModel         = require('../models/tables/UserModel');
  const AccountEventModel = require('../models/tables/AccountEventModel');
  const AccountModel      = require('../models/tables/AccountModel');

  const timestamp = Date.now() / 1000;
  const eventType = 'CREDIT_ADDED';
  const comment   = '{"creditAdded":1}';
  const userInfo  = {
    "email": "john@test.com",
    "first_name": "John",
    "last_name": "Doe",
    "password_hash": "secret",
    "permission": {"role": "SuperAdmin"}
  };

  UserModel.create(userInfo)
    .then((instance) => {
      assert.pass('createUser with id ' + instance.get('id'));


      AccountModel.create({
        "contact_email": "test_account@test.com",
        "last_name": "John ",
        "first_name": "Doe",
        "contact_phone_number": "+22792700405"
      })
        .then(function(accountInstance) {
          AccountEventModel.create(accountInstance.get('id'), timestamp, eventType, comment)
            .then((eventInstance) => {
              assert.equal(eventInstance.get('account_id'), accountInstance.get('id'), 'accountEvents created with true id');
              assert.equal(eventInstance.get('timestamp'), timestamp, 'accountEvent created with true timestamp');
              assert.equal(eventInstance.get('event_type'), eventType, 'accountEvent created with true event_type');
              assert.equal(eventInstance.get('comment'), comment, 'accountEvent created with true comment');

              AccountEventModel.getAllAsArray()
                .then(function(accountEventsArray) {
                  if (accountEventsArray.length > 0) {
                    assert.pass('getAllAsArray passed');
                  } else {
                    assert.fail('getAllAsArray account events failed, return no events');
                  }
                })
                .catch(function(err) {
                  assert.fail('getAllAsArray account events failed ' + err);
                });

              AccountEventModel.getAllAsArrayByAccountId(accountInstance.get('id'))
                .then(function(arrayByAccountId) {
                  assert.equal(arrayByAccountId.models[0].get('account_id'), accountInstance.get('id'), 'get accountEvents by array by id');
                })
                .catch((err) => {
                  assert.fail('get accountEvents by array by id failed ' + err);
                });
              AccountEventModel.getByEventType(eventType)
                .then(function(eventTypeArray) {
                  if (eventTypeArray.length > 0) {
                    assert.pass('get accountEvents by event type passed');
                  } else {
                    assert.fail('get accountEvents by event type failed, return no events');
                  }
                })
                .catch((err) => {
                  assert.fail('get accountEvents by array by event type failed ' + err);
                });
            })
            .catch((err) => {
              assert.fail('create account events failed ' + err);
            });
        });
    })
    .catch((err) => {
      assert.fail('createUser failed ' + err);
    });
});
