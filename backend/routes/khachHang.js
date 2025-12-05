const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// Helper function để hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper function để generate MaKH
const generateMaKH = async () => {
  const [rows] = await db.query('SELECT MaKH FROM KHACHHANG ORDER BY MaKH DESC LIMIT 1');
  if (rows.length === 0) {
    return 'KH001';
  }
  const lastMaKH = rows[0].MaKH;
  const num = parseInt(lastMaKH.replace('KH', '')) + 1;
  return `KH${num.toString().padStart(3, '0')}`;
};

// Đăng ký tài khoản khách hàng
router.post('/dangky', async (req, res) => {
  const { TenKH, TaiKhoan, Email, MatKhau, SoDienThoai, DiaChi, NgaySinh, GioiTinh } = req.body;

  if (!TenKH || !MatKhau) {
    res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
    return;
  }

  if (MatKhau.length < 6) {
    res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    return;
  }

  try {
    // Tạo mã khách hàng
    const MaKH = await generateMaKH();
    const hashedPassword = hashPassword(MatKhau);

    // Tạo TaiKhoan nếu không có (từ Email hoặc tự động)
    let finalTaiKhoan = TaiKhoan;
    if (!finalTaiKhoan) {
      if (Email) {
        finalTaiKhoan = Email.split('@')[0]; // Lấy phần trước @ của email
      } else {
        finalTaiKhoan = `user_${MaKH}`;
      }
    }

    // Kiểm tra TaiKhoan đã tồn tại chưa
    const [colCheckTaiKhoan] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME = 'TaiKhoan'
    `);
    
    if (colCheckTaiKhoan.length > 0) {
      const [existingTaiKhoan] = await db.query('SELECT MaKH FROM KHACHHANG WHERE TaiKhoan = ?', [finalTaiKhoan]);
      if (existingTaiKhoan.length > 0) {
        // Nếu trùng, thêm số vào cuối
        let counter = 1;
        let newTaiKhoan = `${finalTaiKhoan}${counter}`;
        while (true) {
          const [check] = await db.query('SELECT MaKH FROM KHACHHANG WHERE TaiKhoan = ?', [newTaiKhoan]);
          if (check.length === 0) break;
          counter++;
          newTaiKhoan = `${finalTaiKhoan}${counter}`;
        }
        finalTaiKhoan = newTaiKhoan;
      }
    }

    // Kiểm tra email đã tồn tại chưa (nếu có email)
    if (Email) {
      const [existingEmail] = await db.query('SELECT MaKH FROM KHACHHANG WHERE Email = ?', [Email]);
      if (existingEmail.length > 0) {
        res.status(400).json({ error: 'Email đã được sử dụng' });
        return;
      }
    }

    // Kiểm tra các cột có tồn tại không
    const [colCheck] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('TaiKhoan', 'MatKhau', 'NgaySinh', 'GioiTinh', 'DiemTichLuy', 'LoaiKhach', 'TrangThai')
    `);
    
    const existingCols = colCheck.map(c => c.COLUMN_NAME);
    const hasTaiKhoan = existingCols.includes('TaiKhoan');
    const hasNewCols = existingCols.includes('MatKhau');

    if (hasNewCols) {
      // Nếu có các cột mới, insert đầy đủ
      if (hasTaiKhoan) {
        await db.query(
          `INSERT INTO KHACHHANG (MaKH, TenKH, TaiKhoan, Email, MatKhau, SoDienThoai, DiaChi, NgaySinh, GioiTinh, DiemTichLuy, LoaiKhach, TrangThai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Thuong', 'HoatDong')`,
          [MaKH, TenKH, finalTaiKhoan, Email || null, hashedPassword, SoDienThoai || null, DiaChi || null, NgaySinh || null, GioiTinh || null]
        );
      } else {
        await db.query(
          `INSERT INTO KHACHHANG (MaKH, TenKH, Email, MatKhau, SoDienThoai, DiaChi, NgaySinh, GioiTinh, DiemTichLuy, LoaiKhach, TrangThai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'Thuong', 'HoatDong')`,
          [MaKH, TenKH, Email || null, hashedPassword, SoDienThoai || null, DiaChi || null, NgaySinh || null, GioiTinh || null]
        );
      }
    } else {
      // Nếu chưa có các cột mới, chỉ insert cơ bản
      if (hasTaiKhoan) {
        await db.query(
          `INSERT INTO KHACHHANG (MaKH, TenKH, TaiKhoan, Email, SoDienThoai, DiaChi)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [MaKH, TenKH, finalTaiKhoan, Email || null, SoDienThoai || null, DiaChi || null]
        );
      } else {
        await db.query(
          `INSERT INTO KHACHHANG (MaKH, TenKH, Email, SoDienThoai, DiaChi)
           VALUES (?, ?, ?, ?, ?)`,
          [MaKH, TenKH, Email || null, SoDienThoai || null, DiaChi || null]
        );
      }
    }

    // Lấy thông tin khách hàng vừa tạo
    const [colCheck2] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('TaiKhoan', 'NgaySinh', 'GioiTinh', 'DiemTichLuy', 'LoaiKhach', 'TrangThai')
    `);
    
    const existingCols2 = colCheck2.map(c => c.COLUMN_NAME);
    let selectQuery = `SELECT MaKH, TenKH, Email, SoDienThoai, DiaChi, NgayTao`;
    if (existingCols2.includes('TaiKhoan')) selectQuery += `, TaiKhoan`;
    if (existingCols2.includes('NgaySinh')) selectQuery += `, NgaySinh`;
    if (existingCols2.includes('GioiTinh')) selectQuery += `, GioiTinh`;
    if (existingCols2.includes('DiemTichLuy')) selectQuery += `, DiemTichLuy`;
    if (existingCols2.includes('LoaiKhach')) selectQuery += `, LoaiKhach`;
    if (existingCols2.includes('TrangThai')) selectQuery += `, TrangThai`;
    selectQuery += ` FROM KHACHHANG WHERE MaKH = ?`;
    
    const [newCustomer] = await db.query(selectQuery, [MaKH]);

    const result = {
      ...newCustomer[0],
      TaiKhoan: newCustomer[0].TaiKhoan || finalTaiKhoan,
      NgaySinh: newCustomer[0].NgaySinh || null,
      GioiTinh: newCustomer[0].GioiTinh || null,
      DiemTichLuy: newCustomer[0].DiemTichLuy || 0,
      LoaiKhach: newCustomer[0].LoaiKhach || 'Thuong',
      TrangThai: newCustomer[0].TrangThai || 'HoatDong'
    };

    res.status(201).json({
      message: 'Đăng ký thành công',
      data: result
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng ký: ' + err.message });
  }
});

// Đăng nhập khách hàng
router.post('/dangnhap', async (req, res) => {
  const { TaiKhoan, Email, MatKhau } = req.body;
  
  // Nhận cả TaiKhoan hoặc Email (tương thích với cả hai)
  const loginValue = TaiKhoan || Email;

  if (!loginValue || !MatKhau) {
    res.status(400).json({ error: 'Vui lòng nhập tài khoản (username hoặc email) và mật khẩu' });
    return;
  }

  try {
    const hashedPassword = hashPassword(MatKhau);
    
    // Kiểm tra các cột có tồn tại không
    const [colCheck] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('TaiKhoan', 'MatKhau', 'NgaySinh', 'GioiTinh', 'DiemTichLuy', 'LoaiKhach', 'TrangThai')
    `);
    
    const existingCols = colCheck.map(c => c.COLUMN_NAME);
    const hasTaiKhoan = existingCols.includes('TaiKhoan');
    const hasMatKhau = existingCols.includes('MatKhau');
    const hasTrangThai = existingCols.includes('TrangThai');

    if (!hasMatKhau) {
      res.status(500).json({ error: 'Hệ thống chưa được cấu hình đầy đủ. Vui lòng chạy script update database.' });
      return;
    }

    let query = `SELECT MaKH, TenKH, Email, SoDienThoai, DiaChi, NgayTao`;
    
    if (hasTaiKhoan) query += `, TaiKhoan`;
    if (existingCols.includes('NgaySinh')) query += `, NgaySinh`;
    if (existingCols.includes('GioiTinh')) query += `, GioiTinh`;
    if (existingCols.includes('DiemTichLuy')) query += `, DiemTichLuy`;
    if (existingCols.includes('LoaiKhach')) query += `, LoaiKhach`;
    if (hasTrangThai) query += `, TrangThai`;
    
    // Cho phép đăng nhập bằng TaiKhoan hoặc Email
    let whereClause = '';
    if (hasTaiKhoan) {
      if (hasTrangThai) {
        whereClause = ` FROM KHACHHANG WHERE (TaiKhoan = ? OR Email = ?) AND MatKhau = ? AND (TrangThai = 'HoatDong' OR TrangThai IS NULL)`;
      } else {
        whereClause = ` FROM KHACHHANG WHERE (TaiKhoan = ? OR Email = ?) AND MatKhau = ?`;
      }
      query += whereClause;
      var [rows] = await db.query(query, [loginValue, loginValue, hashedPassword]);
    } else {
      // Nếu chưa có cột TaiKhoan, chỉ dùng Email
      if (hasTrangThai) {
        whereClause = ` FROM KHACHHANG WHERE Email = ? AND MatKhau = ? AND (TrangThai = 'HoatDong' OR TrangThai IS NULL)`;
      } else {
        whereClause = ` FROM KHACHHANG WHERE Email = ? AND MatKhau = ?`;
      }
      query += whereClause;
      var [rows] = await db.query(query, [loginValue, hashedPassword]);
    }

    if (rows.length === 0) {
      res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
      return;
    }

    // Đảm bảo các trường mới có giá trị mặc định nếu không tồn tại
    const user = rows[0];
    const result = {
      ...user,
      TaiKhoan: user.TaiKhoan || null,
      NgaySinh: user.NgaySinh || null,
      GioiTinh: user.GioiTinh || null,
      DiemTichLuy: user.DiemTichLuy || 0,
      LoaiKhach: user.LoaiKhach || 'Thuong',
      TrangThai: user.TrangThai || 'HoatDong'
    };

    res.json(result);
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng nhập: ' + err.message });
  }
});

// Lấy thông tin khách hàng theo MaKH
router.get('/:maKH', async (req, res) => {
  const { maKH } = req.params;
  try {
    // Kiểm tra các cột có tồn tại không
    const [colCheck] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('NgaySinh', 'GioiTinh', 'DiemTichLuy', 'LoaiKhach', 'TrangThai')
    `);
    
    const existingCols = colCheck.map(c => c.COLUMN_NAME);
    
    let query = `SELECT MaKH, TenKH, Email, SoDienThoai, DiaChi, NgayTao`;
    
    if (existingCols.includes('NgaySinh')) query += `, NgaySinh`;
    if (existingCols.includes('GioiTinh')) query += `, GioiTinh`;
    if (existingCols.includes('DiemTichLuy')) query += `, DiemTichLuy`;
    if (existingCols.includes('LoaiKhach')) query += `, LoaiKhach`;
    if (existingCols.includes('TrangThai')) query += `, TrangThai`;
    
    query += ` FROM KHACHHANG WHERE MaKH = ?`;
    
    const [rows] = await db.query(query, [maKH]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      return;
    }

    const user = rows[0];
    const { MatKhau, ...userWithoutPassword } = user; // Loại bỏ MatKhau thật
    const result = {
      ...userWithoutPassword,
      NgaySinh: user.NgaySinh || null,
      GioiTinh: user.GioiTinh || null,
      DiemTichLuy: user.DiemTichLuy || 0,
      LoaiKhach: user.LoaiKhach || 'Thuong',
      TrangThai: user.TrangThai || 'HoatDong',
      MatKhau: '••••••••' // Chỉ hiển thị dấu ẩn
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật thông tin khách hàng
router.put('/:maKH', async (req, res) => {
  const { maKH } = req.params;
  const { TenKH, TaiKhoan, SoDienThoai, DiaChi, NgaySinh, GioiTinh, MatKhau, LoaiKhach, TrangThai } = req.body;

  try {
    // Kiểm tra khách hàng có tồn tại không
    const [checkRows] = await db.query('SELECT MaKH FROM KHACHHANG WHERE MaKH = ?', [maKH]);
    if (checkRows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      return;
    }

    // Kiểm tra các cột có tồn tại không
    const [colCheck] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('NgaySinh', 'GioiTinh')
    `);
    
    const existingCols = colCheck.map(c => c.COLUMN_NAME);

    // Kiểm tra cột MatKhau, TaiKhoan, LoaiKhach, TrangThai
    const [colCheckAll] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('MatKhau', 'TaiKhoan', 'LoaiKhach', 'TrangThai', 'NgaySinh', 'GioiTinh')
    `);
    const existingColsAll = colCheckAll.map(c => c.COLUMN_NAME);

    // Cập nhật thông tin
    const updateFields = [];
    const updateValues = [];

    if (TenKH !== undefined) {
      updateFields.push('TenKH = ?');
      updateValues.push(TenKH);
    }
    if (TaiKhoan !== undefined && existingColsAll.includes('TaiKhoan')) {
      updateFields.push('TaiKhoan = ?');
      updateValues.push(TaiKhoan);
    }
    if (MatKhau !== undefined && existingColsAll.includes('MatKhau')) {
      // Hash mật khẩu trước khi lưu
      const hashedPassword = hashPassword(MatKhau);
      updateFields.push('MatKhau = ?');
      updateValues.push(hashedPassword);
    }
    if (SoDienThoai !== undefined) {
      updateFields.push('SoDienThoai = ?');
      updateValues.push(SoDienThoai);
    }
    if (DiaChi !== undefined) {
      updateFields.push('DiaChi = ?');
      updateValues.push(DiaChi);
    }
    if (NgaySinh !== undefined && existingColsAll.includes('NgaySinh')) {
      updateFields.push('NgaySinh = ?');
      updateValues.push(NgaySinh);
    }
    if (GioiTinh !== undefined && existingColsAll.includes('GioiTinh')) {
      updateFields.push('GioiTinh = ?');
      updateValues.push(GioiTinh);
    }
    if (LoaiKhach !== undefined && existingColsAll.includes('LoaiKhach')) {
      updateFields.push('LoaiKhach = ?');
      updateValues.push(LoaiKhach);
    }
    if (TrangThai !== undefined && existingColsAll.includes('TrangThai')) {
      updateFields.push('TrangThai = ?');
      updateValues.push(TrangThai);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
      return;
    }

    updateValues.push(maKH);
    await db.query(
      `UPDATE KHACHHANG SET ${updateFields.join(', ')} WHERE MaKH = ?`,
      updateValues
    );

    // Lấy lại thông tin đã cập nhật
    const [colCheck2] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('NgaySinh', 'GioiTinh', 'DiemTichLuy', 'LoaiKhach', 'TrangThai')
    `);
    
    const existingCols2 = colCheck2.map(c => c.COLUMN_NAME);
    
    let query = `SELECT MaKH, TenKH, Email, SoDienThoai, DiaChi, NgayTao`;
    
    if (existingCols2.includes('NgaySinh')) query += `, NgaySinh`;
    if (existingCols2.includes('GioiTinh')) query += `, GioiTinh`;
    if (existingCols2.includes('DiemTichLuy')) query += `, DiemTichLuy`;
    if (existingCols2.includes('LoaiKhach')) query += `, LoaiKhach`;
    if (existingCols2.includes('TrangThai')) query += `, TrangThai`;
    
    query += ` FROM KHACHHANG WHERE MaKH = ?`;
    
    const [updatedRows] = await db.query(query, [maKH]);

    const user = updatedRows[0];
    const result = {
      ...user,
      NgaySinh: user.NgaySinh || null,
      GioiTinh: user.GioiTinh || null,
      DiemTichLuy: user.DiemTichLuy || 0,
      LoaiKhach: user.LoaiKhach || 'Thuong',
      TrangThai: user.TrangThai || 'HoatDong'
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đổi mật khẩu
router.put('/:maKH/doimatkhau', async (req, res) => {
  const { maKH } = req.params;
  const { MatKhauCu, MatKhauMoi } = req.body;

  if (!MatKhauCu || !MatKhauMoi) {
    res.status(400).json({ error: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
    return;
  }

  if (MatKhauMoi.length < 6) {
    res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    return;
  }

  try {
    // Kiểm tra cột MatKhau có tồn tại không
    const [colCheck] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME = 'MatKhau'
    `);
    
    if (colCheck.length === 0) {
      res.status(500).json({ error: 'Hệ thống chưa được cấu hình đầy đủ. Vui lòng chạy script update database.' });
      return;
    }

    // Kiểm tra mật khẩu cũ
    const hashedOldPassword = hashPassword(MatKhauCu);
    const [rows] = await db.query(
      'SELECT MaKH FROM KHACHHANG WHERE MaKH = ? AND MatKhau = ?',
      [maKH, hashedOldPassword]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Mật khẩu cũ không đúng' });
      return;
    }

    // Cập nhật mật khẩu mới
    const hashedNewPassword = hashPassword(MatKhauMoi);
    await db.query(
      'UPDATE KHACHHANG SET MatKhau = ? WHERE MaKH = ?',
      [hashedNewPassword, maKH]
    );

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy lịch sử đơn hàng của khách hàng
router.get('/:maKH/donhang', async (req, res) => {
  const { maKH } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        o.MaOrder,
        o.ThoiGian,
        o.TrangThai,
        o.GhiChu,
        COALESCE(b.TenBan, 'N/A') as TenBan,
        COALESCE(nv.TenNV, 'N/A') as TenNhanVien,
        COALESCE(SUM(ct.SoLuong * ct.DonGia), 0) as TongTien
       FROM \`ORDER\` o
       LEFT JOIN BAN b ON o.MaBan = b.MaBan
       LEFT JOIN NHANVIEN nv ON o.MaNV = nv.MaNV
       LEFT JOIN CHITIETORDER ct ON o.MaOrder = ct.MaOrder
       WHERE o.MaKH = ?
       GROUP BY o.MaOrder, o.ThoiGian, o.TrangThai, o.GhiChu, b.TenBan, nv.TenNV
       ORDER BY o.ThoiGian DESC`,
      [maKH]
    );

    res.json(rows);
  } catch (err) {
    console.error('Lỗi lấy lịch sử đơn hàng:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy tất cả khách hàng (cho admin)
router.get('/', async (req, res) => {
  try {
    // Kiểm tra các cột có tồn tại không
    const [colCheck] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'KHACHHANG' 
      AND COLUMN_NAME IN ('NgaySinh', 'GioiTinh', 'DiemTichLuy', 'LoaiKhach', 'TrangThai')
    `);
    
    const existingCols = colCheck.map(c => c.COLUMN_NAME);
    
    let query = `SELECT MaKH, TenKH, Email, SoDienThoai, DiaChi, NgayTao`;
    
    if (existingCols.includes('NgaySinh')) query += `, NgaySinh`;
    if (existingCols.includes('GioiTinh')) query += `, GioiTinh`;
    if (existingCols.includes('DiemTichLuy')) query += `, DiemTichLuy`;
    if (existingCols.includes('LoaiKhach')) query += `, LoaiKhach`;
    if (existingCols.includes('TrangThai')) query += `, TrangThai`;
    
    query += ` FROM KHACHHANG ORDER BY NgayTao DESC`;
    
    const [rows] = await db.query(query);
    
    // Đảm bảo các trường mới có giá trị mặc định và KHÔNG trả về mật khẩu
    const results = rows.map(user => {
      const { MatKhau, ...userWithoutPassword } = user; // Loại bỏ MatKhau
      return {
        ...userWithoutPassword,
        NgaySinh: user.NgaySinh || null,
        GioiTinh: user.GioiTinh || null,
        DiemTichLuy: user.DiemTichLuy || 0,
        LoaiKhach: user.LoaiKhach || 'Thuong',
        TrangThai: user.TrangThai || 'HoatDong',
        MatKhau: '••••••••' // Chỉ hiển thị dấu ẩn
      };
    });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
