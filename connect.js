const options = {
  // Initialization Options
};

const pgp = require('pg-promise')(options);
const connectionString = 'postgres://postgres:51julie2@localhost:5432/msmrubydev';
const db = pgp(connectionString);

module.exports = db;
