import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import QuanLyBan from './components/QuanLyBan';
import QuanLyMenu from './components/QuanLyMenu';
import QuanLyOrder from './components/QuanLyOrder';
import QuanLyBep from './components/QuanLyBep';
import ThanhToan from './components/ThanhToan';
import BaoCao from './components/BaoCao';
import DonKhach from './components/DonKhach';
import QuanLyKhachHang from './components/QuanLyKhachHang';
import QuanLyNguoiDung from './components/QuanLyNguoiDung';
import QuanLyDatBan from './components/QuanLyDatBan';
import CustomerMenu from './components/CustomerMenu';
import HomePage from './components/HomePage';
import Register from './components/Register';
import TableReservation from './components/TableReservation';
import CustomerPayment from './components/CustomerPayment';
import OrderTracking from './components/OrderTracking';
import UserProfile from './components/UserProfile';
import About from './components/About';
import Contact from './components/Contact';
import Cart from './components/Cart';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { nhanVienAPI } from './api/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Fetch lại dữ liệu mới nhất từ server để đảm bảo đồng bộ
          const response = await nhanVienAPI.getAll();
          const allEmployees = response.data;
          const updatedUser = allEmployees.find(emp => emp.MaNV === userData.MaNV);
          
          if (updatedUser) {
            // Cập nhật với dữ liệu mới từ server (ưu tiên dữ liệu từ server)
            const finalUser = {
              ...userData,
              ...updatedUser // Ưu tiên dữ liệu từ server
            };
            setUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
          } else {
            // Nếu không tìm thấy, dùng dữ liệu cũ
            setUser(userData);
          }
        } catch (error) {
          console.error('Lỗi load user:', error);
          // Nếu có lỗi, vẫn dùng dữ liệu từ localStorage
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      }
      setLoading(false);
    };
    
    loadUser();
    
    // Lắng nghe sự kiện cập nhật user từ các component khác
    const handleUserUpdate = (event) => {
      const updatedUser = event.detail;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Hàm để các component khác có thể cập nhật user
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Dispatch event để các component khác biết user đã được update
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: userData }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Giao diện khách hàng - Không cần đăng nhập */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/customer" element={<CustomerMenu />} />
        <Route path="/thuc-don" element={<CustomerMenu />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dat-ban" element={<TableReservation />} />
        <Route path="/thanh-toan" element={<CustomerPayment />} />
        <Route path="/theo-doi-don-hang" element={<OrderTracking />} />
        <Route path="/theo-doi-don-hang/:orderId" element={<OrderTracking />} />
        <Route path="/tai-khoan" element={<UserProfile />} />
        <Route path="/gioi-thieu" element={<About />} />
        <Route path="/lien-he" element={<Contact />} />
        <Route path="/gio-hang" element={<Cart />} />
        
        {/* Giao diện quản lý - Cần đăng nhập */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login 
                onLogin={(userData) => {
                  // Kiểm tra xem là customer hay employee
                  if (userData.MaKH) {
                    // Customer - lưu vào localStorage và redirect về trang chủ
                    localStorage.setItem('customer', JSON.stringify(userData));
                    window.location.href = '/';
                  } else if (userData.MaNV) {
                    // Employee - sử dụng handleLogin
                    handleLogin(userData);
                  }
                }} 
                isCustomer={false}
              />
            )
          }
        />
        <Route
          path="/*"
          element={
            user ? (
              <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header user={user} />
                  <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard user={user} />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/donkhach" element={<DonKhach user={user} />} />
                      <Route path="/ban" element={<QuanLyBan />} />
                      <Route path="/menu" element={<QuanLyMenu />} />
                      <Route path="/order" element={<QuanLyOrder user={user} onUserUpdate={updateUser} />} />
                      <Route path="/bep" element={<QuanLyBep />} />
                      <Route path="/thanhtoan" element={<ThanhToan />} />
                      <Route path="/khachhang" element={<QuanLyKhachHang />} />
                      <Route path="/nguoidung" element={<QuanLyNguoiDung />} />
                      <Route path="/datban" element={<QuanLyDatBan user={user} />} />
                      <Route path="/baocao" element={<BaoCao />} />
                    </Routes>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

