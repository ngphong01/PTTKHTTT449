import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import NotificationCenter from './NotificationCenter';

const Header = ({ user }) => {
  const location = useLocation();
  
  const getPageInfo = () => {
    const routes = {
      '/': { title: 'Dashboard', subtitle: 'Tổng quan hệ thống' },
      '/donkhach': { title: 'Đón Khách', subtitle: 'Quản lý bàn và tạo order nhanh' },
      '/ban': { title: 'Quản Lý Bàn', subtitle: 'Theo dõi và quản lý bàn ăn' },
      '/menu': { title: 'Quản Lý Menu', subtitle: 'Quản lý thực đơn và món ăn' },
      '/order': { title: 'Quản Lý Order', subtitle: 'Tạo và quản lý đơn hàng' },
      '/bep': { title: 'Quản Lý Bếp', subtitle: 'Theo dõi trạng thái chế biến' },
      '/thanhtoan': { title: 'Thanh Toán', subtitle: 'Xử lý thanh toán đơn hàng' },
      '/khachhang': { title: 'Quản Lý Khách Hàng', subtitle: 'Xem và quản lý thông tin khách hàng' },
      '/datban': { title: 'Đặt Bàn & Hàng Đợi', subtitle: 'Quản lý đặt bàn và danh sách hàng đợi' },
      '/baocao': { title: 'Báo Cáo', subtitle: 'Thống kê và báo cáo doanh thu' },
    };
    return routes[location.pathname] || { title: 'Dashboard', subtitle: 'Hệ thống quản lý nhà hàng' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-xl p-2 shadow-lg border-2 border-red-300/50 hover:border-red-400 transition-all duration-200">
              <img 
                src="https://thietkekhainguyen.com/wp-content/uploads/2014/06/logo-hinh-tuong-nha-hang.png" 
                alt="Logo Nhà Hàng"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-amber-600 rounded-xl items-center justify-center hidden">
                <span className="text-xl">🍽️</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                {pageInfo.title}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{pageInfo.subtitle}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-2.5 border border-gray-200 hover:border-orange-300 transition-all duration-200">
            <FiSearch className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none outline-none text-sm text-gray-600 w-48 placeholder-gray-400"
            />
          </div>
          
                 <NotificationCenter user={user} />
          
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            {user?.HinhAnh ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-400 shadow-lg hover:shadow-xl transition-all duration-200">
                <img 
                  src={user.HinhAnh} 
                  alt={user.TenNV}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-base hidden">
                  {user.TenNV?.charAt(0) || 'U'}
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-base shadow-lg">
                {user?.TenNV?.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{user?.TenNV}</p>
              <p className="text-xs text-gray-500">{user?.ChucVu}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

