exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('sms_incoming', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.string('sender');
      table.json('message');
      table.integer('operator_id');
      table.integer('timestamp');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('sms_incoming')
};