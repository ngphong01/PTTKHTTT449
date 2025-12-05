# 🍽️ Hệ Thống Quản Lý Nhà Hàng

Hệ thống quản lý nhà hàng được xây dựng bằng React.js, Tailwind CSS và Node.js với MySQL database.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Chạy dự án](#chạy-dự-án)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Tài khoản mẫu](#tài-khoản-mẫu)
- [API Endpoints](#api-endpoints)

## ✨ Tính năng

### 1. Quản lý bàn ăn
- Xem danh sách tất cả bàn
- Thêm/sửa/xóa bàn
- Theo dõi trạng thái bàn: Trống, Đã đặt, Đang phục vụ, Chờ thanh toán
- Quản lý số ghế và vị trí bàn

### 2. Quản lý thực đơn
- Xem danh sách món ăn theo loại (Món chính, Món phụ, Đồ uống)
- Thêm/sửa/xóa món ăn
- Cập nhật giá và trạng thái món (Đang bán/Hết hàng)
- Lọc món theo loại

### 3. Quản lý Order
- Tạo order mới cho bàn
- Thêm/xóa món vào order
- Xem danh sách order và trạng thái
- Quản lý số lượng món trong order

### 4. Quản lý bếp
- Xem danh sách order đang chờ chế biến
- Cập nhật trạng thái món: Chờ chế biến → Đang chế biến → Hoàn thành
- Tự động refresh danh sách order

### 5. Thanh toán
- Xem danh sách order chờ thanh toán
- Tính toán tổng tiền, giảm giá
- Hỗ trợ nhiều hình thức thanh toán: Tiền mặt, Thẻ, Chuyển khoản
- Xuất hóa đơn

### 6. Báo cáo doanh thu
- Doanh thu theo ngày
- Doanh thu theo tháng
- Top món bán chạy
- Doanh số theo nhân viên

### 7. Đăng nhập/Phân quyền
- Hệ thống đăng nhập với phân quyền
- Quản lý, Phục vụ, Bếp, Thu ngân

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - MySQL database driver
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Routing
- **Tailwind CSS** - CSS framework
- **Axios** - HTTP client
- **React Icons** - Icon library

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 14.0.0
- npm >= 6.0.0
- MySQL >= 5.7 hoặc MariaDB >= 10.2

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd PTTKHTTT449
```

### Bước 2: Cài đặt dependencies

**Cài đặt tất cả dependencies (backend + frontend):**
```bash
npm run install-all
```

**Hoặc cài đặt riêng:**

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### Bước 3: Cấu hình MySQL

Tạo file `.env` trong thư mục `backend`:

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin MySQL của bạn:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
PORT=5000
```

### Bước 4: Khởi tạo database

Có 2 cách để khởi tạo database:

**Cách 1: Import file SQL (Khuyến nghị)**

Sử dụng file `backend/database.sql`:

```bash
mysql -u root -p < backend/database.sql
```

Hoặc mở file `backend/database.sql` trong MySQL Workbench/phpMyAdmin và chạy script.

**Cách 2: Sử dụng script Node.js**

```bash
cd backend
npm run init-db
```

Hoặc:

```bash
node backend/scripts/initDatabase.js
```

**Lưu ý:** Cả 2 cách đều sẽ tự động:
- Tạo database `restaurant_db` nếu chưa có
- Tạo tất cả các bảng cần thiết
- Chèn dữ liệu mẫu

## 🚀 Chạy dự án

### Chạy cả backend và frontend cùng lúc:
```bash
npm run dev
```

### Chạy riêng:

**Backend (port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (port 3000):**
```bash
cd frontend
npm start
```

Sau khi chạy, truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📁 Cấu trúc dự án

```
PTTKHTTT449/
├── backend/
│   ├── .env                       # MySQL configuration (tạo từ .env.example)
│   ├── routes/
│   │   ├── ban.js                 # API routes cho bàn
│   │   ├── menu.js                # API routes cho menu
│   │   ├── order.js               # API routes cho order
│   │   ├── nhanVien.js            # API routes cho nhân viên
│   │   ├── hoaDon.js              # API routes cho hóa đơn
│   │   ├── baoCao.js              # API routes cho báo cáo
│   │   └── khachHang.js           # API routes cho khách hàng
│   ├── scripts/
│   │   └── initDatabase.js        # Script khởi tạo database
│   ├── database.js                # Database connection
│   ├── server.js                  # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js           # Component đăng nhập
│   │   │   ├── Sidebar.js         # Component sidebar
│   │   │   ├── Dashboard.js       # Component dashboard
│   │   │   ├── QuanLyBan.js       # Component quản lý bàn
│   │   │   ├── QuanLyMenu.js      # Component quản lý menu
│   │   │   ├── QuanLyOrder.js     # Component quản lý order
│   │   │   ├── QuanLyBep.js       # Component quản lý bếp
│   │   │   ├── ThanhToan.js       # Component thanh toán
│   │   │   └── BaoCao.js          # Component báo cáo
│   │   ├── api/
│   │   │   └── api.js             # API client
│   │   ├── App.js                 # Main App component
│   │   ├── index.js               # Entry point
│   │   └── index.css              # Global styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── package.json                   # Root package.json
└── README.md
```

## 👤 Tài khoản mẫu

Sau khi khởi tạo database, bạn có thể đăng nhập với các tài khoản sau:

| Chức vụ | Tài khoản | Mật khẩu |
|---------|-----------|----------|
| Quản lý | admin | admin123 |
| Phục vụ | phucvu1 | 123456 |
| Bếp | bep1 | 123456 |
| Thu ngân | thungan1 | 123456 |

## 🔌 API Endpoints

### Bàn (Ban)
- `GET /api/ban` - Lấy tất cả bàn
- `GET /api/ban/:maBan` - Lấy bàn theo mã
- `POST /api/ban` - Tạo bàn mới
- `PUT /api/ban/:maBan/trangthai` - Cập nhật trạng thái bàn
- `DELETE /api/ban/:maBan` - Xóa bàn

### Menu
- `GET /api/menu` - Lấy tất cả món (có thể filter theo loaiMon)
- `GET /api/menu/:maMon` - Lấy món theo mã
- `POST /api/menu` - Thêm món mới
- `PUT /api/menu/:maMon` - Cập nhật món
- `DELETE /api/menu/:maMon` - Xóa món

### Order
- `GET /api/order` - Lấy tất cả order (có thể filter theo trangThai, maBan)
- `GET /api/order/:maOrder` - Lấy order theo mã (kèm chi tiết)
- `POST /api/order` - Tạo order mới
- `PUT /api/order/:maOrder/trangthai` - Cập nhật trạng thái order
- `PUT /api/order/chitiet/:maCT/trangthai` - Cập nhật trạng thái chi tiết order

### Nhân viên
- `GET /api/nhanvien` - Lấy tất cả nhân viên
- `POST /api/nhanvien/dangnhap` - Đăng nhập

### Hóa đơn
- `GET /api/hoadon` - Lấy tất cả hóa đơn (có thể filter theo ngày)
- `GET /api/hoadon/:maHD` - Lấy hóa đơn theo mã
- `POST /api/hoadon` - Tạo hóa đơn

### Báo cáo
- `GET /api/baocao/doanhthu/ngay` - Doanh thu theo ngày
- `GET /api/baocao/doanhthu/thang` - Doanh thu theo tháng
- `GET /api/baocao/topmon` - Top món bán chạy
- `GET /api/baocao/doanhso/nhanvien` - Doanh số theo nhân viên

### Khách hàng
- `GET /api/khachhang` - Lấy tất cả khách hàng
- `POST /api/khachhang` - Thêm khách hàng mới

## 📊 Database Schema

### Bảng NHANVIEN
- MaNV (PRIMARY KEY)
- TenNV
- ChucVu
- TaiKhoan
- MatKhau
- TrangThai

### Bảng BAN
- MaBan (PRIMARY KEY)
- TenBan
- SoGhe
- TrangThai
- ViTri

### Bảng MONAN
- MaMon (PRIMARY KEY)
- TenMon
- DonGia
- LoaiMon
- MoTa
- TrangThaiMon
- HinhAnh

### Bảng ORDER
- MaOrder (PRIMARY KEY)
- MaBan (FOREIGN KEY)
- MaNV (FOREIGN KEY)
- MaKH (FOREIGN KEY)
- ThoiGian
- TrangThai
- GhiChu

### Bảng CHITIETORDER
- MaCT (PRIMARY KEY)
- MaOrder (FOREIGN KEY)
- MaMon (FOREIGN KEY)
- SoLuong
- DonGia
- TrangThai

### Bảng HOADON
- MaHD (PRIMARY KEY)
- MaOrder (FOREIGN KEY)
- MaNV (FOREIGN KEY)
- TongTien
- GiamGia
- ThanhTien
- NgayThanhToan
- HinhThucTT

### Bảng KHACHHANG
- MaKH (PRIMARY KEY)
- TenKH
- SoDienThoai
- Email
- DiaChi
- NgayTao

## 🎯 Quy trình sử dụng

1. **Đăng nhập** với tài khoản phù hợp
2. **Quản lý bàn**: Xem và quản lý trạng thái bàn
3. **Tạo Order**: Chọn bàn và thêm món vào order
4. **Bếp xử lý**: Bếp nhận order và cập nhật trạng thái chế biến
5. **Thanh toán**: Thu ngân thanh toán và xuất hóa đơn
6. **Xem báo cáo**: Xem doanh thu và thống kê

## 📝 Ghi chú

- **MySQL cần được cài đặt và chạy trước khi khởi động backend**
- File `.env` trong thư mục `backend` chứa thông tin kết nối MySQL
- Dữ liệu mẫu được tự động tạo khi chạy script `initDatabase.js`
- Frontend tự động refresh khi có thay đổi code (hot reload)
- Backend sử dụng nodemon để tự động restart khi có thay đổi code
- Database MySQL được lưu trên MySQL server, không phải file local

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License

---

**Phát triển bởi:** [Tên của bạn]
**Ngày:** 2024

