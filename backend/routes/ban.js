const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả bàn (kèm thông tin nhân viên đang phục vụ)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.*,
        nv.TenNV as TenNhanVien,
        nv.MaNV as MaNhanVien,
        nv.HinhAnh as HinhAnhNV,
        o.MaOrder,
        o.ThoiGian as ThoiGianOrder
      FROM BAN b
      LEFT JOIN (
        SELECT o1.*
        FROM \`ORDER\` o1
        INNER JOIN (
          SELECT MaBan, MAX(ThoiGian) as MaxThoiGian
          FROM \`ORDER\`
          WHERE TrangThai IN ('DangXuLy', 'HoanThanh', 'ChoThanhToan')
          GROUP BY MaBan
        ) o2 ON o1.MaBan = o2.MaBan AND o1.ThoiGian = o2.MaxThoiGian
      ) o ON b.MaBan = o.MaBan
      LEFT JOIN NHANVIEN nv ON o.MaNV = nv.MaNV
      ORDER BY b.MaBan
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy bàn theo mã
router.get('/:maBan', async (req, res) => {
  const { maBan } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM BAN WHERE MaBan = ?', [maBan]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Không tìm thấy bàn' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo bàn mới
router.post('/', async (req, res) => {
  const { MaBan, TenBan, SoGhe, ViTri } = req.body;
  try {
    await db.query(
      'INSERT INTO BAN (MaBan, TenBan, SoGhe, TrangThai, ViTri) VALUES (?, ?, ?, ?, ?)',
      [MaBan, TenBan, SoGhe || 4, 'Trong', ViTri || '']
    );
    res.json({ MaBan, message: 'Đã tạo bàn thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật trạng thái bàn
router.put('/:maBan/trangthai', async (req, res) => {
  const { maBan } = req.params;
  const { TrangThai } = req.body;
  try {
    await db.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', [TrangThai, maBan]);
    
    // Nếu bàn chuyển sang trạng thái "Trong", tự động phân bổ bàn cho hàng đợi
    if (TrangThai === 'Trong') {
      // Import và gọi hàm tự động phân bổ
      const { autoAssignTable } = require('./datBan');
      await autoAssignTable(maBan);
    }
    
    res.json({ message: 'Đã cập nhật trạng thái bàn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật thông tin bàn đầy đủ
router.put('/:maBan', async (req, res) => {
  const { maBan } = req.params;
  const { TenBan, SoGhe, ViTri, TrangThai } = req.body;
  try {
    const updateFields = [];
    const updateValues = [];
    
    if (TenBan !== undefined) {
      updateFields.push('TenBan = ?');
      updateValues.push(TenBan);
    }
    if (SoGhe !== undefined) {
      updateFields.push('SoGhe = ?');
      updateValues.push(SoGhe);
    }
    if (ViTri !== undefined) {
      updateFields.push('ViTri = ?');
      updateValues.push(ViTri);
    }
    if (TrangThai !== undefined) {
      updateFields.push('TrangThai = ?');
      updateValues.push(TrangThai);
    }
    
    if (updateFields.length === 0) {
      res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
      return;
    }
    
    updateValues.push(maBan);
    await db.query(
      `UPDATE BAN SET ${updateFields.join(', ')} WHERE MaBan = ?`,
      updateValues
    );
    
    // Lấy lại thông tin đã cập nhật
    const [updatedRows] = await db.query('SELECT * FROM BAN WHERE MaBan = ?', [maBan]);
    res.json(updatedRows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa bàn
router.delete('/:maBan', async (req, res) => {
  const { maBan } = req.params;
  try {
    await db.query('DELETE FROM BAN WHERE MaBan = ?', [maBan]);
    res.json({ message: 'Đã xóa bàn thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
