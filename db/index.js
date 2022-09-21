const Pool = require("pg").Pool;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = new Pool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  database: process.env.DBDATABASE,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT

});

db.connect((err, client, done) => {
  if (err) {
    console.log(err);
  } else {
    console.log('successful postgreSQL connection')
  }
})


module.exports = db;