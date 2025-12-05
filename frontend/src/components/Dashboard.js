import React, { useState, useEffect } from 'react';
import { banAPI, baoCaoAPI } from '../api/api';
import { FiGrid, FiShoppingCart, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    tongBan: 0,
    banTrong: 0,
    banDangPhucVu: 0,
    doanhThuNgay: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [banRes, doanhThuRes] = await Promise.all([
        banAPI.getAll(),
        baoCaoAPI.doanhThuNgay(),
      ]);

      const ban = banRes.data;
      const banTrong = ban.filter((b) => b.TrangThai === 'Trong').length;
      const banDangPhucVu = ban.filter((b) => b.TrangThai === 'DangPhucVu').length;

      setStats({
        tongBan: ban.length,
        banTrong,
        banDangPhucVu,
        doanhThuNgay: doanhThuRes.data?.TongDoanhThu || 0,
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng số bàn',
      value: stats.tongBan,
      icon: FiGrid,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Bàn trống',
      value: stats.banTrong,
      icon: FiUsers,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Bàn đang phục vụ',
      value: stats.banDangPhucVu,
      icon: FiShoppingCart,
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Doanh thu hôm nay',
      value: new Intl.NumberFormat('vi-VN').format(stats.doanhThuNgay) + ' đ',
      icon: FiDollarSign,
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="p-6 md:p-8 min-h-full">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <Icon className="text-2xl text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full ${stat.bgColor} ${stat.textColor} text-xs font-semibold`}>
                  <FiTrendingUp className="inline mr-1" />
                  Live
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${stat.textColor} mb-1`}>{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-xl shadow-lg">
            <span className="text-3xl">👋</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Chào mừng, {user?.TenNV}!</h2>
            <p className="text-gray-600 mt-1">
              Chức vụ: <span className="font-semibold text-blue-600">{user?.ChucVu}</span>
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500">
          {user?.ChucVu === 'PhucVu' ? (
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Quy trình làm việc của bạn:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Khách đến → Vào màn hình <strong>"Đón Khách"</strong> → Chọn bàn trống</li>
                <li>Thêm món vào order → Click "Tạo Order"</li>
                <li>Bếp sẽ nhận order và chế biến món</li>
                <li>Khi khách ăn xong → Thu ngân sẽ thanh toán</li>
                <li>Bàn tự động chuyển về trạng thái "Trống"</li>
              </ol>
            </div>
          ) : user?.ChucVu === 'Bep' ? (
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Quy trình làm việc của bạn:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Vào màn hình <strong>"Quản Lý Bếp"</strong> để xem các order cần chế biến</li>
                <li>Click "Bắt đầu chế biến" khi bắt đầu làm món</li>
                <li>Click "Hoàn thành" khi món đã xong</li>
                <li>Nhân viên phục vụ sẽ mang món ra cho khách</li>
              </ol>
            </div>
          ) : user?.ChucVu === 'ThuNgan' ? (
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Quy trình làm việc của bạn:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Vào màn hình <strong>"Thanh Toán"</strong> để xem các order chờ thanh toán</li>
                <li>Chọn order cần thanh toán</li>
                <li>Nhập giảm giá (nếu có) và chọn hình thức thanh toán</li>
                <li>Click "Thanh toán" → Hóa đơn được tạo và bàn tự động chuyển về "Trống"</li>
              </ol>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              Hệ thống quản lý nhà hàng giúp bạn quản lý bàn ăn, menu, order và báo cáo doanh thu một cách hiệu quả. 
              Tất cả các tính năng đã được tối ưu hóa để mang lại trải nghiệm tốt nhất.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
