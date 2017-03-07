exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.integer('test_account').after('contact_phone_number');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('account', function(table) {
      table.dropColumn('test_account');
    }
  );
};
