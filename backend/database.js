const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'restaurant_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Tạo connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Đã kết nối MySQL database thành công');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối database:', err.message);
    console.log('💡 Hãy đảm bảo MySQL đã được cài đặt và database đã được tạo');
  });

module.exports = pool;
