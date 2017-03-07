exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('account', function(table) {
      table.integer('installation_date').after('contact_email');
      table.integer('payement_activation_date').after('contact_email');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('account', function(table) {
    table.dropColumn('installation_date');
    table.dropColumn('payement_activation_date');
    }
  );
};
