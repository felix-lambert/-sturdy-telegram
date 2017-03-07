exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('attached_phone_numbers', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.string('phone_number').unique();
    })
  ]);
};

exports.down = function(knex, Promise) {

  return Promise.all([
  ]);
};