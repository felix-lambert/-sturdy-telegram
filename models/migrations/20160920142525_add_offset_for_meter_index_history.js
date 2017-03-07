exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter_index_history', function(table) {
      table.integer('offset');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('meter_index_history', function(table) {
      table.dropColumn('offset')
    }
  )
};