exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.float('subscription_daily_fee', 15,6)
        .after('country_code');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};