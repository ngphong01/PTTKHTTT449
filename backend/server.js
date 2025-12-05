const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const banRoutes = require('./routes/ban');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const nhanVienRoutes = require('./routes/nhanVien');
const hoaDonRoutes = require('./routes/hoaDon');
const baoCaoRoutes = require('./routes/baoCao');
const khachHangRoutes = require('./routes/khachHang');
const datBanRoutes = require('./routes/datBan');
const hangDoiRoutes = require('./routes/hangDoi');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/ban', banRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/nhanvien', nhanVienRoutes);
app.use('/api/hoadon', hoaDonRoutes);
app.use('/api/baocao', baoCaoRoutes);
app.use('/api/khachhang', khachHangRoutes);
app.use('/api/datban', datBanRoutes);
app.use('/api/hangdoi', hangDoiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

