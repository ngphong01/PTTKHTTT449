import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ban API
export const banAPI = {
  getAll: () => api.get('/ban'),
  getById: (maBan) => api.get(`/ban/${maBan}`),
  create: (data) => api.post('/ban', data),
  update: (maBan, data) => api.put(`/ban/${maBan}`, data),
  updateTrangThai: (maBan, trangThai) => api.put(`/ban/${maBan}/trangthai`, { TrangThai: trangThai }),
  delete: (maBan) => api.delete(`/ban/${maBan}`),
};

// Menu API
export const menuAPI = {
  getAll: (loaiMon) => api.get('/menu', { params: { loaiMon } }),
  getById: (maMon) => api.get(`/menu/${maMon}`),
  create: (data) => api.post('/menu', data),
  update: (maMon, data) => api.put(`/menu/${maMon}`, data),
  delete: (maMon) => api.delete(`/menu/${maMon}`),
};

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/order', { params }),
  getById: (maOrder) => api.get(`/order/${maOrder}`),
  create: (data) => api.post('/order', data),
  updateTrangThai: (maOrder, trangThai) => api.put(`/order/${maOrder}/trangthai`, { TrangThai: trangThai }),
  updateChiTietTrangThai: (maCT, trangThai) => api.put(`/order/chitiet/${maCT}/trangthai`, { TrangThai: trangThai }),
};

// Nhan Vien API
export const nhanVienAPI = {
  getAll: () => api.get('/nhanvien'),
  login: (data) => api.post('/nhanvien/dangnhap', data),
  update: (maNV, data) => api.put(`/nhanvien/${maNV}`, data),
};

// Hoa Don API
export const hoaDonAPI = {
  getAll: (params) => api.get('/hoadon', { params }),
  getById: (maHD) => api.get(`/hoadon/${maHD}`),
  create: (data) => api.post('/hoadon', data),
};

// Bao Cao API
export const baoCaoAPI = {
  doanhThuNgay: (ngay) => api.get('/baocao/doanhthu/ngay', { params: { ngay } }),
  doanhThuThang: (thang, nam) => api.get('/baocao/doanhthu/thang', { params: { thang, nam } }),
  topMon: (params) => api.get('/baocao/topmon', { params }),
  doanhSoNhanVien: (params) => api.get('/baocao/doanhso/nhanvien', { params }),
};

// Khach Hang API
export const khachHangAPI = {
  register: (data) => api.post('/khachhang/dangky', data),
  login: (data) => api.post('/khachhang/dangnhap', data),
  getById: (maKH) => api.get(`/khachhang/${maKH}`),
  update: (maKH, data) => api.put(`/khachhang/${maKH}`, data),
  changePassword: (maKH, data) => api.put(`/khachhang/${maKH}/doimatkhau`, data),
  getOrderHistory: (maKH) => api.get(`/khachhang/${maKH}/donhang`),
  getAll: () => api.get('/khachhang'),
};

// Dat Ban API
export const datBanAPI = {
  getAll: (params) => api.get('/datban', { params }),
  create: (data) => api.post('/datban', data),
  updateTrangThai: (maDatBan, trangThai) => api.put(`/datban/${maDatBan}/trangthai`, { TrangThai: trangThai }),
  delete: (maDatBan) => api.delete(`/datban/${maDatBan}`),
  autoAssign: (maBan) => api.post(`/datban/auto-assign/${maBan}`),
};

// Hang Doi API
export const hangDoiAPI = {
  getAll: (params) => api.get('/hangdoi', { params }),
  delete: (maHangDoi) => api.delete(`/hangdoi/${maHangDoi}`),
};

export default api;

