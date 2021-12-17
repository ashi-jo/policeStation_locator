const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "cleangenix_sdb",
  password: "MYPASS123",
  port: 5432,
});

module.exports = pool;
