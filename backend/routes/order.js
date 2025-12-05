const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả order
router.get('/', async (req, res) => {
  const { trangThai, maBan } = req.query;
  try {
    let query = `
      SELECT o.*, b.TenBan, nv.TenNV as TenNhanVien, nv.HinhAnh as HinhAnhNV
      FROM \`ORDER\` o
      LEFT JOIN BAN b ON o.MaBan = b.MaBan
      LEFT JOIN NHANVIEN nv ON o.MaNV = nv.MaNV
      WHERE 1=1
    `;
    const params = [];
    
    if (trangThai) {
      query += ' AND o.TrangThai = ?';
      params.push(trangThai);
    }
    
    if (maBan) {
      query += ' AND o.MaBan = ?';
      params.push(maBan);
    }
    
    query += ' ORDER BY o.ThoiGian DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy order theo mã
router.get('/:maOrder', async (req, res) => {
  const { maOrder } = req.params;
  
  try {
    const [orders] = await db.query(
      `SELECT o.*, b.TenBan, nv.TenNV as TenNhanVien, nv.HinhAnh as HinhAnhNV
       FROM \`ORDER\` o
       LEFT JOIN BAN b ON o.MaBan = b.MaBan
       LEFT JOIN NHANVIEN nv ON o.MaNV = nv.MaNV
       WHERE o.MaOrder = ?`,
      [maOrder]
    );
    
    if (orders.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy order' });
      return;
    }
    
    const order = orders[0];
    
    // Lấy chi tiết order
    const [chiTiet] = await db.query(
      `SELECT ct.*, m.TenMon, m.LoaiMon
       FROM CHITIETORDER ct
       LEFT JOIN MONAN m ON ct.MaMon = m.MaMon
       WHERE ct.MaOrder = ?`,
      [maOrder]
    );
    
    res.json({ ...order, chiTiet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo order mới
router.post('/', async (req, res) => {
  const { MaBan, MaNV, MaKH, GhiChu, chiTiet } = req.body;
  const MaOrder = `ORD${Date.now()}`;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Tạo order
    await connection.query(
      'INSERT INTO `ORDER` (MaOrder, MaBan, MaNV, MaKH, GhiChu) VALUES (?, ?, ?, ?, ?)',
      [MaOrder, MaBan, MaNV, MaKH || null, GhiChu || '']
    );
    
    // Cập nhật trạng thái bàn
    await connection.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', ['DangPhucVu', MaBan]);
    
    // Thêm chi tiết order
    if (chiTiet && chiTiet.length > 0) {
      const chiTietValues = chiTiet.map((item, index) => [
        `${MaOrder}-${index + 1}`,
        MaOrder,
        item.MaMon,
        item.SoLuong,
        item.DonGia
      ]);
      
      await connection.query(
        'INSERT INTO CHITIETORDER (MaCT, MaOrder, MaMon, SoLuong, DonGia) VALUES ?',
        [chiTietValues]
      );
    }
    
    await connection.commit();
    res.json({ MaOrder, message: 'Đã tạo order thành công' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Cập nhật trạng thái chi tiết order (cho bếp)
router.put('/chitiet/:maCT/trangthai', async (req, res) => {
  const { maCT } = req.params;
  const { TrangThai } = req.body;
  
  try {
    await db.query('UPDATE CHITIETORDER SET TrangThai = ? WHERE MaCT = ?', [TrangThai, maCT]);
    res.json({ message: 'Đã cập nhật trạng thái món' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật trạng thái order
router.put('/:maOrder/trangthai', async (req, res) => {
  const { maOrder } = req.params;
  const { TrangThai } = req.body;
  
  try {
    await db.query('UPDATE `ORDER` SET TrangThai = ? WHERE MaOrder = ?', [TrangThai, maOrder]);
    
    // Nếu order hoàn thành, cập nhật trạng thái bàn
    if (TrangThai === 'HoanThanh') {
      const [orders] = await db.query('SELECT MaBan FROM `ORDER` WHERE MaOrder = ?', [maOrder]);
      if (orders.length > 0) {
        await db.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', ['ChoThanhToan', orders[0].MaBan]);
      }
    }
    
    res.json({ message: 'Đã cập nhật trạng thái order' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
