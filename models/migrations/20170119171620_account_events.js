exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('account_event', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.integer('timestamp');
      table.string('event_type');
      table.text('comment');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('account_event')
  ]);
};