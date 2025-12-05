import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit2, FiLock, FiPackage, FiStar } from 'react-icons/fi';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { khachHangAPI } from '../api/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    TenKH: '',
    SoDienThoai: '',
    DiaChi: '',
    NgaySinh: '',
    GioiTinh: ''
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    MatKhauCu: '',
    MatKhauMoi: '',
    XacNhanMatKhau: ''
  });

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const savedUser = localStorage.getItem('customer');
      if (!savedUser) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(savedUser);
      const response = await khachHangAPI.getById(userData.MaKH);
      setUser(response.data);
      setFormData({
        TenKH: response.data.TenKH || '',
        SoDienThoai: response.data.SoDienThoai || '',
        DiaChi: response.data.DiaChi || '',
        NgaySinh: response.data.NgaySinh || '',
        GioiTinh: response.data.GioiTinh || ''
      });

      // Load order history
      if (userData.MaKH) {
        try {
          const historyRes = await khachHangAPI.getOrderHistory(userData.MaKH);
          console.log('Order history response:', historyRes);
          setOrderHistory(historyRes.data || []);
        } catch (historyError) {
          console.error('Lỗi tải lịch sử đơn hàng:', historyError);
          setOrderHistory([]);
        }
      } else {
        console.warn('Không có MaKH, không thể tải lịch sử đơn hàng');
        setOrderHistory([]);
      }
    } catch (error) {
      console.error('Lỗi tải thông tin:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn bị dữ liệu để gửi (chỉ gửi các trường có giá trị hoặc cần cập nhật)
      const updateData = {
        TenKH: formData.TenKH || user.TenKH,
        SoDienThoai: formData.SoDienThoai || null,
        DiaChi: formData.DiaChi || null,
      };

      // Chỉ thêm NgaySinh và GioiTinh nếu có giá trị
      if (formData.NgaySinh) {
        updateData.NgaySinh = formData.NgaySinh;
      }
      if (formData.GioiTinh) {
        updateData.GioiTinh = formData.GioiTinh;
      }

      await khachHangAPI.update(user.MaKH, updateData);
      
      // Reload lại dữ liệu từ server để đảm bảo có dữ liệu mới nhất
      const updatedResponse = await khachHangAPI.getById(user.MaKH);
      const updatedUser = updatedResponse.data;
      
      setUser(updatedUser);
      localStorage.setItem('customer', JSON.stringify(updatedUser));
      
      // Cập nhật lại formData với dữ liệu mới
      setFormData({
        TenKH: updatedUser.TenKH || '',
        SoDienThoai: updatedUser.SoDienThoai || '',
        DiaChi: updatedUser.DiaChi || '',
        NgaySinh: updatedUser.NgaySinh || '',
        GioiTinh: updatedUser.GioiTinh || ''
      });
      
      setEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.MatKhauMoi !== passwordData.XacNhanMatKhau) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.MatKhauMoi.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await khachHangAPI.changePassword(user.MaKH, {
        MatKhauCu: passwordData.MatKhauCu,
        MatKhauMoi: passwordData.MatKhauMoi
      });
      alert('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setPasswordData({ MatKhauCu: '', MatKhauMoi: '', XacNhanMatKhau: '' });
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ChoCheBien': 'Chờ chế biến',
      'DangCheBien': 'Đang chế biến',
      'DaCheBien': 'Đã chế biến xong',
      'SanSang': 'Sẵn sàng phục vụ',
      'ChoThanhToan': 'Chờ thanh toán',
      'DaThanhToan': 'Đã hoàn tất',
      'Huy': 'Đã hủy'
    };
    return labels[status] || status || 'Không xác định';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <CustomerHeader />
      
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Tài khoản của tôi</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FiEdit2 />
                      <span>Sửa</span>
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <FiUser className="inline mr-2 text-orange-600" />
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={formData.TenKH}
                        onChange={(e) => setFormData({ ...formData, TenKH: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <FiMail className="inline mr-2 text-orange-600" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.Email}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <FiPhone className="inline mr-2 text-orange-600" />
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={formData.SoDienThoai}
                        onChange={(e) => setFormData({ ...formData, SoDienThoai: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <FiMapPin className="inline mr-2 text-orange-600" />
                        Địa chỉ
                      </label>
                      <textarea
                        value={formData.DiaChi}
                        onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <FiCalendar className="inline mr-2 text-orange-600" />
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={formData.NgaySinh}
                          onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Giới tính
                        </label>
                        <select
                          value={formData.GioiTinh}
                          onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nu">Nữ</option>
                          <option value="Khac">Khác</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            TenKH: user.TenKH || '',
                            SoDienThoai: user.SoDienThoai || '',
                            DiaChi: user.DiaChi || '',
                            NgaySinh: user.NgaySinh || '',
                            GioiTinh: user.GioiTinh || ''
                          });
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <FiUser className="text-2xl text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Họ và tên</p>
                        <p className="font-bold text-lg">{user.TenKH}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <FiMail className="text-2xl text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-bold text-lg">{user.Email}</p>
                      </div>
                    </div>
                    {user.SoDienThoai && (
                      <div className="flex items-center space-x-4">
                        <FiPhone className="text-2xl text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="font-bold text-lg">{user.SoDienThoai}</p>
                        </div>
                      </div>
                    )}
                    {user.DiaChi && (
                      <div className="flex items-center space-x-4">
                        <FiMapPin className="text-2xl text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Địa chỉ</p>
                          <p className="font-bold text-lg">{user.DiaChi}</p>
                        </div>
                      </div>
                    )}
                    {user.NgaySinh && (
                      <div className="flex items-center space-x-4">
                        <FiCalendar className="text-2xl text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Ngày sinh</p>
                          <p className="font-bold text-lg">
                            {new Date(user.NgaySinh).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    )}
                    {user.GioiTinh && (
                      <div className="flex items-center space-x-4">
                        <FiUser className="text-2xl text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Giới tính</p>
                          <p className="font-bold text-lg">{user.GioiTinh}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <h2 className="text-2xl font-bold">Đổi mật khẩu</h2>
                </div>
                {!showChangePassword ? (
                  <div className="p-6">
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <FiLock />
                      <span>Đổi mật khẩu</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Mật khẩu cũ
                      </label>
                      <input
                        type="password"
                        value={passwordData.MatKhauCu}
                        onChange={(e) => setPasswordData({ ...passwordData, MatKhauCu: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.MatKhauMoi}
                        onChange={(e) => setPasswordData({ ...passwordData, MatKhauMoi: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.XacNhanMatKhau}
                        onChange={(e) => setPasswordData({ ...passwordData, XacNhanMatKhau: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                      >
                        Xác nhận
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({ MatKhauCu: '', MatKhauMoi: '', XacNhanMatKhau: '' });
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Points & Status */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl shadow-2xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <FiStar className="text-3xl" />
                  <div>
                    <p className="text-sm opacity-90">Điểm tích lũy</p>
                    <p className="text-3xl font-bold">{user.DiemTichLuy || 0} điểm</p>
                  </div>
                </div>
                <div className="border-t border-white/30 pt-4">
                  <p className="text-sm opacity-90">Loại khách hàng</p>
                  <p className="text-xl font-bold">
                    {user.LoaiKhach === 'VIP' ? '⭐ VIP' : 'Thường'}
                  </p>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <h2 className="text-2xl font-bold flex items-center space-x-2">
                    <FiPackage />
                    <span>Lịch sử đơn hàng</span>
                  </h2>
                </div>
                <div className="p-6">
                  {orderHistory.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">Chưa có đơn hàng nào</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {orderHistory.map((order) => (
                        <div
                          key={order.MaOrder}
                          className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors cursor-pointer"
                          onClick={() => navigate(`/theo-doi-don-hang/${order.MaOrder}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-gray-800">#{order.MaOrder}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.TrangThai === 'DaThanhToan' ? 'bg-green-100 text-green-800' :
                              order.TrangThai === 'SanSang' ? 'bg-blue-100 text-blue-800' :
                              order.TrangThai === 'ChoThanhToan' ? 'bg-orange-100 text-orange-800' :
                              order.TrangThai === 'Huy' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getStatusLabel(order.TrangThai)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {order.ThoiGian ? new Date(order.ThoiGian).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">Bàn: {order.TenBan || 'N/A'}</p>
                          <p className="font-bold text-orange-600">
                            {new Intl.NumberFormat('vi-VN').format(order.TongTien || 0)} đ
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default UserProfile;

