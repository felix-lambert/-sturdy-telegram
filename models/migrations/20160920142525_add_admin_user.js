exports.up = function(knex, Promise) {
  return Promise.all([
    knex('user').insert({
      first_name: 'admin',
      last_name: 'admin',
      email: 'admin@citytaps.org',
      password_hash: '$2a$10$h0JFI3uAUuJ4umriNir/seQpuOEAQuvjekMmMuPgRaiO3.d/K4BvG',
      salt: 'e62c4d0be4e8369b1ca4815ab0d8297afa96a8c5'
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};