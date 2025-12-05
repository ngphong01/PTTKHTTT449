import React, { useState, useEffect } from 'react';
import { khachHangAPI } from '../api/api';
import { FiPlus, FiEdit, FiEye, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';

const QuanLyNguoiDung = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    TenKH: '',
    TaiKhoan: '',
    Email: '',
    MatKhau: '',
    SoDienThoai: '',
    DiaChi: '',
    NgaySinh: '',
    GioiTinh: '',
    LoaiKhach: 'Thuong',
    TrangThai: 'HoatDong'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await khachHangAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi tải danh sách người dùng:', error);
      alert('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.TenKH?.toLowerCase().includes(searchLower) ||
      user.Email?.toLowerCase().includes(searchLower) ||
      user.SoDienThoai?.includes(searchTerm) ||
      user.TaiKhoan?.toLowerCase().includes(searchLower) ||
      user.MaKH?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      TenKH: '',
      TaiKhoan: '',
      Email: '',
      MatKhau: '',
      SoDienThoai: '',
      DiaChi: '',
      NgaySinh: '',
      GioiTinh: '',
      LoaiKhach: 'Thuong',
      TrangThai: 'HoatDong'
    });
    setShowModal(true);
  };

  const handleEdit = async (maKH) => {
    try {
      const response = await khachHangAPI.getById(maKH);
      const user = response.data;
      setEditingUser(user);
      setFormData({
        TenKH: user.TenKH || '',
        TaiKhoan: user.TaiKhoan || '',
        Email: user.Email || '',
        MatKhau: '', // Không hiển thị mật khẩu cũ
        SoDienThoai: user.SoDienThoai || '',
        DiaChi: user.DiaChi || '',
        NgaySinh: user.NgaySinh ? user.NgaySinh.split('T')[0] : '',
        GioiTinh: user.GioiTinh || '',
        LoaiKhach: user.LoaiKhach || 'Thuong',
        TrangThai: user.TrangThai || 'HoatDong'
      });
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi tải thông tin người dùng:', error);
      alert('Không thể tải thông tin người dùng');
    }
  };

  const handleDetails = async (maKH) => {
    try {
      const response = await khachHangAPI.getById(maKH);
      setSelectedUser(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi tải chi tiết người dùng:', error);
      alert('Không thể tải chi tiết người dùng');
    }
  };

  const handleDelete = async (maKH) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        // Cập nhật trạng thái thành "Khoa" thay vì xóa
        await khachHangAPI.update(maKH, { TrangThai: 'Khoa' });
        alert('Đã khóa tài khoản người dùng');
        fetchUsers();
      } catch (error) {
        console.error('Lỗi xóa người dùng:', error);
        alert('Không thể xóa người dùng');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Cập nhật
        const updateData = { ...formData };
        if (!updateData.MatKhau) {
          delete updateData.MatKhau; // Không cập nhật mật khẩu nếu để trống
        }
        await khachHangAPI.update(editingUser.MaKH, updateData);
        alert('Cập nhật người dùng thành công!');
      } else {
        // Tạo mới - cần API đăng ký
        if (!formData.MatKhau) {
          alert('Vui lòng nhập mật khẩu');
          return;
        }
        await khachHangAPI.register({
          TenKH: formData.TenKH,
          TaiKhoan: formData.TaiKhoan || formData.Email,
          Email: formData.Email,
          MatKhau: formData.MatKhau,
          SoDienThoai: formData.SoDienThoai,
          DiaChi: formData.DiaChi,
          NgaySinh: formData.NgaySinh || null,
          GioiTinh: formData.GioiTinh || null
        });
        alert('Tạo người dùng mới thành công!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi:', error);
      alert(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getVaiTroText = (loaiKhach) => {
    switch (loaiKhach) {
      case 'VIP':
        return 'VIP';
      case 'ThanThiet':
        return 'Thân thiết';
      case 'Thuong':
      default:
        return 'Thường';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Người Dùng</h1>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
              title="Làm mới"
            >
              <FiRefreshCw className="text-xl" />
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <FiPlus className="text-lg" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tên Người Dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mật Khẩu
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Số Điện Thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Địa Chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vai Trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ngày Tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.MaKH} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.TenKH || user.TaiKhoan || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.Email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {user.MatKhau ? (user.MatKhau.length > 20 ? '•••••••• (đã mã hóa)' : '••••••••') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.SoDienThoai || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {user.DiaChi || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getVaiTroText(user.LoaiKhach)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(user.NgayTao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user.MaKH)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDetails(user.MaKH)}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          Details
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(user.MaKH)}
                          className="text-red-600 hover:text-red-800 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Người Dùng *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.TenKH}
                    onChange={(e) => setFormData({ ...formData, TenKH: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tài Khoản
                  </label>
                  <input
                    type="text"
                    value={formData.TaiKhoan}
                    onChange={(e) => setFormData({ ...formData, TaiKhoan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Để trống sẽ dùng Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật Khẩu {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.MatKhau}
                    onChange={(e) => setFormData({ ...formData, MatKhau: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={editingUser ? 'Để trống nếu không đổi' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.SoDienThoai}
                    onChange={(e) => setFormData({ ...formData, SoDienThoai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    value={formData.NgaySinh}
                    onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới Tính
                  </label>
                  <select
                    value={formData.GioiTinh}
                    onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nu">Nữ</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Khách
                  </label>
                  <select
                    value={formData.LoaiKhach}
                    onChange={(e) => setFormData({ ...formData, LoaiKhach: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Thuong">Thường</option>
                    <option value="ThanThiet">Thân thiết</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa Chỉ
                </label>
                <textarea
                  value={formData.DiaChi}
                  onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingUser ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Chi Tiết Người Dùng</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mã Khách Hàng</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.MaKH}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tên Người Dùng</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.TenKH || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tài Khoản</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.TaiKhoan || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.Email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Số Điện Thoại</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.SoDienThoai || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày Sinh</label>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedUser.NgaySinh ? new Date(selectedUser.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Giới Tính</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.GioiTinh || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Loại Khách</label>
                  <p className="text-sm font-semibold text-gray-800">{getVaiTroText(selectedUser.LoaiKhach)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Điểm Tích Lũy</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.DiemTichLuy || 0} điểm</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Trạng Thái</label>
                  <p className="text-sm font-semibold text-gray-800">
                    {selectedUser.TrangThai === 'HoatDong' || !selectedUser.TrangThai ? 'Hoạt động' : selectedUser.TrangThai}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày Tạo</label>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(selectedUser.NgayTao)}</p>
                </div>
              </div>
              {selectedUser.DiaChi && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Địa Chỉ</label>
                  <p className="text-sm font-semibold text-gray-800">{selectedUser.DiaChi}</p>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyNguoiDung;

