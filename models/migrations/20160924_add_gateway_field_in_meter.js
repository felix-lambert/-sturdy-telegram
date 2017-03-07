exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter', function(table) {
      table.string('gateway');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('meter', function(table) {
      table.dropColumn('gateway');
    }
  )
};