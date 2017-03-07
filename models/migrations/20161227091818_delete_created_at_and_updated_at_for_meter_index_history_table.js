exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter_index_history', function(table) {
      table.dropColumn('created_at');
      table.dropColumn('updated_at');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter_index_history', function(table) {
      table.timestamps();
    })
  ]);
};
