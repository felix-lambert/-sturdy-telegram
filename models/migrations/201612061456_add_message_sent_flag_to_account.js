exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.integer('warning_message_sent')
        .after('payment_enabled');
    }),
  ]);
};

exports.down = function(knex) {
  return knex.schema.table('account', function(table) {
    table.dropColumn('warning_message_sent');
  });
};
