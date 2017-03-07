const bcrypt                     = require('bcrypt-nodejs');
const crypto                     = require('crypto');
const {PASSWORD_SALT_LENGTH}     = require('../../config/constants');
let Bookshelf                    = require('../database').bookshelf;

/* INSTANCES
  setPassword(password)
  isPasswordValid(password)
  getRole()
  update(userUpdated)
*/
/*
  create(json)
  getAllAsArray(pageSize = 50, page = 1)
  getAllAsArrayByAccountId(account_id, pageSize, page)
*/

/**
 * Represents a user instance
 * @constructor User
 * @memberof Common#
 */
let user = Bookshelf.Model.extend({
  tableName: 'user',
  hasTimestamps: true,

  /**
   * Set the password of current user
   * @param {string} password [description]
   * @returns {Promise}
   * @memberof User#
   */
  setPassword(password) {
    return new Promise((resolve, reject) => {
      let salt = crypto.randomBytes(PASSWORD_SALT_LENGTH).toString('hex');

      bcrypt.hash(password + salt, null, null, (err, password_hash) => {
        if (err) {
          return reject(err);
        }

        this.save({password_hash, salt})
          .then((userInstance) => {
            return resolve(userInstance);
          })
          .catch((error) => {
            return reject('ERROR WHEN SAVE DATA IN User : ' + error.toString());
          });
      });
    });
  },

  /**
   * Compare submitted password with stored one
   * @param {string} password [description]
   * @returns {Promise}
   * @memberof User#
   */
  isPasswordValid(password) {

    return new Promise((resolve, reject) => {
      bcrypt.compare(password + this.get('salt'), this.get('password_hash'), function(err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  },
  
  getRole() {
    return new Promise((resolve, reject) => {
      this.get('role') ? resolve(this.get('role')) : reject('No roles');
    });
  },

  update(userUpdated) {
    return this.save(userUpdated, {patch: true});
  }
}, {
  /* 
   * with property value shorthand
   * syntax, you can omit the property
   * value if key matches variable
   */

  /**
   * Create a new User
   * @param  {Object} json {"email":"j@test.com", "first_name": "John", "last_name": "Doe", "password": "secret"}
   * @return {Promise}     User instance or error
   * @memberof User#
   * @static
   */
  create(json) {
    return new Promise((resolve, reject) => {
      this.forge({
        email: json.email,
        first_name: json.first_name || '',
        last_name: json.last_name || '',
        api_secret: json.api_secret || '',
        role: json.role,
        language: json.language
      }).save().then((userInstance) => {
        return userInstance.setPassword(json.password);
      }).then((userInstance) => {
        return resolve(userInstance);
      }).catch((err) => {
        return reject('ERROR WHEN SAVE DATA IN User : ' + err.toString());
      });
    });
  },

  /**
   * Delete an user instance
   * @param {int} user_id ID of the user to delete
   * @returns {Promise}
   * @memberof User#
   * @static
   */
  destroyUser(id) {
    return this.forge({id}).destroy();
  },

  getAllAsArray() {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.forge().fetchAll()
        .then(function(results) {
          return resolve(results);
        })
        .catch(function(err) {
          return reject(err);
        });
    });
  },

  getById(id) {
    return this.where({id}).fetch();
  },

  getByEmail(email) {
    return this.where({email}).fetch();
  },

  updatePassword(id, newPassword) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.getById(id)
        .then(function(userInstance) {
          if (!userInstance) {
            return resolve(false);
          } else {
            userInstance.setPassword(newPassword)
              .then(function() {
                resolve(true);
              })
              .catch(function(err) {
                reject(err);
              });
          }
        }).catch(function(err) {
          reject(err);
        });
    });
  },
  
  updateUserApiSecret(id, api_secret) {
    return this
      .forge({id})
      .save({api_secret}, {patch: true});
  }
});

module.exports = Bookshelf.model('user', user);
