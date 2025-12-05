const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả món ăn
router.get('/', async (req, res) => {
  const { loaiMon } = req.query;
  try {
    let query = 'SELECT * FROM MONAN WHERE 1=1';
    const params = [];
    
    if (loaiMon) {
      query += ' AND LoaiMon = ?';
      params.push(loaiMon);
    }
    
    query += ' ORDER BY LoaiMon, TenMon';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy món theo mã
router.get('/:maMon', async (req, res) => {
  const { maMon } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM MONAN WHERE MaMon = ?', [maMon]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy món ăn' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo món mới
router.post('/', async (req, res) => {
  const { MaMon, TenMon, DonGia, LoaiMon, MoTa, HinhAnh, Tag } = req.body;
  try {
    // Kiểm tra xem cột Tag có tồn tại không
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'MONAN' 
      AND COLUMN_NAME = 'Tag'
    `);
    const hasTag = columns.length > 0;
    
    if (hasTag) {
      await db.query(
        'INSERT INTO MONAN (MaMon, TenMon, DonGia, LoaiMon, MoTa, TrangThaiMon, HinhAnh, Tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [MaMon, TenMon, DonGia, LoaiMon, MoTa || '', 'DangBan', HinhAnh || '', Tag || null]
      );
    } else {
      await db.query(
        'INSERT INTO MONAN (MaMon, TenMon, DonGia, LoaiMon, MoTa, TrangThaiMon, HinhAnh) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [MaMon, TenMon, DonGia, LoaiMon, MoTa || '', 'DangBan', HinhAnh || '']
      );
    }
    res.json({ MaMon, message: 'Đã thêm món thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật món ăn
router.put('/:maMon', async (req, res) => {
  const { maMon } = req.params;
  const { TenMon, DonGia, LoaiMon, MoTa, TrangThaiMon, HinhAnh, Tag } = req.body;
  
  try {
    // Kiểm tra xem cột Tag có tồn tại không
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'MONAN' 
      AND COLUMN_NAME = 'Tag'
    `);
    const hasTag = columns.length > 0;
    
    if (hasTag) {
      await db.query(
        'UPDATE MONAN SET TenMon = ?, DonGia = ?, LoaiMon = ?, MoTa = ?, TrangThaiMon = ?, HinhAnh = ?, Tag = ? WHERE MaMon = ?',
        [TenMon, DonGia, LoaiMon, MoTa || '', TrangThaiMon || 'DangBan', HinhAnh || '', Tag || null, maMon]
      );
    } else {
      await db.query(
        'UPDATE MONAN SET TenMon = ?, DonGia = ?, LoaiMon = ?, MoTa = ?, TrangThaiMon = ?, HinhAnh = ? WHERE MaMon = ?',
        [TenMon, DonGia, LoaiMon, MoTa || '', TrangThaiMon || 'DangBan', HinhAnh || '', maMon]
      );
    }
    res.json({ message: 'Đã cập nhật món thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa món ăn
router.delete('/:maMon', async (req, res) => {
  const { maMon } = req.params;
  try {
    await db.query('DELETE FROM MONAN WHERE MaMon = ?', [maMon]);
    res.json({ message: 'Đã xóa món thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
