exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('account_consumption_history', function(table) {
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
      table.integer('index');
      table.integer('offset');
      table.integer('consumption');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {

  return Promise.all([
    knex.schema.dropTable('account_consumption_history')
  ]);
};