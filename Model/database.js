const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "MYSQL8002.site4now.net",
  user: "aad665_abdred",
  password: "pirate47219930",
  database: "db_aad665_pharma",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

module.exports = pool;
