/**
 * CT Cloud API
 * ======================
 * Components helperOnFinish tests
 *
 * Copyright: Citytaps 2017
 *
 */

'use strict';

const fs = require('fs');

module.exports = ({database, testedModule, filename}) => {
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
  if (database) {
    database.bookshelf.knex.destroy();
  }

  if (testedModule) {
    testedModule.server.close();
  }
  if (global.log) {
    global.log.info('# Cleaning up');
  }
};

