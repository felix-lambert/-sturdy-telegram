exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account_transaction', function(table) {
      table.integer('current_credit').after('amount');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('account_transaction', function(table) {
      table.dropColumn('current_credit')
    }
  )
};