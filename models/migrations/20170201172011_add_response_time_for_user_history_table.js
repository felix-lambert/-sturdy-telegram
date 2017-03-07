exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('user_history', function(table) {
      table.float('response_time').after('response_code');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user_history', function(table) {
    table.dropColumn('response_time');
    }
  );
};
