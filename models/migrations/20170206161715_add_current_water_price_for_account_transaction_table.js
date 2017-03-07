exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account_transaction', function(table) {
      table.float('current_water_price', 8, 2).after('amount');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('account_transaction', function(table) {
      table.dropColumn('current_water_price');
    }
  );
};
