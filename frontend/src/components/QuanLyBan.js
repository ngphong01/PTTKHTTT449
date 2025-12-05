import React, { useState, useEffect } from 'react';
import { banAPI } from '../api/api';
import { FiPlus, FiEdit, FiTrash2, FiGrid } from 'react-icons/fi';

const QuanLyBan = () => {
  const [ban, setBan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBan, setEditingBan] = useState(null);
  const [formData, setFormData] = useState({
    MaBan: '',
    TenBan: '',
    SoGhe: 4,
    ViTri: '',
  });

  useEffect(() => {
    fetchBan();
  }, []);

  const fetchBan = async () => {
    try {
      const response = await banAPI.getAll();
      setBan(response.data);
    } catch (error) {
      console.error('Lỗi tải bàn:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBan) {
        await banAPI.update(editingBan.MaBan, formData);
      } else {
        await banAPI.create(formData);
      }
      fetchBan();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maBan) => {
    if (window.confirm('Bạn có chắc muốn xóa bàn này?')) {
      try {
        await banAPI.delete(maBan);
        fetchBan();
      } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra');
      }
    }
  };

  const resetForm = () => {
    setFormData({ MaBan: '', TenBan: '', SoGhe: 4, ViTri: '' });
    setEditingBan(null);
  };

  const getTrangThaiColor = (trangThai) => {
    switch (trangThai) {
      case 'Trong':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'DangPhucVu':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'ChoThanhToan':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'DaDat':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FiPlus className="text-xl" />
            <span className="font-semibold">Thêm bàn mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ban.map((b) => (
          <div
            key={b.MaBan}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
                  <FiGrid className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{b.TenBan}</h3>
                  <p className="text-xs text-gray-500">Mã: {b.MaBan}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(b.MaBan)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
              >
                <FiTrash2 />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Số ghế:</span>
                <span className="font-semibold text-gray-800">{b.SoGhe} người</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vị trí:</span>
                <span className="font-semibold text-gray-800">{b.ViTri || 'Chưa có'}</span>
              </div>
              
              {/* Hiển thị nhân viên đang phục vụ */}
              {b.TenNhanVien && b.TrangThai !== 'Trong' && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Nhân viên:</span>
                  <div className="flex items-center space-x-2">
                    {b.HinhAnhNV ? (
                      <img
                        src={b.HinhAnhNV}
                        alt={b.TenNhanVien}
                        className="w-6 h-6 rounded-full border-2 border-blue-300"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {b.TenNhanVien?.charAt(0) || 'N'}
                      </div>
                    )}
                    <span className="font-semibold text-gray-800 text-sm">{b.TenNhanVien}</span>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <span
                  className={`inline-block px-4 py-2 rounded-xl text-xs font-bold shadow-md ${getTrangThaiColor(
                    b.TrangThai
                  )}`}
                >
                  {b.TrangThai}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingBan(b);
                setFormData({ ...b, TrangThai: b.TrangThai });
                setShowModal(true);
              }}
              className="w-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-xl hover:from-blue-100 hover:to-purple-100 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FiEdit />
              <span>Sửa</span>
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">
                {editingBan ? 'Cập nhật bàn' : 'Thêm bàn mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingBan && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mã bàn</label>
                    <input
                      type="text"
                      value={formData.MaBan}
                      onChange={(e) =>
                        setFormData({ ...formData, MaBan: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tên bàn</label>
                    <input
                      type="text"
                      value={formData.TenBan}
                      onChange={(e) =>
                        setFormData({ ...formData, TenBan: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số ghế</label>
                    <input
                      type="number"
                      value={formData.SoGhe}
                      onChange={(e) =>
                        setFormData({ ...formData, SoGhe: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
                    <input
                      type="text"
                      value={formData.ViTri}
                      onChange={(e) =>
                        setFormData({ ...formData, ViTri: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                </>
              )}
              {editingBan && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tên bàn</label>
                    <input
                      type="text"
                      value={formData.TenBan}
                      onChange={(e) =>
                        setFormData({ ...formData, TenBan: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số ghế</label>
                    <input
                      type="number"
                      value={formData.SoGhe}
                      onChange={(e) =>
                        setFormData({ ...formData, SoGhe: parseInt(e.target.value) })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
                    <input
                      type="text"
                      value={formData.ViTri}
                      onChange={(e) =>
                        setFormData({ ...formData, ViTri: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={formData.TrangThai}
                      onChange={(e) =>
                        setFormData({ ...formData, TrangThai: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                    >
                      <option value="Trong">Trống</option>
                      <option value="DaDat">Đã đặt</option>
                      <option value="DangPhucVu">Đang phục vụ</option>
                      <option value="ChoThanhToan">Chờ thanh toán</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {editingBan ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyBan;
