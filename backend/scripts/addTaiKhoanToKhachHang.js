const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addTaiKhoanColumn = async () => {
  let connection;
  
  try {
    // Kết nối database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'restaurant_db',
      multipleStatements: true
    });

    console.log('✅ Đã kết nối database thành công!');
    console.log('🔄 Đang thêm cột TaiKhoan vào bảng KHACHHANG...\n');

    // Kiểm tra cột TaiKhoan đã tồn tại chưa
    const [check] = await connection.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME = 'TaiKhoan'
    `, [process.env.DB_NAME || 'restaurant_db']);

    if (check[0].count === 0) {
      // Thêm cột TaiKhoan
      await connection.query(`
        ALTER TABLE KHACHHANG 
        ADD COLUMN TaiKhoan VARCHAR(50) UNIQUE AFTER TenKH
      `);
      console.log('✅ Đã thêm cột TaiKhoan');

      // Tạo index cho TaiKhoan
      await connection.query(`
        CREATE INDEX idx_kh_taikhoan ON KHACHHANG(TaiKhoan)
      `);
      console.log('✅ Đã tạo index cho TaiKhoan');

      // Cập nhật dữ liệu hiện có: tạo TaiKhoan từ Email (phần trước @)
      await connection.query(`
        UPDATE KHACHHANG 
        SET TaiKhoan = SUBSTRING_INDEX(Email, '@', 1)
        WHERE TaiKhoan IS NULL OR TaiKhoan = ''
      `);
      console.log('✅ Đã cập nhật TaiKhoan cho các khách hàng hiện có');

      // Đảm bảo không có giá trị NULL
      await connection.query(`
        UPDATE KHACHHANG 
        SET TaiKhoan = CONCAT('user_', MaKH)
        WHERE TaiKhoan IS NULL OR TaiKhoan = ''
      `);
      console.log('✅ Đã tạo TaiKhoan mặc định cho các khách hàng chưa có');
    } else {
      console.log('⏭️  Cột TaiKhoan đã tồn tại, bỏ qua');
    }

    // Kiểm tra kết quả
    const [result] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'KHACHHANG'
        AND COLUMN_NAME = 'TaiKhoan'
    `, [process.env.DB_NAME || 'restaurant_db']);

    if (result.length > 0) {
      console.log('\n📊 Thông tin cột TaiKhoan:');
      console.table(result);
    }

    console.log('\n✅ Hoàn tất!');
    
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Đã đóng kết nối database');
    }
  }
};

// Chạy script
addTaiKhoanColumn();

