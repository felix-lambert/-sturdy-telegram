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

test('** Setup environment for UserModel tests **', function(assert) {
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


const json = { "email": "john@test.com", "first_name": "John", "last_name": "Doe", "password_hash": "secret", "permission":{"role": "SuperAdmin"} };
const testedUserId = 1;
const testedEmail = 'anne@test.fr';
const testedPassword = 'password';

test('UserModel: createUser', function(assert) {
  assert.plan(1);

  const UserModel = require('../models/tables/UserModel');

  UserModel.create(json)
    .then((instance) => {
      assert.pass('createUser with id ' + instance.get('id'));
    })
    .catch((err) => {
      assert.fail('createUser failed ' + err);
    });
});

test('UserModel: getById', function(assert) {
  assert.plan(1);

  const UserModel = require('../models/tables/UserModel');

  UserModel.getById(testedUserId)
    .then((instance) => {
      assert.equal(instance.get('first_name'), 'Anne', 'getById with id 1 is Anne O\'Nyme ' + instance.first_name);
    })
    .catch((err) => {
      assert.fail('getById failed ' + err);
    });
});

test('UserModel: getByEmail', function(assert) {
  assert.plan(1);

  const UserModel = require('../models/tables/UserModel');

  UserModel.getByEmail(testedEmail)
    .then((instance) => {
      assert.pass('getById with email ' + testedEmail + ': ' + instance.get('first_name') + ' ' + instance.get('last_name'));
    })
    .catch((err) => {
      assert.fail('getById failed ' + err);
    });
});

test('UserModel: savePassword', function(assert) {
  assert.plan(1);

  const UserModel = require('../models/tables/UserModel');

  UserModel.getById(testedUserId)
    .then((instance) => {
      instance.setPassword(testedPassword)
        .then(() => {
          assert.pass('savePassword succeed');
        });
    })
    .catch((err) => {
      assert.fail('savePassword failed ' + err);
    });
});

test('UserModel: isPasswordValid', function(assert) {
  assert.plan(2);

  const UserModel = require('../models/tables/UserModel');

  UserModel.getById(testedUserId)
    .then((instance) => {
      instance.isPasswordValid(testedPassword)
        .then((res) => {
          assert.equal(res, true, 'isPasswordValid with valid password returned true');
        })
        .catch((err) => {
          assert.fail('isPasswordValid failed ' + err);
        });

      instance.isPasswordValid(testedPassword + '1')
        .then((res) => {
          assert.equal(res, false, 'isPasswordValid with wrong password returned false');
        })
        .catch((err) => {
          assert.fail('isPasswordValid failed ' + err);
        });
    })
    .catch((err) => {
      assert.fail('isPasswordValid failed ' + err);
    });
});

test('UserModel: getAllAsArray', function(assert) {
  assert.plan(1);

  const UserModel = require('../models/tables/UserModel');

  UserModel.getAllAsArray()
    .then((data) => {
      assert.equal(typeof(data), 'object', 'getAllAsArray returns an array');
    })
    .catch((err) => {
      assert.fail('getAllAsArray error: ' + err);
    });
});

test('UserModel: destroyUser', function(assert) {
  assert.plan(1);

  const UserModel = require('../models/tables/UserModel');

  UserModel.destroyUser(testedUserId)
    .then((data) => {
      assert.pass('destroyUser succeed');
    }).catch((err) => {
      assert.fail('destroyUser error: ' + err);
    });
});
