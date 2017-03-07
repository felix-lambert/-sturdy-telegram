exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.integer('payment_enabled').after('last_name').unsigned();
    })
  ]);
}

exports.down = function(knex, Promise) {
  return knex.schema.table('account', function(table) {
      table.dropColumn('payment_enabled');
    }
  )
};