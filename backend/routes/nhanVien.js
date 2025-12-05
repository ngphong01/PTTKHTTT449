const express = require('express');
const router = express.Router();
const db = require('../database');
const crypto = require('crypto');

// Helper function để hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Lấy tất cả nhân viên
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT MaNV, TenNV, ChucVu, TrangThai, HinhAnh FROM NHANVIEN ORDER BY MaNV');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách tài khoản (để debug)
router.get('/taikhoan', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT TaiKhoan, TenNV, ChucVu, TrangThai FROM NHANVIEN ORDER BY TaiKhoan');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đăng nhập
router.post('/dangnhap', async (req, res) => {
  const { TaiKhoan, MatKhau } = req.body;
  
  console.log('Đăng nhập request:', { TaiKhoan, MatKhau: MatKhau ? '***' : 'empty' });
  
  if (!TaiKhoan || !MatKhau) {
    res.status(400).json({ error: 'Vui lòng nhập tài khoản và mật khẩu' });
    return;
  }
  
  try {
    // Debug: Kiểm tra xem tài khoản có tồn tại không
    const [checkUser] = await db.query(
      'SELECT TaiKhoan, MatKhau FROM NHANVIEN WHERE TaiKhoan = ?',
      [TaiKhoan]
    );
    
    if (checkUser.length === 0) {
      // Debug: Liệt kê một số tài khoản có sẵn để tham khảo
      const [allUsers] = await db.query(
        'SELECT TaiKhoan, TenNV FROM NHANVIEN LIMIT 5'
      );
      console.log('Tài khoản không tồn tại. Một số tài khoản có sẵn:', allUsers.map(u => u.TaiKhoan));
      res.status(401).json({ 
        error: 'Tài khoản không tồn tại',
        suggestion: 'Vui lòng kiểm tra lại tên đăng nhập. Một số tài khoản mẫu: admin, phucvu1, bep1, thungan1'
      });
      return;
    }
    
    // Hash mật khẩu để so sánh
    const hashedPassword = hashPassword(MatKhau);
    
    // So sánh mật khẩu đã hash
    const [rows] = await db.query(
      'SELECT MaNV, TenNV, ChucVu, TrangThai, HinhAnh FROM NHANVIEN WHERE TaiKhoan = ? AND MatKhau = ?',
      [TaiKhoan, hashedPassword]
    );
    
    console.log('Kết quả query:', rows.length, 'rows found');
    if (rows.length === 0) {
      console.log('Mật khẩu không đúng cho tài khoản:', TaiKhoan);
      res.status(401).json({ error: 'Sai mật khẩu' });
      return;
    }
    
    // Kiểm tra trạng thái nhân viên
    if (rows[0].TrangThai !== 'DangLam') {
      res.status(403).json({ error: 'Tài khoản đã bị khóa hoặc không hoạt động' });
      return;
    }
    
    console.log('Đăng nhập thành công:', rows[0].TenNV);
    res.json(rows[0]);
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng nhập: ' + err.message });
  }
});

// Cập nhật thông tin nhân viên
router.put('/:maNV', async (req, res) => {
  const { maNV } = req.params;
  const { TenNV, ChucVu, HinhAnh } = req.body;
  
  try {
    // Kiểm tra nhân viên có tồn tại không
    const [checkRows] = await db.query('SELECT MaNV FROM NHANVIEN WHERE MaNV = ?', [maNV]);
    if (checkRows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy nhân viên' });
      return;
    }
    
    // Cập nhật thông tin
    const updateFields = [];
    const updateValues = [];
    
    if (TenNV !== undefined) {
      updateFields.push('TenNV = ?');
      updateValues.push(TenNV);
    }
    if (ChucVu !== undefined) {
      updateFields.push('ChucVu = ?');
      updateValues.push(ChucVu);
    }
    if (HinhAnh !== undefined) {
      updateFields.push('HinhAnh = ?');
      updateValues.push(HinhAnh);
    }
    
    if (updateFields.length === 0) {
      res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
      return;
    }
    
    updateValues.push(maNV);
    await db.query(
      `UPDATE NHANVIEN SET ${updateFields.join(', ')} WHERE MaNV = ?`,
      updateValues
    );
    
    // Lấy lại thông tin đã cập nhật
    const [updatedRows] = await db.query(
      'SELECT MaNV, TenNV, ChucVu, TrangThai, HinhAnh FROM NHANVIEN WHERE MaNV = ?',
      [maNV]
    );
    
    // Kiểm tra nếu HinhAnh quá dài (base64 có thể rất dài)
    if (updatedRows[0] && updatedRows[0].HinhAnh && updatedRows[0].HinhAnh.length > 10000) {
      console.warn('HinhAnh quá dài, có thể gây vấn đề hiển thị');
    }
    
    res.json(updatedRows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
