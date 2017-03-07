exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('sms_outgoing', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.integer('timestamp');
      table.string('recipient');
      table.string('message');
      table.timestamps();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('sms_outgoing')
  ]);
};