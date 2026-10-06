require("dotenv").config();
const mysql = require("mysql2");

// (5e) Establishes the connection between the API and the MySQL database
// created in schema.sql, using the mysql2 driver's promise-based pool.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "VYSHUNANI",
  database: process.env.DB_NAME || "facultypulse",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();
