// (5e) Establishes the connection between the API and the MySQL database
// created in schema.sql, using the mysql2 driver's promise-based pool.
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your_mysql_password", // <-- replace with your local MySQL password
  database: "facultypulse",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();
