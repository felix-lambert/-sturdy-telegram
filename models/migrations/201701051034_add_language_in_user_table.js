exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user', function(table) {
      table.string('language').after('role');
    })
  ]);
};

exports.down = function(knex) {
  return knex.schema.table('user', function(table) {
      table.dropColumn('language');
    }
  );
};
