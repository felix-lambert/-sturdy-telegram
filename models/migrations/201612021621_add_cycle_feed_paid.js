exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.dropColumn('subscription_daily_fee');
    }),
  ]);
};

exports.down = function() {
  return Promise.resolve();
};