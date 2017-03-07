exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('meter', function(table) {
      table.integer('pcb-serial').after('firmware').unsigned();
      table.integer('radio-serial').after('pcb-serial').unsigned();
      table.integer('meter-serial').after('radio-serial').unsigned();  
      table.dropColumn('activation_date');
      table.dropColumn('deactivation_date');
    })
  ]);
}

exports.down = function(knex, Promise) {
  return knex.schema.table('meter', function(table) {
      table.dropColumn('pcb-serial');
      table.dropColumn('radio-serial');
      table.dropColumn('meter-serial');
    }
  )
};