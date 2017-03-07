exports.up = function(knex, Promise) {
return Promise.all([

    knex('utility').insert({
      name: 'CityTaps',
      country_code: 'FR'
    },
    {
      name: 'SEEN',
      country_code: 'NE'
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};