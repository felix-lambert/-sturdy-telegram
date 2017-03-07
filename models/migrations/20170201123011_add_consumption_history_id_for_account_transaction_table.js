exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account_transaction', function(table) {
      table.integer('consumption_history_id')
        .unsigned().index()
        .references('id')
        .inTable('account_consumption_history');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('account_transaction', function(table) {
    table.dropColumn('consumption_history_id');
    }
  );
};
