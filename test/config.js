/**
 * CT Cloud API
 * ======================
 * Components config
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

require('./helperCheckEnv')();
const configTest     = require('../config/config.test');

/*  with the advent of ES6 (ES2015), it is actually 
 *  possible to use a global variable
 */
global.config = configTest;
