exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('sms_incoming', function(table) {
      table.string('status').after('message');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('sms_incoming', function(table) {
      table.dropColumn('status')
    }
  )
};