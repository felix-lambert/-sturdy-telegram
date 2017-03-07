exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
        table.dropColumn('current_credit');
      })
      .then(function(){
        return knex.schema.table('account', function(table) {
            table.float('current_credit', 15,6)
            .after('cycle_date');
        });
      }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};
