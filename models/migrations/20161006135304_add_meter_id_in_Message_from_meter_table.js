exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('message_from_meter', function(table) {
      table.integer('meter_id')
        .unsigned().index()
        .references('id')
        .inTable('meter');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('message_from_meter', function(table) {
      table.dropColumn('meter_id')
    }
  )
};