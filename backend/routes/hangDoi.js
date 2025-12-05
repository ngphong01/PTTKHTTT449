const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả hàng đợi
router.get('/', async (req, res) => {
  const { trangThai } = req.query;
  try {
    let query = `
      SELECT hd.*, 
        b.TenBan, b.SoGhe,
        kh.TenKH as TenKhachHang
      FROM HANGDOI hd
      LEFT JOIN BAN b ON hd.MaBan = b.MaBan
      LEFT JOIN KHACHHANG kh ON hd.MaKH = kh.MaKH
      WHERE 1=1
    `;
    const params = [];
    
    if (trangThai) {
      query += ' AND hd.TrangThai = ?';
      params.push(trangThai);
    }
    
    query += ' ORDER BY hd.ThoiGianTao ASC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa khỏi hàng đợi
router.delete('/:maHangDoi', async (req, res) => {
  const { maHangDoi } = req.params;
  
  try {
    await db.query('DELETE FROM HANGDOI WHERE MaHangDoi = ?', [maHangDoi]);
    res.json({ message: 'Đã xóa khỏi hàng đợi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

