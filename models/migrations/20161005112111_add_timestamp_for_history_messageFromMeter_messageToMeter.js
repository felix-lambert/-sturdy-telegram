exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter_index_ceiling_history', function(table) {
      table.integer('timestamp');
    }),
    knex.schema.table('meter_index_history', function(table) {
      table.integer('timestamp');
    }),
    knex.schema.table('meter_temperature_history', function(table) {
      table.integer('timestamp');
    }),
    knex.schema.table('message_to_meter', function(table) {
      table.integer('timestamp');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    Promise.resolve()
  ]);
};