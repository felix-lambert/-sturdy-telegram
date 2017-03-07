exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.integer('subscription_daily_fee')
        .after('last_name');
      table.integer('subscription_fee')
        .after('subscription_daily_fee');
      table.integer('cycle_paid_subscription')
        .after('subscription_fee');
    }),
  ]);
};

exports.down = function() {
  return Promise.resolve();
};
