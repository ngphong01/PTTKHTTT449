-- ============================================
-- HỆ THỐNG QUẢN LÝ NHÀ HÀNG - DATABASE SQL
-- File SQL hoàn chỉnh để import vào MySQL
-- ============================================
-- Tạo database
CREATE DATABASE IF NOT EXISTS restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE restaurant_db;

-- Tắt Safe Update Mode tạm thời
SET
    SQL_SAFE_UPDATES = 0;

-- Tắt kiểm tra khóa ngoại tạm thời
SET
    FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TẠO CÁC BẢNG
-- ============================================
-- Bảng NHANVIEN
CREATE TABLE IF NOT EXISTS
    NHANVIEN (
        MaNV VARCHAR(50) PRIMARY KEY,
        TenNV VARCHAR(100) NOT NULL,
        ChucVu VARCHAR(50) NOT NULL,
        TaiKhoan VARCHAR(50) UNIQUE NOT NULL,
        MatKhau VARCHAR(100) NOT NULL,
        TrangThai VARCHAR(50) DEFAULT 'DangLam',
        HinhAnh TEXT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Thêm cột HinhAnh nếu chưa tồn tại
SET
    @col_exists = (
        SELECT
            COUNT(*)
        FROM
            INFORMATION_SCHEMA.COLUMNS
        WHERE
            TABLE_SCHEMA = 'restaurant_db'
            AND TABLE_NAME = 'NHANVIEN'
            AND COLUMN_NAME = 'HinhAnh'
    );

SET
    @alter_query = IF(
        @col_exists = 0,
        'ALTER TABLE NHANVIEN ADD COLUMN HinhAnh TEXT AFTER TrangThai',
        'SELECT "Column HinhAnh already exists" AS Info'
    );

PREPARE stmt
FROM
    @alter_query;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- Bảng KHACHHANG
CREATE TABLE IF NOT EXISTS
    KHACHHANG (
        MaKH VARCHAR(50) PRIMARY KEY,
        TenKH VARCHAR(100) NOT NULL,
        TaiKhoan VARCHAR(50) UNIQUE,
        Email VARCHAR(100) UNIQUE NOT NULL,
        MatKhau VARCHAR(255) NOT NULL,
        SoDienThoai VARCHAR(20),
        DiaChi TEXT,
        NgaySinh DATE,
        GioiTinh VARCHAR(10),
        DiemTichLuy INT DEFAULT 0,
        LoaiKhach VARCHAR(20) DEFAULT 'Thuong',
        NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
        TrangThai VARCHAR(20) DEFAULT 'HoatDong',
        INDEX idx_kh_taikhoan (TaiKhoan),
        INDEX idx_kh_email (Email),
        INDEX idx_kh_sdt (SoDienThoai)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng BAN
CREATE TABLE IF NOT EXISTS
    BAN (
        MaBan VARCHAR(50) PRIMARY KEY,
        TenBan VARCHAR(100) NOT NULL,
        SoGhe INT DEFAULT 4,
        TrangThai VARCHAR(50) DEFAULT 'Trong',
        ViTri VARCHAR(100)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng MONAN
CREATE TABLE IF NOT EXISTS
    MONAN (
        MaMon VARCHAR(50) PRIMARY KEY,
        TenMon VARCHAR(100) NOT NULL,
        DonGia DECIMAL(10, 2) NOT NULL,
        LoaiMon VARCHAR(50) NOT NULL,
        MoTa TEXT,
        TrangThaiMon VARCHAR(50) DEFAULT 'DangBan',
        HinhAnh TEXT,
        Tag VARCHAR(50) DEFAULT NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng ORDER
CREATE TABLE IF NOT EXISTS
    `ORDER` (
        MaOrder VARCHAR(50) PRIMARY KEY,
        MaBan VARCHAR(50) NOT NULL,
        MaNV VARCHAR(50) NOT NULL,
        MaKH VARCHAR(50),
        ThoiGian DATETIME DEFAULT CURRENT_TIMESTAMP,
        TrangThai VARCHAR(50) DEFAULT 'DangXuLy',
        GhiChu TEXT,
        FOREIGN KEY (MaBan) REFERENCES BAN (MaBan) ON DELETE CASCADE,
        FOREIGN KEY (MaNV) REFERENCES NHANVIEN (MaNV) ON DELETE CASCADE,
        FOREIGN KEY (MaKH) REFERENCES KHACHHANG (MaKH) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng CHITIETORDER
CREATE TABLE IF NOT EXISTS
    CHITIETORDER (
        MaCT VARCHAR(100) PRIMARY KEY,
        MaOrder VARCHAR(50) NOT NULL,
        MaMon VARCHAR(50) NOT NULL,
        SoLuong INT NOT NULL,
        DonGia DECIMAL(10, 2) NOT NULL,
        TrangThai VARCHAR(50) DEFAULT 'ChoCheBien',
        FOREIGN KEY (MaOrder) REFERENCES `ORDER` (MaOrder) ON DELETE CASCADE,
        FOREIGN KEY (MaMon) REFERENCES MONAN (MaMon) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng HOADON
CREATE TABLE IF NOT EXISTS
    HOADON (
        MaHD VARCHAR(50) PRIMARY KEY,
        MaOrder VARCHAR(50) NOT NULL,
        MaNV VARCHAR(50) NOT NULL,
        TongTien DECIMAL(10, 2) NOT NULL,
        GiamGia DECIMAL(10, 2) DEFAULT 0,
        ThanhTien DECIMAL(10, 2) NOT NULL,
        NgayThanhToan DATETIME DEFAULT CURRENT_TIMESTAMP,
        HinhThucTT VARCHAR(50) DEFAULT 'TienMat',
        FOREIGN KEY (MaOrder) REFERENCES `ORDER` (MaOrder) ON DELETE CASCADE,
        FOREIGN KEY (MaNV) REFERENCES NHANVIEN (MaNV) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng DATBAN (Đặt bàn)
CREATE TABLE IF NOT EXISTS
    DATBAN (
        MaDatBan VARCHAR(50) PRIMARY KEY,
        MaKH VARCHAR(50),
        MaBan VARCHAR(50),
        HoTen VARCHAR(100) NOT NULL,
        SoDienThoai VARCHAR(20) NOT NULL,
        Email VARCHAR(100),
        NgayDat DATE NOT NULL,
        GioDat TIME NOT NULL,
        SoNguoi INT NOT NULL,
        KhuVuc VARCHAR(100),
        GhiChu TEXT,
        TrangThai VARCHAR(50) DEFAULT 'ChoXacNhan',
        ThoiGianTao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (MaKH) REFERENCES KHACHHANG (MaKH) ON DELETE SET NULL,
        FOREIGN KEY (MaBan) REFERENCES BAN (MaBan) ON DELETE SET NULL,
        INDEX idx_datban_ngay (NgayDat),
        INDEX idx_datban_trangthai (TrangThai)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng HANGDOI (Hàng đợi)
CREATE TABLE IF NOT EXISTS
    HANGDOI (
        MaHangDoi VARCHAR(50) PRIMARY KEY,
        MaKH VARCHAR(50),
        HoTen VARCHAR(100) NOT NULL,
        SoDienThoai VARCHAR(20) NOT NULL,
        Email VARCHAR(100),
        SoNguoi INT NOT NULL,
        KhuVuc VARCHAR(100),
        GhiChu TEXT,
        ThoiGianDat DATETIME NOT NULL,
        ThoiGianTao DATETIME DEFAULT CURRENT_TIMESTAMP,
        TrangThai VARCHAR(50) DEFAULT 'Cho',
        MaBan VARCHAR(50),
        FOREIGN KEY (MaKH) REFERENCES KHACHHANG (MaKH) ON DELETE SET NULL,
        FOREIGN KEY (MaBan) REFERENCES BAN (MaBan) ON DELETE SET NULL,
        INDEX idx_hangdoi_trangthai (TrangThai),
        INDEX idx_hangdoi_thoigian (ThoiGianTao)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- XÓA DỮ LIỆU CŨ (NẾU CÓ)
-- ============================================
TRUNCATE TABLE CHITIETORDER;

TRUNCATE TABLE HOADON;

TRUNCATE TABLE `ORDER`;

TRUNCATE TABLE MONAN;

-- Thêm cột Tag vào bảng MONAN nếu chưa tồn tại (an toàn, không báo lỗi nếu đã có)
SET
    @dbname = DATABASE();

SET
    @tablename = 'MONAN';

SET
    @columnname = 'Tag';

SET
    @preparedStatement = (
        SELECT
            IF(
                (
                    SELECT
                        COUNT(*)
                    FROM
                        INFORMATION_SCHEMA.COLUMNS
                    WHERE
                        (TABLE_SCHEMA = @dbname)
                        AND (TABLE_NAME = @tablename)
                        AND (COLUMN_NAME = @columnname)
                ) > 0,
                'SELECT "Column Tag already exists" AS Status',
                CONCAT(
                    'ALTER TABLE ',
                    @tablename,
                    ' ADD COLUMN ',
                    @columnname,
                    ' VARCHAR(50) DEFAULT NULL'
                )
            )
    );

PREPARE alterIfNotExists
FROM
    @preparedStatement;

EXECUTE alterIfNotExists;

DEALLOCATE PREPARE alterIfNotExists;

TRUNCATE TABLE HANGDOI;

TRUNCATE TABLE DATBAN;

TRUNCATE TABLE BAN;

TRUNCATE TABLE KHACHHANG;

TRUNCATE TABLE NHANVIEN;

-- ============================================
-- CHÈN DỮ LIỆU MẪU
-- ============================================
-- Chèn dữ liệu NHANVIEN
INSERT INTO
    NHANVIEN (
        MaNV,
        TenNV,
        ChucVu,
        TaiKhoan,
        MatKhau,
        TrangThai,
        HinhAnh
    )
VALUES
    (
        'NV001',
        'Nguyễn Văn An',
        'QuanLy',
        'admin',
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        'DangLam',
        'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=0D8ABC&color=fff&size=150'
    ),
    (
        'NV002',
        'Trần Thị Bình',
        'PhucVu',
        'phucvu1',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=FF6B6B&color=fff&size=150'
    ),
    (
        'NV003',
        'Lê Minh Châu',
        'Bep',
        'bep1',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Le+Minh+Chau&background=4ECDC4&color=fff&size=150'
    ),
    (
        'NV004',
        'Phạm Ngọc Dung',
        'ThuNgan',
        'thungan1',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Pham+Ngoc+Dung&background=95E1D3&color=fff&size=150'
    ),
    (
        'NV005',
        'Đỗ Quang Huy',
        'PhucVu',
        'phucvu2',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Do+Quang+Huy&background=F38181&color=fff&size=150'
    ),
    (
        'NV006',
        'Vũ Thu Hà',
        'PhucVu',
        'phucvu3',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Vu+Thu+Ha&background=AA96DA&color=fff&size=150'
    ),
    (
        'NV007',
        'Huỳnh Đức Khang',
        'Bep',
        'bep2',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Huynh+Duc+Khang&background=FCBAD3&color=fff&size=150'
    ),
    (
        'NV008',
        'Bùi Thanh Lan',
        'ThuNgan',
        'thungan2',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Bui+Thanh+Lan&background=FFFFD2&color=333&size=150'
    ),
    (
        'NV009',
        'Phan Tuấn Minh',
        'PhucVu',
        'phucvu4',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Phan+Tuan+Minh&background=A8D8EA&color=fff&size=150'
    ),
    (
        'NV010',
        'Mai Hoàng Nam',
        'Bep',
        'bep3',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Mai+Hoang+Nam&background=FFCCCC&color=fff&size=150'
    ),
    (
        'NV011',
        'Võ Thị Oanh',
        'PhucVu',
        'phucvu5',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Vo+Thi+Oanh&background=C3E991&color=fff&size=150'
    ),
    (
        'NV012',
        'Hồ Anh Phong',
        'Bep',
        'bep4',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Ho+Anh+Phong&background=FFA07A&color=fff&size=150'
    ),
    (
        'NV013',
        'Nguyễn Kim Quỳnh',
        'ThuNgan',
        'thungan3',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Nguyen+Kim+Quynh&background=DDA0DD&color=fff&size=150'
    ),
    (
        'NV014',
        'Trịnh Văn Sang',
        'PhucVu',
        'phucvu6',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Trinh+Van+Sang&background=87CEEB&color=fff&size=150'
    ),
    (
        'NV015',
        'Đặng Thị Tâm',
        'Bep',
        'bep5',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://ui-avatars.com/api/?name=Dang+Thi+Tam&background=FFB6C1&color=fff&size=150'
    ),
    (
        'NV016',
        'Nguyễn Minh Khang',
        'QuanLy',
        'minhkhang',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenMinhKhang&backgroundColor=0D8ABC'
    ),
    (
        'NV017',
        'Trần Hoài Nam',
        'PhucVu',
        'hoainam',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=TranHoaiNam&backgroundColor=FF6B6B'
    ),
    (
        'NV018',
        'Lê Ngọc Anh',
        'PhucVu',
        'ngocanh',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=LeNgocAnh&backgroundColor=4ECDC4'
    ),
    (
        'NV019',
        'Phạm Thu Hà',
        'ThuNgan',
        'thuha',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThuHa&backgroundColor=95E1D3'
    ),
    (
        'NV020',
        'Đỗ Anh Tuấn',
        'Bep',
        'anhtuan',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=DoAnhTuan&backgroundColor=F38181'
    ),
    (
        'NV021',
        'Vũ Quỳnh Như',
        'PhucVu',
        'quynhnhu',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=VuQuynhNhu&backgroundColor=AA96DA'
    ),
    (
        'NV022',
        'Huỳnh Gia Bảo',
        'Bep',
        'giabao',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=HuynhGiaBao&backgroundColor=FCBAD3'
    ),
    (
        'NV023',
        'Bùi Khánh Linh',
        'PhucVu',
        'khanhlinh',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=BuiKhanhLinh&backgroundColor=FFFFD2'
    ),
    (
        'NV024',
        'Phan Tuấn Kiệt',
        'Bep',
        'tuankiet',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=PhanTuanKiet&backgroundColor=A8D8EA'
    ),
    (
        'NV025',
        'Mai Thảo Vy',
        'ThuNgan',
        'thaovy',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=MaiThaoVy&backgroundColor=FFCCCC'
    ),
    (
        'NV026',
        'Võ Đức Thịnh',
        'PhucVu',
        'ducthinh',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=VoDucThinh&backgroundColor=C3E991'
    ),
    (
        'NV027',
        'Hồ Việt Hưng',
        'Bep',
        'viethung',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=HoVietHung&backgroundColor=FFA07A'
    ),
    (
        'NV028',
        'Nguyễn Ngọc Trâm',
        'PhucVu',
        'ngoctram',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenNgocTram&backgroundColor=DDA0DD'
    ),
    (
        'NV029',
        'Trịnh Hữu Phát',
        'QuanLy',
        'huuphat',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=TrinhHuuPhat&backgroundColor=87CEEB'
    ),
    (
        'NV030',
        'Đặng Thanh Hương',
        'ThuNgan',
        'thanhhuong',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
        'DangLam',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=DangThanhHuong&backgroundColor=FFB6C1'
    );

-- Chèn dữ liệu KHACHHANG
INSERT INTO
    KHACHHANG (MaKH, TenKH, Email, MatKhau, SoDienThoai, DiaChi)
VALUES
    (
        'KH001',
        'Nguyễn Văn Khách',
        'khach1@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0901234567',
        '123 Đường ABC, Quận 1, TP.HCM'
    ),
    (
        'KH002',
        'Trần Thị Linh',
        'khach2@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0907654321',
        '456 Đường XYZ, Quận 2, TP.HCM'
    ),
    (
        'KH003',
        'Lê Hoàng Minh',
        'khach3@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0912345678',
        '789 Đường DEF, Quận 3, TP.HCM'
    ),
    (
        'KH004',
        'Phạm Thị Nga',
        'khach4@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0923456789',
        '321 Đường GHI, Quận 4, TP.HCM'
    ),
    (
        'KH005',
        'Đỗ Thanh Phong',
        'khach5@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0934567890',
        '654 Đường JKL, Quận 5, TP.HCM'
    ),
    (
        'KH006',
        'Vũ Anh Quân',
        'khach6@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0945678901',
        '987 Đường MNO, Quận 6, TP.HCM'
    ),
    (
        'KH007',
        'Huỳnh Thị Rô',
        'khach7@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0956789012',
        '147 Đường PQR, Quận 7, TP.HCM'
    ),
    (
        'KH008',
        'Bùi Văn Sơn',
        'khach8@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0967890123',
        '258 Đường STU, Quận 8, TP.HCM'
    ),
    (
        'KH009',
        'Phan Thị Trang',
        'khach9@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0978901234',
        '369 Đường VWX, Quận 9, TP.HCM'
    ),
    (
        'KH010',
        'Mai Văn Út',
        'khach10@email.com',
        'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        '0989012345',
        '741 Đường YZ, Quận 10, TP.HCM'
    );

-- Chèn dữ liệu BAN
INSERT INTO
    BAN (MaBan, TenBan, SoGhe, TrangThai, ViTri)
VALUES
    ('B001', 'Bàn 1', 4, 'DangPhucVu', 'Khu vực 1'),
    ('B002', 'Bàn 2', 4, 'DangPhucVu', 'Khu vực 1'),
    ('B003', 'Bàn 3', 4, 'DangPhucVu', 'Khu vực 1'),
    ('B004', 'Bàn 4', 4, 'DangPhucVu', 'Khu vực 1'),
    ('B005', 'Bàn 5', 4, 'DangPhucVu', 'Khu vực 1'),
    ('B006', 'Bàn 6', 4, 'Trong', 'Khu vực 2'),
    ('B007', 'Bàn 7', 4, 'Trong', 'Khu vực 2'),
    ('B008', 'Bàn 8', 4, 'Trong', 'Khu vực 2'),
    ('B009', 'Bàn 9', 4, 'Trong', 'Khu vực 2'),
    ('B010', 'Bàn 10', 4, 'Trong', 'Khu vực 2'),
    ('B011', 'Bàn 11', 6, 'Trong', 'Khu vực 3'),
    ('B012', 'Bàn 12', 6, 'Trong', 'Khu vực 3'),
    ('B013', 'Bàn 13', 6, 'Trong', 'Khu vực 3'),
    ('B014', 'Bàn 14', 6, 'Trong', 'Khu vực 3'),
    ('B015', 'Bàn 15', 6, 'Trong', 'Khu vực 3'),
    ('B016', 'Bàn 16', 8, 'Trong', 'Khu vực 4'),
    ('B017', 'Bàn 17', 8, 'Trong', 'Khu vực 4'),
    ('B018', 'Bàn 18', 8, 'Trong', 'Khu vực 4'),
    ('B019', 'Bàn 19', 8, 'Trong', 'Khu vực 4'),
    ('B020', 'Bàn 20', 8, 'Trong', 'Khu vực 4');

-- Chèn dữ liệu MONAN - Menu Lumière
INSERT INTO
    MONAN (
        MaMon,
        TenMon,
        DonGia,
        LoaiMon,
        MoTa,
        TrangThaiMon,
        HinhAnh,
        Tag
    )
VALUES
    -- 1. KHAI VỊ (Appetizer)
    (
        'MON001',
        'Bánh mì bơ tỏi Lumière',
        69000,
        'KhaiVi',
        'Bánh mì nướng giòn, phết bơ tỏi thơm',
        'DangBan',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON002',
        'Salad cá hồi sốt cam',
        119000,
        'KhaiVi',
        'Cá hồi tươi, xà lách baby, sốt cam ngọt dịu',
        'DangBan',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
        'BestSeller'
    ),
    (
        'MON003',
        'Soup nấm truffle',
        99000,
        'KhaiVi',
        'Kem nấm, nấm truffle, mùi vị béo nhẹ và thơm',
        'DangBan',
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON004',
        'Salad hoa quả nhiệt đới',
        89000,
        'KhaiVi',
        'Trái cây tươi theo mùa, sốt chanh dây',
        'DangBan',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON005',
        'Tôm chiên tempura',
        129000,
        'KhaiVi',
        'Tôm tươi chiên giòn kiểu Nhật',
        'DangBan',
        'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=400&fit=crop',
        NULL
    ),
    -- 2. MÓN CHÍNH (Main Course)
    (
        'MON006',
        'Beef Steak Lumière',
        349000,
        'MonChinh',
        'Thịt bò Mỹ nướng medium rare, sốt tiêu đen',
        'DangBan',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop',
        'SignatureDish'
    ),
    (
        'MON007',
        'Cá hồi áp chảo sốt bơ chanh',
        299000,
        'MonChinh',
        'Cá hồi Na Uy áp chảo giòn da, sốt chanh bơ',
        'DangBan',
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=400&fit=crop',
        'BestSeller'
    ),
    (
        'MON008',
        'Mì Ý sốt kem nấm truffle',
        249000,
        'MonChinh',
        'Pasta Ý sốt kem nấm, phô mai Parmesan',
        'DangBan',
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON009',
        'Cơm bò Wagyu Lumière',
        329000,
        'MonChinh',
        'Bò Wagyu Nhật, cơm dẻo, trứng lòng đào',
        'DangBan',
        'https://amp.thitbowagyu.com/uploads/files/2025/03/26/z6443352692837_63007e8168d69dacf4e58347c85110ca.jpg',
        'SignatureDish'
    ),
    (
        'MON010',
        'Sườn cừu nướng Rosemary',
        389000,
        'MonChinh',
        'Sườn cừu Úc ướp thảo mộc, nướng than hồng',
        'DangBan',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop',
        'SignatureDish'
    ),
    -- 3. COMBO / SET ĐẶC BIỆT
    (
        'MON011',
        'Set Ánh Sáng (2 người)',
        799000,
        'Combo',
        'Beef steak + salad cá hồi + rượu vang',
        'DangBan',
        'https://file.hstatic.net/200000692767/file/salad-ca-hoi__1_.jpg',
        'BestSeller'
    ),
    (
        'MON012',
        'Set Lumière Premium (4 người)',
        1299000,
        'Combo',
        'Cá hồi + bò Wagyu + soup nấm + bánh mì bơ tỏi',
        'DangBan',
        'https://viashotels.com/wp-content/uploads/2025/07/mon-bo-Wagyu-tai-Vung-Tau-1024x640.png',
        'SignatureDish'
    ),
    (
        'MON013',
        'Set Family Feast (6 người)',
        1799000,
        'Combo',
        'Lẩu bò Lumière + tôm chiên + salad hoa quả + tráng miệng',
        'DangBan',
        'https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/kien-thuc/cach-nau-lau-thai/cach-nau-lau-thai-1.jpg',
        NULL
    ),
    (
        'MON014',
        'Set Date Night (2 người)',
        999000,
        'Combo',
        'Mì Ý + steak + tiramisu + cocktail',
        'DangBan',
        'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=90/media/photos/68df9a05-2858-4a37-af16-a4f0933f75f4-retina-large-jpeg',
        NULL
    ),
    (
        'MON015',
        'Set Chef\'s Selection',
        1099000,
        'Combo',
        'Gồm 5 món do đầu bếp chọn (thay đổi theo ngày)',
        'DangBan',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=400&fit=crop',
        'NewMenu'
    ),
    -- 4. LẨU LUMIÈRE (Hot Pot)
    (
        'MON016',
        'Lẩu bò Lumière Signature',
        899000,
        'Lau',
        'Nước dùng bò hầm 8 tiếng, thịt bò Wagyu, rau hữu cơ',
        'DangBan',
        'https://digiticket.vn/blog/wp-content/uploads/2021/06/lau-bo-ba-toa-ha-noi-1-1.jpg',
        'SignatureDish'
    ),
    (
        'MON017',
        'Lẩu hải sản tổng hợp',
        849000,
        'Lau',
        'Tôm, mực, nghêu, cá, rau tươi, mì Udon',
        'DangBan',
        'https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/173129/Originals/cach%20nau%20lau%20hai%20san%204.jpg',
        'BestSeller'
    ),
    (
        'MON018',
        'Lẩu kim chi Hàn Quốc',
        759000,
        'Lau',
        'Thịt heo, đậu hũ, kim chi cay nhẹ',
        'DangBan',
        'https://cdn.hstatic.net/files/200000700229/article/lau-kim-chi-chay-1_be402c0746ae4c77afd182529f170255.jpg',
        NULL
    ),
    (
        'MON019',
        'Lẩu Thái chua cay',
        789000,
        'Lau',
        'Hải sản + nước dùng Tomyum đặc trưng',
        'DangBan',
        'https://sgtt.thesaigontimes.vn/wp-content/uploads/2025/01/2024_1_23_638416491645237808_mach-ban-cach-nau-lau-thai-bang-goi-gia-vi_960.jpg',
        NULL
    ),
    (
        'MON020',
        'Lẩu nấm thanh đạm (chay)',
        699000,
        'Lau',
        'Nước dùng rau củ, nấm hương, đậu phụ',
        'DangBan',
        'https://bizweb.dktcdn.net/thumb/grande/100/489/006/articles/cach-nau-lau-nam-chay-anh-bia.jpg?v=1701928071167',
        NULL
    ),
    -- 5. TRÁNG MIỆNG (Dessert)
    (
        'MON021',
        'Bánh tiramisu',
        99000,
        'TrangMieng',
        'Bánh lạnh Ý, vị cà phê và cacao',
        'DangBan',
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=400&fit=crop',
        'BestSeller'
    ),
    (
        'MON022',
        'Kem dừa nướng',
        79000,
        'TrangMieng',
        'Kem dừa trong vỏ dừa nướng thơm',
        'DangBan',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON023',
        'Bánh mousse chanh dây',
        89000,
        'TrangMieng',
        'Bánh lạnh chua nhẹ, béo vừa',
        'DangBan',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON024',
        'Pudding xoài',
        69000,
        'TrangMieng',
        'Pudding mềm, xoài chín tự nhiên',
        'DangBan',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON025',
        'Trái cây theo mùa',
        59000,
        'TrangMieng',
        'Dưa, nho, cam, kiwi',
        'DangBan',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
        NULL
    ),
    -- 6. ĐỒ UỐNG (Drinks & Wine)
    (
        'MON026',
        'Nước suối Lavie',
        25000,
        'DoUong',
        'Chai 500ml',
        'DangBan',
        'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON027',
        'Nước ép cam tươi',
        59000,
        'DoUong',
        'Cam nguyên chất 100%',
        'DangBan',
        'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON028',
        'Trà đào cam sả',
        69000,
        'DoUong',
        'Trà đen, đào tươi, sả thơm',
        'DangBan',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON029',
        'Rượu vang đỏ Pháp (ly)',
        159000,
        'DoUong',
        'Red Wine Bordeaux',
        'DangBan',
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON030',
        'Cocktail Lumière',
        189000,
        'DoUong',
        'Công thức đặc biệt, vị ngọt nhẹ',
        'DangBan',
        'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=400&fit=crop',
        'NewMenu'
    ),
    (
        'MON031',
        'Cà phê Espresso',
        55000,
        'DoUong',
        'Đậm vị, hạt rang xay tại quán',
        'DangBan',
        'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=400&fit=crop',
        NULL
    ),
    -- 7. MÓN CHAY (Vegetarian)
    (
        'MON032',
        'Cơm chiên nấm hương',
        129000,
        'MonChay',
        'Cơm gạo thơm chiên cùng nấm hương',
        'DangBan',
        'https://img.mservice.com.vn/common/u/2e02fb5fe4f64fb55bc713540643c6f8eae702d101cea8c59afc49cfc505fc37/1823ef29-b6bd-4431-aeac-bf6aa1082afcuihsicu6.jpeg',
        NULL
    ),
    (
        'MON033',
        'Salad rau củ sốt mè rang',
        99000,
        'MonChay',
        'Rau củ tươi, mè rang, nước sốt đặc trưng',
        'DangBan',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop',
        NULL
    ),
    (
        'MON034',
        'Đậu hũ kho tiêu xanh',
        109000,
        'MonChay',
        'Đậm vị, ăn cùng cơm trắng',
        'DangBan',
        'https://i.ytimg.com/vi/TF-sMiee24A/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCAKazQNh_42YdqHrg1xO2EOyqK7g',
        NULL
    ),
    (
        'MON035',
        'Mì Ý sốt kem chay',
        139000,
        'MonChay',
        'Không dùng phô mai, vị béo tự nhiên từ hạt điều',
        'DangBan',
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=400&fit=crop',
        NULL
    );

-- Chèn dữ liệu ORDER
INSERT INTO
    `ORDER` (
        MaOrder,
        MaBan,
        MaNV,
        MaKH,
        ThoiGian,
        TrangThai,
        GhiChu
    )
VALUES
    (
        'ORD1736000000001',
        'B001',
        'NV017',
        'KH001',
        DATE_SUB(NOW(), INTERVAL 30 MINUTE),
        'DangXuLy',
        'Khách yêu cầu không cay'
    ),
    (
        'ORD1736000000002',
        'B002',
        'NV018',
        NULL,
        DATE_SUB(NOW(), INTERVAL 15 MINUTE),
        'DangXuLy',
        'Giao nhanh'
    ),
    (
        'ORD1736000000003',
        'B003',
        'NV021',
        'KH002',
        DATE_SUB(NOW(), INTERVAL 5 MINUTE),
        'DangXuLy',
        ''
    ),
    (
        'ORD1736000000004',
        'B004',
        'NV023',
        NULL,
        DATE_SUB(NOW(), INTERVAL 2 HOUR),
        'ChoThanhToan',
        'Đã hoàn thành'
    ),
    (
        'ORD1736000000005',
        'B005',
        'NV026',
        'KH001',
        DATE_SUB(NOW(), INTERVAL 3 HOUR),
        'DaThanhToan',
        ''
    );

-- Chèn dữ liệu CHITIETORDER
INSERT INTO
    CHITIETORDER (MaCT, MaOrder, MaMon, SoLuong, DonGia, TrangThai)
VALUES
    (
        'ORD1736000000001-1',
        'ORD1736000000001',
        'MON006',
        2,
        349000,
        'DangCheBien'
    ),
    (
        'ORD1736000000001-2',
        'ORD1736000000001',
        'MON002',
        1,
        119000,
        'ChoCheBien'
    ),
    (
        'ORD1736000000001-3',
        'ORD1736000000001',
        'MON026',
        2,
        25000,
        'HoanThanh'
    ),
    (
        'ORD1736000000001-4',
        'ORD1736000000001',
        'MON031',
        1,
        55000,
        'HoanThanh'
    ),
    (
        'ORD1736000000002-1',
        'ORD1736000000002',
        'MON007',
        1,
        299000,
        'ChoCheBien'
    ),
    (
        'ORD1736000000002-2',
        'ORD1736000000002',
        'MON005',
        1,
        129000,
        'ChoCheBien'
    ),
    (
        'ORD1736000000002-3',
        'ORD1736000000002',
        'MON027',
        1,
        59000,
        'HoanThanh'
    ),
    (
        'ORD1736000000003-1',
        'ORD1736000000003',
        'MON009',
        2,
        329000,
        'DangCheBien'
    ),
    (
        'ORD1736000000003-2',
        'ORD1736000000003',
        'MON003',
        1,
        99000,
        'ChoCheBien'
    ),
    (
        'ORD1736000000003-3',
        'ORD1736000000003',
        'MON030',
        2,
        189000,
        'HoanThanh'
    ),
    (
        'ORD1736000000004-1',
        'ORD1736000000004',
        'MON008',
        1,
        249000,
        'HoanThanh'
    ),
    (
        'ORD1736000000004-2',
        'ORD1736000000004',
        'MON021',
        1,
        99000,
        'HoanThanh'
    ),
    (
        'ORD1736000000004-3',
        'ORD1736000000004',
        'MON029',
        2,
        159000,
        'HoanThanh'
    ),
    (
        'ORD1736000000005-1',
        'ORD1736000000005',
        'MON011',
        1,
        799000,
        'HoanThanh'
    ),
    (
        'ORD1736000000005-2',
        'ORD1736000000005',
        'MON021',
        1,
        99000,
        'HoanThanh'
    ),
    (
        'ORD1736000000005-3',
        'ORD1736000000005',
        'MON026',
        1,
        25000,
        'HoanThanh'
    ),
    (
        'ORD1736000000005-4',
        'ORD1736000000005',
        'MON031',
        1,
        55000,
        'HoanThanh'
    );

-- Chèn dữ liệu HOADON
INSERT INTO
    HOADON (
        MaHD,
        MaOrder,
        MaNV,
        TongTien,
        GiamGia,
        ThanhTien,
        NgayThanhToan,
        HinhThucTT
    )
VALUES
    (
        'HD1736000000001',
        'ORD1736000000005',
        'NV004',
        978000,
        0,
        978000,
        DATE_SUB(NOW(), INTERVAL 3 HOUR),
        'TienMat'
    );

-- Bật lại kiểm tra khóa ngoại
SET
    FOREIGN_KEY_CHECKS = 1;

-- Bật lại Safe Update Mode
SET
    SQL_SAFE_UPDATES = 1;

-- ============================================
-- HOÀN TẤT
-- ============================================
SELECT
    'Database setup completed successfully!' AS Status;