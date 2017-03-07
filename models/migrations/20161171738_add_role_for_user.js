exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user', function(table) {
      table.string('role').after('salt');
    })
  ]);
};

exports.down = function(knex) {
  return knex.schema.table('user', function(table) {
      table.dropColumn('role');
    }
  )
};