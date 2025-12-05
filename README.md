
# Hệ Thống Quản Lý Nhà Hàng

Hệ thống quản lý nhà hàng được phát triển bằng React.js, Tailwind CSS, Node.js và MySQL.
Mục tiêu của dự án là hỗ trợ số hóa quy trình vận hành nhà hàng, bao gồm: quản lý bàn, thực đơn, order, bếp, thanh toán và báo cáo doanh thu.

## Mục lục

* Tính năng
* Công nghệ sử dụng
* Cài đặt
* Chạy dự án
* Cấu trúc dự án
* Tài khoản mẫu
* API Endpoints
* Bản quyền và điều khoản sử dụng

---

## Tính năng

### 1. Quản lý bàn ăn

* Hiển thị danh sách tất cả bàn trong nhà hàng
* Thêm, sửa, xóa thông tin bàn
* Theo dõi trạng thái bàn: trống, đã đặt, đang phục vụ, chờ thanh toán
* Quản lý số lượng ghế và khu vực bàn ăn

### 2. Quản lý thực đơn

* Xem danh sách món ăn theo từng loại
* Thêm, cập nhật và xóa món ăn
* Thay đổi giá bán, hình ảnh và trạng thái món ăn
* Lọc món theo phân loại

### 3. Quản lý order

* Tạo order mới
* Thêm hoặc xóa món trong từng order
* Theo dõi trạng thái order
* Quản lý số lượng và ghi chú món ăn

### 4. Quản lý bếp

* Hiển thị danh sách món cần chế biến
* Cập nhật trạng thái chế biến: chờ, đang chế biến, hoàn thành
* Tự động cập nhật danh sách yêu cầu mới

### 5. Thanh toán

* Hiển thị các order đang chờ thanh toán
* Tính tổng tiền, giảm giá và số tiền cuối cùng
* Hỗ trợ nhiều hình thức thanh toán: tiền mặt, thẻ, chuyển khoản
* Xuất hóa đơn và lưu lịch sử thanh toán

### 6. Báo cáo doanh thu

* Báo cáo doanh thu theo ngày
* Báo cáo doanh thu theo tháng
* Thống kê món ăn bán chạy
* Thống kê doanh số theo nhân viên

### 7. Đăng nhập và phân quyền

* Hệ thống đăng nhập theo từng vai trò
* Phân quyền: quản lý, phục vụ, thu ngân, bếp
* Giới hạn quyền thao tác theo từng chức vụ

---

## Công nghệ sử dụng

### Frontend

* React.js
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js (Express)
* MySQL
* JWT Authentication

### Khác

* RESTful API
* Môi trường đa nền tảng (Windows / Linux / MacOS)

---

## Bản quyền và điều khoản sử dụng

Năm phát hành: 2025
Tác giả: Đào Văn Phong

Toàn bộ mã nguồn thuộc quyền sở hữu của tác giả.
Không cho phép sao chép, chỉnh sửa, phân phối hoặc sử dụng dưới bất kỳ hình thức nào khi chưa có sự đồng ý bằng văn bản của tác giả.

Dự án được cung cấp chỉ với mục đích học tập, nghiên cứu và trình bày trong khuôn khổ môn học.
Tác giả không chịu bất kỳ trách nhiệm nào đối với rủi ro phát sinh nếu mã nguồn bị sử dụng sai mục đích hoặc gây thiệt hại cho bên thứ ba.

