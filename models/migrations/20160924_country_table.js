exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('country', function(table) {
      table.dropColumn('ISO_code');
      table.dropColumn('id');
      table.string('ISO_alpha', 2).unique().first();
      table.string('phone_code').after('name');
      table.integer('ISO_numeric').unique().after('currency');
    }),

    knex.schema.table('account', function(table) {
      if (knex.client.config.client === 'sqlite3') {
        table.string('country_code', 2)
            .after('city');
      } else {
        table.dropForeign('country_id');
        table.string('country_code');
        table.dropColumn('country_id');
      }
    }),

    knex.schema.table('utility', function(table) {
      if (knex.client.config.client === 'sqlite3') {
        table.string('country_code', 2)
            .after('city');
      } else {
        table.dropForeign('country_id');
        table.string('country_code');
        table.dropColumn('country_id');
      }
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};