const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const DB_NAME = process.env.DB_NAME || 'restaurant_db';

async function initDatabase() {
  let connection;
  
  try {
    // Kết nối MySQL (chưa chọn database)
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Đã kết nối MySQL server');

    // Tạo database nếu chưa có
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Đã tạo/kiểm tra database: ${DB_NAME}`);

    // Chọn database
    await connection.query(`USE ${DB_NAME}`);

    // Tạo bảng NHANVIEN
    await connection.query(`
      CREATE TABLE IF NOT EXISTS NHANVIEN (
        MaNV VARCHAR(50) PRIMARY KEY,
        TenNV VARCHAR(100) NOT NULL,
        ChucVu VARCHAR(50) NOT NULL,
        TaiKhoan VARCHAR(50) UNIQUE NOT NULL,
        MatKhau VARCHAR(100) NOT NULL,
        TrangThai VARCHAR(50) DEFAULT 'DangLam',
        HinhAnh VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tạo bảng KHACHHANG (Tài khoản khách hàng)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS KHACHHANG (
        MaKH VARCHAR(50) PRIMARY KEY,
        TenKH VARCHAR(100) NOT NULL,
        Email VARCHAR(100) UNIQUE NOT NULL,
        MatKhau VARCHAR(255) NOT NULL,
        SoDienThoai VARCHAR(20),
        DiaChi TEXT,
        NgaySinh DATE,
        GioiTinh VARCHAR(10),
        DiemTichLuy INT DEFAULT 0,
        LoaiKhach VARCHAR(20) DEFAULT 'Thuong',
        NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
        TrangThai VARCHAR(20) DEFAULT 'HoatDong'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Tạo index cho Email và SoDienThoai
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_kh_email ON KHACHHANG(Email)
    `);
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_kh_sdt ON KHACHHANG(SoDienThoai)
    `);

    // Tạo bảng BAN
    await connection.query(`
      CREATE TABLE IF NOT EXISTS BAN (
        MaBan VARCHAR(50) PRIMARY KEY,
        TenBan VARCHAR(100) NOT NULL,
        SoGhe INT DEFAULT 4,
        TrangThai VARCHAR(50) DEFAULT 'Trong',
        ViTri VARCHAR(100)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tạo bảng MONAN
    await connection.query(`
      CREATE TABLE IF NOT EXISTS MONAN (
        MaMon VARCHAR(50) PRIMARY KEY,
        TenMon VARCHAR(100) NOT NULL,
        DonGia DECIMAL(10,2) NOT NULL,
        LoaiMon VARCHAR(50) NOT NULL,
        MoTa TEXT,
        TrangThaiMon VARCHAR(50) DEFAULT 'DangBan',
        HinhAnh VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tạo bảng ORDER
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`ORDER\` (
        MaOrder VARCHAR(50) PRIMARY KEY,
        MaBan VARCHAR(50) NOT NULL,
        MaNV VARCHAR(50) NOT NULL,
        MaKH VARCHAR(50),
        ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
        TrangThai VARCHAR(50) DEFAULT 'DangXuLy',
        GhiChu TEXT,
        FOREIGN KEY (MaBan) REFERENCES BAN(MaBan) ON DELETE CASCADE,
        FOREIGN KEY (MaNV) REFERENCES NHANVIEN(MaNV) ON DELETE CASCADE,
        FOREIGN KEY (MaKH) REFERENCES KHACHHANG(MaKH) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tạo bảng CHITIETORDER
    await connection.query(`
      CREATE TABLE IF NOT EXISTS CHITIETORDER (
        MaCT VARCHAR(100) PRIMARY KEY,
        MaOrder VARCHAR(50) NOT NULL,
        MaMon VARCHAR(50) NOT NULL,
        SoLuong INT NOT NULL,
        DonGia DECIMAL(10,2) NOT NULL,
        TrangThai VARCHAR(50) DEFAULT 'ChoCheBien',
        FOREIGN KEY (MaOrder) REFERENCES \`ORDER\`(MaOrder) ON DELETE CASCADE,
        FOREIGN KEY (MaMon) REFERENCES MONAN(MaMon) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tạo bảng HOADON
    await connection.query(`
      CREATE TABLE IF NOT EXISTS HOADON (
        MaHD VARCHAR(50) PRIMARY KEY,
        MaOrder VARCHAR(50) NOT NULL,
        MaNV VARCHAR(50) NOT NULL,
        TongTien DECIMAL(10,2) NOT NULL,
        GiamGia DECIMAL(10,2) DEFAULT 0,
        ThanhTien DECIMAL(10,2) NOT NULL,
        NgayThanhToan DATETIME DEFAULT CURRENT_TIMESTAMP,
        HinhThucTT VARCHAR(50) DEFAULT 'TienMat',
        FOREIGN KEY (MaOrder) REFERENCES \`ORDER\`(MaOrder) ON DELETE CASCADE,
        FOREIGN KEY (MaNV) REFERENCES NHANVIEN(MaNV) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Đã tạo tất cả các bảng');

    // Xóa dữ liệu cũ nếu có (để test)
    await connection.query('DELETE FROM CHITIETORDER');
    await connection.query('DELETE FROM HOADON');
    await connection.query('DELETE FROM `ORDER`');
    await connection.query('DELETE FROM MONAN');
    await connection.query('DELETE FROM BAN');
    await connection.query('DELETE FROM KHACHHANG');
    await connection.query('DELETE FROM NHANVIEN');

    // Chèn dữ liệu mẫu
    // Nhân viên
    const nhanVien = [
      ['NV001', 'Nguyễn Minh Khang', 'QuanLy', 'admin', 'admin123', 'DangLam', 'https://i.pravatar.cc/150?img=12'],
      ['NV002', 'Trần Hoài Nam', 'PhucVu', 'phucvu1', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=1'],
      ['NV003', 'Lê Ngọc Anh', 'Bep', 'bep1', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=5'],
      ['NV004', 'Phạm Thu Hà', 'ThuNgan', 'thungan1', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=9'],
      ['NV005', 'Đỗ Anh Tuấn', 'PhucVu', 'phucvu2', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=13'],
      ['NV006', 'Vũ Quỳnh Như', 'PhucVu', 'phucvu3', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=10'],
      ['NV007', 'Huỳnh Gia Bảo', 'Bep', 'bep2', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=15'],
      ['NV008', 'Bùi Khánh Linh', 'ThuNgan', 'thungan2', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=20'],
      ['NV009', 'Phan Tuấn Kiệt', 'PhucVu', 'phucvu4', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=16'],
      ['NV010', 'Mai Thảo Vy', 'Bep', 'bep3', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=11'],
      ['NV011', 'Võ Đức Thịnh', 'PhucVu', 'phucvu5', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=14'],
      ['NV012', 'Hồ Việt Hưng', 'Bep', 'viethung', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=HoVietHung&backgroundColor=FFA07A'],
      ['NV013', 'Nguyễn Ngọc Trâm', 'PhucVu', 'ngoctram', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenNgocTram&backgroundColor=DDA0DD'],
      ['NV014', 'Trịnh Hữu Phát', 'QuanLy', 'huuphat', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TrinhHuuPhat&backgroundColor=87CEEB'],
      ['NV015', 'Đặng Thanh Hương', 'ThuNgan', 'thanhhuong', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DangThanhHuong&backgroundColor=FFB6C1'],
      // Thêm các tài khoản bổ sung
      ['NV016', 'Nguyễn Minh Khang', 'QuanLy', 'minhkhang', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhKhang&backgroundColor=0D8ABC'],
      ['NV017', 'Trần Hoài Nam', 'PhucVu', 'hoainam', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TranHoaiNam&backgroundColor=FF6B6B'],
      ['NV018', 'Lê Ngọc Anh', 'PhucVu', 'ngocanh', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LeNgocAnh&backgroundColor=4ECDC4'],
      ['NV019', 'Phạm Thu Hà', 'ThuNgan', 'thuha', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThuHa&backgroundColor=95E1D3'],
      ['NV020', 'Đỗ Anh Tuấn', 'Bep', 'anhtuan', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=DoAnhTuan&backgroundColor=F38181'],
      ['NV021', 'Vũ Quỳnh Như', 'PhucVu', 'quynhnhu', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=VuQuynhNhu&backgroundColor=AA96DA'],
      ['NV022', 'Huỳnh Gia Bảo', 'Bep', 'giabao', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuynhGiaBao&backgroundColor=FCBAD3'],
      ['NV023', 'Bùi Khánh Linh', 'PhucVu', 'khanhlinh', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuiKhanhLinh&backgroundColor=FFFFD2'],
      ['NV024', 'Phan Tuấn Kiệt', 'Bep', 'tuankiet', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhanTuanKiet&backgroundColor=A8D8EA'],
      ['NV025', 'Mai Thảo Vy', 'ThuNgan', 'thaovy', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaiThaoVy&backgroundColor=FFCCCC'],
      ['NV026', 'Võ Đức Thịnh', 'PhucVu', 'ducthinh', '123456', 'DangLam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoDucThinh&backgroundColor=C3E991'],
      ['NV012', 'Hồ Việt Hưng', 'Bep', 'bep4', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=17'],
      ['NV013', 'Nguyễn Ngọc Trâm', 'ThuNgan', 'thungan3', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=21'],
      ['NV014', 'Trịnh Hữu Phát', 'PhucVu', 'phucvu6', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=18'],
      ['NV015', 'Đặng Thanh Hương', 'Bep', 'bep5', '123456', 'DangLam', 'https://i.pravatar.cc/150?img=19'],
    ];

    await connection.query(
      'INSERT INTO NHANVIEN (MaNV, TenNV, ChucVu, TaiKhoan, MatKhau, TrangThai, HinhAnh) VALUES ?',
      [nhanVien]
    );

    // Khách hàng
    const khachHang = [
      ['KH001', 'Nguyễn Minh Khang', '0901234567', 'nguyenminhkhang@email.com', '123 Đường ABC, Quận 1, TP.HCM'],
      ['KH002', 'Trần Hoài Nam', '0907654321', 'tranhoainam@email.com', '456 Đường XYZ, Quận 2, TP.HCM'],
      ['KH003', 'Lê Ngọc Anh', '0912345678', 'lengocanh@email.com', '789 Đường DEF, Quận 3, TP.HCM'],
      ['KH004', 'Phạm Thu Hà', '0923456789', 'phamthuha@email.com', '321 Đường GHI, Quận 4, TP.HCM'],
      ['KH005', 'Đỗ Anh Tuấn', '0934567890', 'doanhtuan@email.com', '654 Đường JKL, Quận 5, TP.HCM'],
      ['KH006', 'Vũ Quỳnh Như', '0945678901', 'vuquynhnhu@email.com', '987 Đường MNO, Quận 6, TP.HCM'],
      ['KH007', 'Huỳnh Gia Bảo', '0956789012', 'huynhgiabao@email.com', '147 Đường PQR, Quận 7, TP.HCM'],
      ['KH008', 'Bùi Khánh Linh', '0967890123', 'buikhanhlinh@email.com', '258 Đường STU, Quận 8, TP.HCM'],
      ['KH009', 'Phan Tuấn Kiệt', '0978901234', 'phantuankiet@email.com', '369 Đường VWX, Quận 9, TP.HCM'],
      ['KH010', 'Mai Thảo Vy', '0989012345', 'maithaovy@email.com', '741 Đường YZ, Quận 10, TP.HCM'],
    ];

    await connection.query(
      'INSERT INTO KHACHHANG (MaKH, TenKH, SoDienThoai, Email, DiaChi) VALUES ?',
      [khachHang]
    );

    // Bàn
    const ban = [];
    for (let i = 1; i <= 20; i++) {
      const maBan = `B${i.toString().padStart(3, '0')}`;
      const tenBan = `Bàn ${i}`;
      const soGhe = i <= 10 ? 4 : i <= 15 ? 6 : 8;
      const trangThai = i <= 5 ? 'DangPhucVu' : 'Trong';
      ban.push([maBan, tenBan, soGhe, trangThai, `Khu vực ${Math.ceil(i / 5)}`]);
    }

    await connection.query(
      'INSERT INTO BAN (MaBan, TenBan, SoGhe, TrangThai, ViTri) VALUES ?',
      [ban]
    );

    // Món ăn
    const monAn = [
      // Món chính
      ['M001', 'Phở Bò', 85000, 'MonChinh', 'Phở bò truyền thống', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/pho-2441151_1280.jpg'],
      ['M002', 'Bún Bò Huế', 90000, 'MonChinh', 'Bún bò Huế đặc biệt', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/bun-bo-hue-2441155_1280.jpg'],
      ['M003', 'Cơm Gà', 75000, 'MonChinh', 'Cơm gà nướng', 'DangBan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'],
      ['M004', 'Bánh Mì Thịt Nướng', 45000, 'MonChinh', 'Bánh mì thịt nướng đặc biệt', 'DangBan', 'https://cdn.pixabay.com/photo/2016/03/05/19/02/baguette-1238615_1280.jpg'],
      ['M005', 'Bún Chả', 80000, 'MonChinh', 'Bún chả Hà Nội', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/bun-cha-2441152_1280.jpg'],
      ['M006', 'Cơm Tấm Sườn', 70000, 'MonChinh', 'Cơm tấm sườn nướng', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/com-tam-2441154_1280.jpg'],
      ['M007', 'Bánh Xèo', 65000, 'MonChinh', 'Bánh xèo miền Nam', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/banh-xeo-2441153_1280.jpg'],
      ['M008', 'Gỏi Cuốn', 55000, 'MonChinh', 'Gỏi cuốn tôm thịt', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/spring-rolls-2441150_1280.jpg'],
      
      // Món phụ
      ['M009', 'Nem Nướng', 60000, 'MonPhu', 'Nem nướng Nha Trang', 'DangBan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'],
      ['M010', 'Chả Giò', 50000, 'MonPhu', 'Chả giò truyền thống', 'DangBan', 'https://cdn.pixabay.com/photo/2017/06/27/08/59/spring-rolls-2441150_1280.jpg'],
      ['M011', 'Gỏi Đu Đủ', 45000, 'MonPhu', 'Gỏi đu đủ tôm khô', 'DangBan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'],
      ['M012', 'Bánh Tráng Nướng', 40000, 'MonPhu', 'Bánh tráng nướng Đà Lạt', 'DangBan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'],
      
      // Đồ uống
      ['M013', 'Nước Ngọt', 20000, 'DoUong', 'Coca, Pepsi, 7Up', 'DangBan', ''],
      ['M014', 'Nước Cam Ép', 35000, 'DoUong', 'Nước cam ép tươi', 'DangBan', 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2022/2/19/cach-lam-nuoc-cam-ep-ngon-va-thom-ket-hop-voi-le-va-gung-5-1645248090817401855254.jpg'],
      ['M015', 'Cà Phê Đen', 25000, 'DoUong', 'Cà phê đen đá', 'DangBan', 'https://vanmart.vn/thumbs/600x600x1/upload/product/cafe-den-da-8801.png'],
      ['M016', 'Cà Phê Sữa', 30000, 'DoUong', 'Cà phê sữa đá', 'DangBan', 'https://cubes-asia.com/storage/blogs/2024-12/5-cach-pha-ca-phe-sua-tuoi-khong-duong-co.jpeg'],
      ['M017', 'Trà Đá', 10000, 'DoUong', 'Trà đá miễn phí', 'DangBan', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800'],
      ['M018', 'Sinh Tố Dưa Hấu', 40000, 'DoUong', 'Sinh tố dưa hấu tươi', 'DangBan', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800'],
      ['M019', 'Bia Tiger', 45000, 'DoUong', 'Bia Tiger lạnh', 'DangBan', 'https://img.lazcdn.com/live/vn/p/3e8864aa02be95050bb9bd52dc79baef.jpg_720x720q80.jpg'],
      ['M020', 'Nước Dừa', 30000, 'DoUong', 'Nước dừa tươi', 'DangBan', 'https://www.vinmec.com/static/uploads/20220116_030218_046684_uong_nuoc_dua_co_ta_max_1800x1800_jpg_0e807384c8.jpg'],
    ];

    await connection.query(
      'INSERT INTO MONAN (MaMon, TenMon, DonGia, LoaiMon, MoTa, TrangThaiMon, HinhAnh) VALUES ?',
      [monAn]
    );

    console.log('✅ Đã chèn dữ liệu mẫu thành công');
    console.log(`📊 Database: ${DB_NAME}`);
    console.log('✅ Đã khởi tạo database và dữ liệu mẫu thành công!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Lỗi xác thực. Hãy kiểm tra DB_USER và DB_PASSWORD trong file .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Không thể kết nối MySQL server. Hãy đảm bảo MySQL đang chạy.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

initDatabase();
