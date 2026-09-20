const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo connection pool - dùng pool thay vì 1 connection đơn để backend
// có thể xử lý nhiều request cùng lúc mà không bị nghẽn
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;