/**
 * CT Cloud Common Models
 * ======================
 * This package contains the DB models used by CT Cloud
 *
 * @Authors: Thomas Lim
 * @Copyright: Citytaps 2016
 *
 */
'use strict';

/**
 * Module Common description
 * @param  {Object} JSON config {"knex":{"client":"sqlite3","connection":{"filename":"filename"},"useNullAsDefault":true},"mqtt":{"mqttUrl":"mqtt://test.mosquitto.org"},"loggerConfig":{"name":"logger name","streams":""}
 * @returns {Object} Contains model classes, Bookshelf, Migrate, _config <br>{<br>Bookshelf:..,<br>  Migrate:..,<br>_config,<br>[class]<br>}
 * @module Common
 */
const knex = require('knex')(global.config.knex);
/* The Bookshelf library is initialized by passing 
 an initialized Knex client instance */
const Bookshelf = require('bookshelf')(knex);

/**
 *  This plugin allows you to specify relations between
 *  models using a string instead of passing variables
 */
Bookshelf.plugin('registry');
Bookshelf.plugin('pagination');
Bookshelf.plugin(require('bookshelf-scopes'));

/**
 * Helper to apply all migrations to DB
 * @memberof Common#
 * @returns {Promise}
 * @function
 */
const Migrate = knex.migrate.latest(global.config.knex);

module.exports.bookshelf = Bookshelf;
module.exports.migrate   = Migrate;

