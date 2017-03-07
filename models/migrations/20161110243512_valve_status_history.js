exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('valve_status_history', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.integer('meter_id')
        .unsigned().index()
        .references('id')
        .inTable('meter');
      table.integer('timestamp');
      table.integer('valve_status');
    })
  ]);
};

exports.down = function(knex, Promise) {

  return Promise.all([
    knex.schema.dropTable('valve_status_history')
  ]);
};