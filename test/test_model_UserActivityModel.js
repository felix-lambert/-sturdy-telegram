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
const fs   = require('fs');

test('** Setup environment for UserActivityModel tests **', function(assert) {
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

test('UserActivityModel: create', function(assert) {
  assert.plan(2);

  const UserModel         = require('../models/tables/UserModel');
  const userActivityModel = require('../models/tables/UserActivityModel');
    const interceptorData = {
      timestamp: Date.now() / 1000,
      responseCode: 200,
      ipAdress: 1234,
      endPoint: '/accounts',
      verb: 'GET',
      reqParams: {}
    };

  const userInfo          = {
    "email": "john@test.com",
    "first_name": "John",
    "last_name": "Doe",
    "password_hash": "secret",
    "permission": {"role": "SuperAdmin"}
  };
  UserModel.create(userInfo)
    .then((instance) => {
      assert.pass('createUser with id ' + instance.get('id'));
      userActivityModel.create(interceptorData)
        .then((model) => {
          assert.equal(model.get('timestamp'), interceptorData.timestamp, 'UserActivity created with success');
        })
        .catch((err) => {
          assert.fail('create user activity failed ' + err);
        });
    })
    .catch((err) => {
      assert.fail('createUser failed ' + err);
    });
});
