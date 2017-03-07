exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user', function(table) {
      table.boolean('api_token').after('salt');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
      table.dropColumn('api_token')
    }
  )
};