exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user', function(table) {
      table.string('api_secret').after('email');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
      table.dropColumn('api_secret')
    }
  )
};