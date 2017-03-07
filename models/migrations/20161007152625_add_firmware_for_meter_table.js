exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter', function(table) {
      table.string('firmware').after('radio_identifier');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('meter', function(table) {
      table.dropColumn('firmware')
    }
  )
};