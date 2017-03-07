exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('sms_outgoing', function(table) {
      table.string('type').after('message');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('sms_outgoing', function(table) {
      table.dropColumn('type');
    }
  );
};
