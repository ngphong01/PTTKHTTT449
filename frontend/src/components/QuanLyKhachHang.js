import React, { useState, useEffect } from 'react';
import { khachHangAPI } from '../api/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit, FiSearch, FiRefreshCw } from 'react-icons/fi';

const QuanLyKhachHang = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await khachHangAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Lỗi tải khách hàng:', error);
      alert('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.TenKH?.toLowerCase().includes(searchLower) ||
      customer.Email?.toLowerCase().includes(searchLower) ||
      customer.SoDienThoai?.includes(searchTerm) ||
      customer.MaKH?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetail = async (maKH) => {
    try {
      const response = await khachHangAPI.getById(maKH);
      setSelectedCustomer(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi tải chi tiết khách hàng:', error);
      alert('Không thể tải thông tin khách hàng');
    }
  };

  const getLoaiKhachColor = (loai) => {
    switch (loai) {
      case 'VIP':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
      case 'ThanThiet':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Thuong':
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getLoaiKhachText = (loai) => {
    switch (loai) {
      case 'VIP':
        return '⭐ VIP';
      case 'ThanThiet':
        return '💎 Thân thiết';
      case 'Thuong':
      default:
        return '👤 Thường';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Quản Lý Khách Hàng</h1>
          <p className="text-gray-600">Xem và quản lý thông tin khách hàng</p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FiRefreshCw className="text-lg" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại, mã khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Tổng khách hàng</p>
          <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Khách VIP</p>
          <p className="text-2xl font-bold text-yellow-600">
            {customers.filter(c => c.LoaiKhach === 'VIP').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Khách thân thiết</p>
          <p className="text-2xl font-bold text-purple-600">
            {customers.filter(c => c.LoaiKhach === 'ThanThiet').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {customers.filter(c => c.TrangThai === 'HoatDong' || !c.TrangThai).length}
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg">
            <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">
              {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.MaKH}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <FiUser className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{customer.TenKH}</h3>
                      <p className="text-white/80 text-xs">Mã: {customer.MaKH}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <FiMail className="text-blue-500 text-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{customer.Email}</p>
                    </div>
                  </div>

                  {customer.SoDienThoai && (
                    <div className="flex items-center space-x-3">
                      <FiPhone className="text-green-500 text-lg" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Số điện thoại</p>
                        <p className="text-sm font-semibold text-gray-800">{customer.SoDienThoai}</p>
                      </div>
                    </div>
                  )}

                  {customer.DiaChi && (
                    <div className="flex items-start space-x-3">
                      <FiMapPin className="text-red-500 text-lg mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Địa chỉ</p>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{customer.DiaChi}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <FiCalendar className="text-purple-500 text-lg" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Ngày đăng ký</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(customer.NgayTao).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLoaiKhachColor(customer.LoaiKhach || 'Thuong')}`}>
                    {getLoaiKhachText(customer.LoaiKhach || 'Thuong')}
                  </span>
                  {customer.DiemTichLuy > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                      🎁 {customer.DiemTichLuy} điểm
                    </span>
                  )}
                </div>

                {/* View Detail Button */}
                <button
                  onClick={() => handleViewDetail(customer.MaKH)}
                  className="w-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-xl hover:from-blue-100 hover:to-purple-100 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiEdit />
                  <span>Xem chi tiết</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Chi tiết khách hàng</h2>
                  <p className="text-white/90 text-sm">Mã: {selectedCustomer.MaKH}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Họ và tên</p>
                  <p className="font-bold text-gray-800">{selectedCustomer.TenKH}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="font-bold text-gray-800">{selectedCustomer.Email}</p>
                </div>
                {selectedCustomer.SoDienThoai && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Số điện thoại</p>
                    <p className="font-bold text-gray-800">{selectedCustomer.SoDienThoai}</p>
                  </div>
                )}
                {selectedCustomer.NgaySinh && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ngày sinh</p>
                    <p className="font-bold text-gray-800">
                      {new Date(selectedCustomer.NgaySinh).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                {selectedCustomer.GioiTinh && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Giới tính</p>
                    <p className="font-bold text-gray-800">
                      {selectedCustomer.GioiTinh === 'Nam' ? 'Nam' : selectedCustomer.GioiTinh === 'Nu' ? 'Nữ' : selectedCustomer.GioiTinh}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Loại khách</p>
                  <p className="font-bold text-gray-800">
                    {getLoaiKhachText(selectedCustomer.LoaiKhach || 'Thuong')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Điểm tích lũy</p>
                  <p className="font-bold text-gray-800">{selectedCustomer.DiemTichLuy || 0} điểm</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ngày đăng ký</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedCustomer.NgayTao).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trạng thái</p>
                  <p className="font-bold text-gray-800">
                    {selectedCustomer.TrangThai === 'HoatDong' || !selectedCustomer.TrangThai ? 'Hoạt động' : selectedCustomer.TrangThai}
                  </p>
                </div>
              </div>

              {selectedCustomer.DiaChi && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Địa chỉ</p>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-semibold text-gray-800">{selectedCustomer.DiaChi}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCustomer(null);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyKhachHang;

