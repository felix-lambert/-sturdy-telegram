exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('user_history', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('user_id')
        .unsigned().index()
        .references('id')
        .inTable('user');
      table.integer('timestamp');
      table.string('endpoint');
      table.string('verb');
      table.integer('response_code');
      table.text('parameter');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('user_history')
  ]);
};
