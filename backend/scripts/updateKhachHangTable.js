const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateKhachHangTable = async () => {
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
    console.log('🔄 Đang kiểm tra và thêm các cột mới...\n');

    // Kiểm tra và thêm các cột
    const columns = [
      {
        name: 'MatKhau',
        sql: `ALTER TABLE KHACHHANG ADD COLUMN MatKhau VARCHAR(255) NOT NULL DEFAULT "" AFTER Email`
      },
      {
        name: 'NgaySinh',
        sql: `ALTER TABLE KHACHHANG ADD COLUMN NgaySinh DATE AFTER DiaChi`
      },
      {
        name: 'GioiTinh',
        sql: `ALTER TABLE KHACHHANG ADD COLUMN GioiTinh VARCHAR(10) AFTER NgaySinh`
      },
      {
        name: 'DiemTichLuy',
        sql: `ALTER TABLE KHACHHANG ADD COLUMN DiemTichLuy INT DEFAULT 0 AFTER GioiTinh`
      },
      {
        name: 'LoaiKhach',
        sql: `ALTER TABLE KHACHHANG ADD COLUMN LoaiKhach VARCHAR(20) DEFAULT 'Thuong' AFTER DiemTichLuy`
      },
      {
        name: 'TrangThai',
        sql: `ALTER TABLE KHACHHANG ADD COLUMN TrangThai VARCHAR(20) DEFAULT 'HoatDong' AFTER LoaiKhach`
      }
    ];

    for (const col of columns) {
      try {
        // Kiểm tra cột đã tồn tại chưa
        const [check] = await connection.query(`
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'KHACHHANG' 
          AND COLUMN_NAME = ?
        `, [process.env.DB_NAME || 'restaurant_db', col.name]);

        if (check[0].count === 0) {
          await connection.query(col.sql);
          console.log(`✅ Đã thêm cột: ${col.name}`);
        } else {
          console.log(`⏭️  Cột ${col.name} đã tồn tại, bỏ qua`);
        }
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⏭️  Cột ${col.name} đã tồn tại, bỏ qua`);
        } else {
          console.error(`❌ Lỗi khi thêm cột ${col.name}:`, err.message);
        }
      }
    }

    // Cập nhật Email thành UNIQUE và NOT NULL
    try {
      await connection.query(`
        ALTER TABLE KHACHHANG 
        MODIFY COLUMN Email VARCHAR(100) NOT NULL
      `);
      console.log('✅ Đã cập nhật cột Email thành NOT NULL');
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') {
        console.log('⏭️  Email đã được cấu hình, bỏ qua');
      }
    }

    // Thêm unique constraint cho Email nếu chưa có
    try {
      await connection.query(`
        ALTER TABLE KHACHHANG 
        ADD CONSTRAINT uk_email UNIQUE (Email)
      `);
      console.log('✅ Đã thêm unique constraint cho Email');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_ENTRY') {
        console.log('⏭️  Unique constraint cho Email đã tồn tại, bỏ qua');
      } else {
        console.error('❌ Lỗi khi thêm unique constraint:', err.message);
      }
    }

    // Tạo index
    try {
      await connection.query(`
        CREATE INDEX IF NOT EXISTS idx_kh_email ON KHACHHANG(Email)
      `);
      console.log('✅ Đã tạo index cho Email');
    } catch (err) {
      console.log('⏭️  Index cho Email đã tồn tại, bỏ qua');
    }

    try {
      await connection.query(`
        CREATE INDEX IF NOT EXISTS idx_kh_sdt ON KHACHHANG(SoDienThoai)
      `);
      console.log('✅ Đã tạo index cho SoDienThoai');
    } catch (err) {
      console.log('⏭️  Index cho SoDienThoai đã tồn tại, bỏ qua');
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
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'restaurant_db']);

    console.log('\n📊 Cấu trúc bảng KHACHHANG sau khi cập nhật:');
    console.table(result);

    console.log('\n✅ Hoàn tất cập nhật bảng KHACHHANG!');
    
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
updateKhachHangTable();

