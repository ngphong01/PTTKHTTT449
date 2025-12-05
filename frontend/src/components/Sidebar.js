import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiMenu, FiShoppingCart, FiCoffee, FiCreditCard, FiBarChart2, FiLogOut, FiUser, FiUsers, FiUserCheck, FiCalendar } from 'react-icons/fi';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  // Menu items theo chức vụ
  const getMenuItems = () => {
    const chucVu = user?.ChucVu;
    
    // Quản lý: Tất cả chức năng
    if (chucVu === 'QuanLy') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/donkhach', icon: FiUsers, label: 'Đón Khách' },
        { path: '/ban', icon: FiGrid, label: 'Quản Lý Bàn' },
        { path: '/menu', icon: FiMenu, label: 'Quản Lý Menu' },
        { path: '/order', icon: FiShoppingCart, label: 'Quản Lý Order' },
        { path: '/bep', icon: FiCoffee, label: 'Quản Lý Bếp' },
        { path: '/thanhtoan', icon: FiCreditCard, label: 'Thanh Toán' },
        { path: '/khachhang', icon: FiUserCheck, label: 'Quản Lý Khách Hàng' },
        { path: '/nguoidung', icon: FiUser, label: 'Quản Lý Người Dùng' },
        { path: '/datban', icon: FiCalendar, label: 'Đặt Bàn & Hàng Đợi' },
        { path: '/baocao', icon: FiBarChart2, label: 'Báo Cáo' },
      ];
    }
    
    // Phục vụ: Đón khách, Order, Bàn
    if (chucVu === 'PhucVu') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/donkhach', icon: FiUsers, label: 'Đón Khách' },
        { path: '/order', icon: FiShoppingCart, label: 'Quản Lý Order' },
        { path: '/ban', icon: FiGrid, label: 'Xem Bàn' },
      ];
    }
    
    // Bếp: Chỉ xem và quản lý bếp
    if (chucVu === 'Bep') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/bep', icon: FiCoffee, label: 'Quản Lý Bếp' },
      ];
    }
    
    // Thu ngân: Thanh toán và báo cáo
    if (chucVu === 'ThuNgan') {
      return [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/thanhtoan', icon: FiCreditCard, label: 'Thanh Toán' },
        { path: '/baocao', icon: FiBarChart2, label: 'Báo Cáo' },
      ];
    }
    
    // Mặc định: Tất cả
    return [
      { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
      { path: '/donkhach', icon: FiUsers, label: 'Đón Khách' },
      { path: '/ban', icon: FiGrid, label: 'Quản Lý Bàn' },
      { path: '/admin-menu', icon: FiMenu, label: 'Quản Lý Menu' },
      { path: '/order', icon: FiShoppingCart, label: 'Quản Lý Order' },
      { path: '/bep', icon: FiCoffee, label: 'Quản Lý Bếp' },
      { path: '/thanhtoan', icon: FiCreditCard, label: 'Thanh Toán' },
      { path: '/baocao', icon: FiBarChart2, label: 'Báo Cáo' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-orange-600/20 to-red-600/20">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-xl p-2 shadow-lg border-2 border-orange-400/50">
            <img 
              src="https://thietkekhainguyen.com/wp-content/uploads/2014/06/logo-hinh-tuong-nha-hang.png" 
              alt="Logo Nhà Hàng"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl items-center justify-center hidden">
              <span className="text-2xl">🍽️</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Nhà Hàng
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Hệ thống quản lý</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
            <FiUser className="text-white text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Đăng nhập bởi</p>
            <p className="font-semibold text-sm truncate">{user?.TenNV}</p>
            <p className="text-xs text-gray-500">{user?.ChucVu}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <Icon className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
        >
          <FiLogOut className="text-xl group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
