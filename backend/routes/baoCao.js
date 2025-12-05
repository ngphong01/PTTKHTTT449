const express = require('express');
const router = express.Router();
const db = require('../database');

// Báo cáo doanh thu theo ngày
router.get('/doanhthu/ngay', async (req, res) => {
  const { ngay } = req.query;
  const date = ngay || new Date().toISOString().split('T')[0];
  
  try {
    const [rows] = await db.query(
      `SELECT 
        DATE(NgayThanhToan) as Ngay,
        COUNT(*) as SoHoaDon,
        SUM(ThanhTien) as TongDoanhThu
       FROM HOADON
       WHERE DATE(NgayThanhToan) = ?
       GROUP BY DATE(NgayThanhToan)`,
      [date]
    );
    
    res.json(rows[0] || { Ngay: date, SoHoaDon: 0, TongDoanhThu: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Báo cáo doanh thu theo tháng
router.get('/doanhthu/thang', async (req, res) => {
  const { thang, nam } = req.query;
  const month = thang || new Date().getMonth() + 1;
  const year = nam || new Date().getFullYear();
  
  try {
    const [rows] = await db.query(
      `SELECT 
        DATE(NgayThanhToan) as Ngay,
        COUNT(*) as SoHoaDon,
        SUM(ThanhTien) as TongDoanhThu
       FROM HOADON
       WHERE MONTH(NgayThanhToan) = ? AND YEAR(NgayThanhToan) = ?
       GROUP BY DATE(NgayThanhToan)
       ORDER BY Ngay`,
      [month, year]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top món bán chạy
router.get('/topmon', async (req, res) => {
  const { limit = 10, ngayBatDau, ngayKetThuc } = req.query;
  
  try {
    let query = `
      SELECT 
        m.MaMon,
        m.TenMon,
        m.LoaiMon,
        SUM(ct.SoLuong) as TongSoLuong,
        SUM(ct.SoLuong * ct.DonGia) as TongDoanhThu
      FROM CHITIETORDER ct
      LEFT JOIN MONAN m ON ct.MaMon = m.MaMon
      LEFT JOIN \`ORDER\` o ON ct.MaOrder = o.MaOrder
      LEFT JOIN HOADON h ON o.MaOrder = h.MaOrder
      WHERE h.MaHD IS NOT NULL
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
    
    query += `
      GROUP BY m.MaMon, m.TenMon, m.LoaiMon
      ORDER BY TongSoLuong DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doanh số theo nhân viên
router.get('/doanhso/nhanvien', async (req, res) => {
  const { ngayBatDau, ngayKetThuc } = req.query;
  
  try {
    let query = `
      SELECT 
        nv.MaNV,
        nv.TenNV,
        nv.ChucVu,
        COUNT(DISTINCT h.MaHD) as SoHoaDon,
        SUM(h.ThanhTien) as TongDoanhThu
      FROM HOADON h
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
    
    query += `
      GROUP BY nv.MaNV, nv.TenNV, nv.ChucVu
      ORDER BY TongDoanhThu DESC
    `;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
