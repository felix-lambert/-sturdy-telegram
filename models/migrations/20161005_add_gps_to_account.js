exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
        table.float('gps_lat', 10,6)
            .after('country_code');
        table.float('gps_lon', 10,6)
            .after('gps_lat');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};