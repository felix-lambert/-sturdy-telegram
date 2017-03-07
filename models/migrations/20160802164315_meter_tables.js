


exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('account', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('utility_id')
        .unsigned().index()
        .references('id')
        .inTable('utility');
      table.string('utility_identifier').unique();
      table.string('first_name');
      table.string('last_name');
      table.string('address');
      table.string('zipcode');
      table.string('city');
      table.integer('country_id')
        .unsigned().index()
        .references('id')
        .inTable('country');
      table.string('contact_phone_number').unique();
      table.string('contact_email');
      table.integer('activation_date');
      table.integer('deactivation_date');
      table.float('current_credit');
      table.integer('cycle_date');
      table.integer('cycle_cumulated_consumption');
      table.timestamps();
    }),
    knex.schema.createTable('account_transaction', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('timestamp');
      table.float('amount');
      table.string('origin');
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.timestamps();
    }),
    knex.schema.createTable('country', function(table) {
      table.string('name').unique();
      table.increments('id').primary().unsigned();
      table.string('currency');
      table.string('ISO_code').unique();
      table.timestamps();
    }),
    knex.schema.createTable('meter', function(table) {
      table.increments('id').primary().unsigned();
      table.string('serial').unique();
      table.string('radio_identifier').unique();
      table.integer('last_connection');
      table.integer('last_index').unsigned();
      table.integer('index_ceiling').unsigned();
      table.integer('valve_status').unsigned();
      table.integer('temperature');
      table.string('activation_date');
      table.string('deactivation_date');
      table.integer('offset');
      table.integer('account_id')
        .unsigned().index()
        .references('id')
        .inTable('account');
      table.timestamps();
    }),
    knex.schema.createTable('message_from_meter', function(table) {
      table.increments('id').primary().unsigned();
      table.string('radio_identifier');
      table.integer('timestamp');
      table.text('message');
      table.string('decodedData');
      table.timestamps();
    }),
    knex.schema.createTable('message_to_meter', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('meter_id')
        .unsigned().index()
        .references('id')
        .inTable('meter');
      table.string('type_of_message');
      table.string('message_base_64');
      table.string('payload');
      table.json('message');
      table.timestamps();
    }),
    knex.schema.createTable('user', function(table) {
      table.increments('id').primary().unsigned();
      table.string('first_name');
      table.string('last_name');
      table.string('email').unique();
      table.string('password_hash');
      table.string('salt');
      table.timestamps();
    }),
    knex.schema.createTable('utility', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('country_id')
        .unsigned().index()
        .references('id')
        .inTable('country');
      table.string('name');
      table.json('contact_info');
      table.json('price_grid');
      table.timestamps();
    }),
    knex.schema.createTable('meter_index_history', function(table) {
      table.increments('id').primary().unsigned();
      table.integer('meter_id')
        .unsigned().index()
        .references('id')
        .inTable('meter');
      table.integer('index');
      table.timestamps();
    })
  ]);
};
exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('message_from_meter'),
    knex.schema.dropTable('meter_index_history'),
    knex.schema.dropTable('account_transaction'),
    knex.schema.dropTable('message_to_meter'),
    knex.schema.dropTable('user'),
    knex.schema.dropTable('meter'),
    knex.schema.dropTable('account'),
    knex.schema.dropTable('utility'),
    knex.schema.dropTable('country'),
  ]);
};