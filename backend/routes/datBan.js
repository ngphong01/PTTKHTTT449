const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả đặt bàn
router.get('/', async (req, res) => {
  const { ngay, trangThai } = req.query;
  try {
    let query = `
      SELECT db.*, 
        b.TenBan, b.SoGhe, b.ViTri,
        kh.TenKH as TenKhachHang, kh.Email as EmailKhachHang
      FROM DATBAN db
      LEFT JOIN BAN b ON db.MaBan = b.MaBan
      LEFT JOIN KHACHHANG kh ON db.MaKH = kh.MaKH
      WHERE 1=1
    `;
    const params = [];
    
    if (ngay) {
      query += ' AND DATE(db.NgayDat) = ?';
      params.push(ngay);
    }
    
    if (trangThai) {
      query += ' AND db.TrangThai = ?';
      params.push(trangThai);
    }
    
    query += ' ORDER BY db.NgayDat DESC, db.GioDat DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo đặt bàn mới (tự động phân bổ bàn hoặc vào hàng đợi)
router.post('/', async (req, res) => {
  const { MaKH, HoTen, SoDienThoai, Email, NgayDat, GioDat, SoNguoi, KhuVuc, GhiChu } = req.body;
  const MaDatBan = `DB${Date.now()}`;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Tìm bàn trống phù hợp
    const [availableTables] = await connection.query(
      `SELECT * FROM BAN 
       WHERE TrangThai = 'Trong' 
       AND SoGhe >= ? 
       ORDER BY SoGhe ASC, MaBan ASC
       LIMIT 1`,
      [SoNguoi]
    );
    
    let maBan = null;
    let trangThai = 'ChoXacNhan';
    
    if (availableTables.length > 0) {
      // Có bàn trống → đặt bàn ngay
      maBan = availableTables[0].MaBan;
      trangThai = 'DaXacNhan';
      
      // Cập nhật trạng thái bàn thành "DaDat" (đã đặt)
      await connection.query(
        'UPDATE BAN SET TrangThai = ? WHERE MaBan = ?',
        ['DaDat', maBan]
      );
    } else {
      // Không có bàn trống → vào hàng đợi
      const MaHangDoi = `HD${Date.now()}`;
      await connection.query(
        `INSERT INTO HANGDOI (MaHangDoi, MaKH, HoTen, SoDienThoai, Email, SoNguoi, KhuVuc, GhiChu, ThoiGianDat, TrangThai)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [MaHangDoi, MaKH || null, HoTen, SoDienThoai, Email || null, SoNguoi, KhuVuc || null, GhiChu || null, `${NgayDat} ${GioDat}`, 'Cho']
      );
      
      trangThai = 'TrongHangDoi';
    }
    
    // Tạo đặt bàn
    await connection.query(
      `INSERT INTO DATBAN (MaDatBan, MaKH, MaBan, HoTen, SoDienThoai, Email, NgayDat, GioDat, SoNguoi, KhuVuc, GhiChu, TrangThai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [MaDatBan, MaKH || null, maBan, HoTen, SoDienThoai, Email || null, NgayDat, GioDat, SoNguoi, KhuVuc || null, GhiChu || null, trangThai]
    );
    
    await connection.commit();
    
    res.json({ 
      MaDatBan, 
      MaBan: maBan,
      TrangThai: trangThai,
      message: maBan ? 'Đặt bàn thành công!' : 'Đã thêm vào danh sách hàng đợi. Chúng tôi sẽ liên hệ khi có bàn trống.'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Lỗi đặt bàn:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Cập nhật trạng thái đặt bàn
router.put('/:maDatBan/trangthai', async (req, res) => {
  const { maDatBan } = req.params;
  const { TrangThai } = req.body;
  
  try {
    await db.query('UPDATE DATBAN SET TrangThai = ? WHERE MaDatBan = ?', [TrangThai, maDatBan]);
    res.json({ message: 'Đã cập nhật trạng thái' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa đặt bàn
router.delete('/:maDatBan', async (req, res) => {
  const { maDatBan } = req.params;
  
  try {
    // Lấy thông tin bàn trước khi xóa
    const [datBan] = await db.query('SELECT MaBan FROM DATBAN WHERE MaDatBan = ?', [maDatBan]);
    
    await db.query('DELETE FROM DATBAN WHERE MaDatBan = ?', [maDatBan]);
    
    // Nếu có bàn, cập nhật lại trạng thái bàn về "Trong"
    if (datBan.length > 0 && datBan[0].MaBan) {
      await db.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', ['Trong', datBan[0].MaBan]);
      
      // Tự động phân bổ bàn cho người đầu tiên trong hàng đợi
      await autoAssignTable(datBan[0].MaBan);
    }
    
    res.json({ message: 'Đã xóa đặt bàn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hàm tự động phân bổ bàn khi có bàn trống
async function autoAssignTable(maBan) {
  try {
    // Lấy thông tin bàn
    const [banInfo] = await db.query('SELECT SoGhe FROM BAN WHERE MaBan = ?', [maBan]);
    if (banInfo.length === 0) return;
    
    const soGhe = banInfo[0].SoGhe;
    
    // Tìm người đầu tiên trong hàng đợi phù hợp
    const [hangDoi] = await db.query(
      `SELECT * FROM HANGDOI 
       WHERE TrangThai = 'Cho' 
       AND SoNguoi <= ?
       ORDER BY ThoiGianTao ASC
       LIMIT 1`,
      [soGhe]
    );
    
    if (hangDoi.length > 0) {
      const hd = hangDoi[0];
      
      // Cập nhật hàng đợi
      await db.query(
        'UPDATE HANGDOI SET MaBan = ?, TrangThai = ? WHERE MaHangDoi = ?',
        [maBan, 'DaPhanBan', hd.MaHangDoi]
      );
      
      // Tạo đặt bàn
      const MaDatBan = `DB${Date.now()}`;
      await db.query(
        `INSERT INTO DATBAN (MaDatBan, MaKH, MaBan, HoTen, SoDienThoai, Email, NgayDat, GioDat, SoNguoi, KhuVuc, GhiChu, TrangThai)
         VALUES (?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?, ?)`,
        [MaDatBan, hd.MaKH, maBan, hd.HoTen, hd.SoDienThoai, hd.Email, hd.SoNguoi, hd.KhuVuc, hd.GhiChu, 'DaXacNhan']
      );
      
      // Cập nhật trạng thái bàn
      await db.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', ['DaDat', maBan]);
      
      console.log(`Đã tự động phân bổ bàn ${maBan} cho ${hd.HoTen}`);
    } else {
      // Không có người trong hàng đợi, giữ bàn ở trạng thái "Trong"
      await db.query('UPDATE BAN SET TrangThai = ? WHERE MaBan = ?', ['Trong', maBan]);
    }
  } catch (err) {
    console.error('Lỗi tự động phân bổ bàn:', err);
  }
}

// API để gọi khi bàn trống (từ admin hoặc khi thanh toán xong)
router.post('/auto-assign/:maBan', async (req, res) => {
  const { maBan } = req.params;
  try {
    await autoAssignTable(maBan);
    res.json({ message: 'Đã kiểm tra và phân bổ bàn tự động' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export hàm để sử dụng ở nơi khác
module.exports.autoAssignTable = autoAssignTable;

module.exports = router;

