const Pool = require("pg").Pool;

const db = new Pool({
  host: "localhost",
  database: "sdc",
  password: "",
  port: 5432
});

db.connect((err, client, done) => {
  if (err) {
    console.log(err);
  }
  console.log('successful postgreSQL connection')
})


module.exports = db;