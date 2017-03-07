exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter', function(table) {
      table.integer('message_frequency');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('meter', function(table) {
      table.dropColumn('message_frequency')
    }
  )
};