exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account_transaction', function(table) {
        table.dropColumn('amount');
      })
      .then(function(){
        return knex.schema.table('account_transaction', function(table) {
            table.float('amount', 15,6)
            .after('timestamp');
        });
      })

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
