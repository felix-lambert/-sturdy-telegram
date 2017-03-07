exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('account_phone_number', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.string('phone_number').unique();
    }),
    knex.schema.dropTable('attached_phone_numbers')
  ]);
};

exports.down = function(knex, Promise) {

  return Promise.all([
    knex.schema.dropTable('account_phone_number'),
    knex.schema.createTable('attached_phone_numbers', function(table) {
      table.increments('id').primary().unsigned();
    }),

  ]);
};