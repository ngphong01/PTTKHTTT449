const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả hóa đơn
router.get('/', async (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  try {
    let query = `
      SELECT h.*, o.MaBan, b.TenBan, nv.TenNV as TenNhanVien
      FROM HOADON h
      LEFT JOIN \`ORDER\` o ON h.MaOrder = o.MaOrder
      LEFT JOIN BAN b ON o.MaBan = b.MaBan
      LEFT JOIN NHANVIEN nv ON h.MaNV = nv.MaNV
      WHERE 1=1
    `;
    const params = [];
    
    if (ngayBatDau) {
      query += ' AND DATE(h.NgayThanhToan) >= ?';
      params.push(ngayBatDau);
    }
    
    if (ngayKetThuc) {
      query += ' AND DATE(h.NgayThanhToan) <= ?';
      params.push(ngayKetThuc);
    }
    
    query += ' ORDER BY h.NgayThanhToan DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy hóa đơn theo mã
router.get('/:maHD', async (req, res) => {
  const { maHD } = req.params;
  
  try {
    const [hoaDons] = await db.query(
      `SELECT h.*, o.MaBan, b.TenBan, nv.TenNV as TenNhanVien
       FROM HOADON h
       LEFT JOIN \`ORDER\` o ON h.MaOrder = o.MaOrder
       LEFT JOIN BAN b ON o.MaBan = b.MaBan
       LEFT JOIN NHANVIEN nv ON h.MaNV = nv.MaNV
       WHERE h.MaHD = ?`,
      [maHD]
    );
    
    if (hoaDons.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
      return;
    }
    
    const hoaDon = hoaDons[0];
    
    // Lấy chi tiết order
    const [chiTiet] = await db.query(
      `SELECT ct.*, m.TenMon
       FROM CHITIETORDER ct
       LEFT JOIN MONAN m ON ct.MaMon = m.MaMon
       WHERE ct.MaOrder = ?`,
      [hoaDon.MaOrder]
    );
    
    res.json({ ...hoaDon, chiTiet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo hóa đơn
router.post('/', async (req, res) => {
  const { MaOrder, MaNV, GiamGia, HinhThucTT } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Tính tổng tiền từ chi tiết order
    const [rows] = await connection.query(
      'SELECT SUM(SoLuong * DonGia) as TongTien FROM CHITIETORDER WHERE MaOrder = ?',
      [MaOrder]
    );
    
    const TongTien = rows[0].TongTien || 0;
    const GiamGiaValue = GiamGia || 0;
    const ThanhTien = TongTien - GiamGiaValue;
    const MaHD = `HD${Date.now()}`;
    
    await connection.query(
      'INSERT INTO HOADON (MaHD, MaOrder, MaNV, TongTien, GiamGia, ThanhTien, HinhThucTT) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [MaHD, MaOrder, MaNV, TongTien, GiamGiaValue, ThanhTien, HinhThucTT || 'TienMat']
    );
    
    // Cập nhật trạng thái order và bàn
    await connection.query('UPDATE `ORDER` SET TrangThai = ? WHERE MaOrder = ?', ['DaThanhToan', MaOrder]);
    
    const [orders] = await connection.query('SELECT MaBan FROM `ORDER` WHERE MaOrder = ?', [MaOrder]);
    if (orders.length > 0) {
      await connection.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', ['Trong', orders[0].MaBan]);
    }
    
    await connection.commit();
    res.json({ MaHD, ThanhTien, message: 'Đã tạo hóa đơn thành công' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
