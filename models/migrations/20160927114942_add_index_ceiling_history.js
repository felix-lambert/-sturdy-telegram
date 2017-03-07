exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('meter_index_ceiling_history', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('meter_id')
        .unsigned().index()
        .references('id')
        .inTable('meter');
      table.integer('index_ceiling');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('meter_index_ceiling_history')
};