import React, { useState, useEffect } from 'react';
import { menuAPI } from '../api/api';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const QuanLyMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMon, setEditingMon] = useState(null);
  const [filterLoai, setFilterLoai] = useState('');
  const [formData, setFormData] = useState({
    MaMon: '',
    TenMon: '',
    DonGia: '',
    LoaiMon: 'MonChinh',
    MoTa: '',
    HinhAnh: '',
    Tag: '',
  });

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll(filterLoai || undefined);
      setMenu(response.data);
    } catch (error) {
      console.error('Lỗi tải menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLoai]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMon) {
        await menuAPI.update(editingMon.MaMon, formData);
      } else {
        await menuAPI.create(formData);
      }
      fetchMenu();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maMon) => {
    if (window.confirm('Bạn có chắc muốn xóa món này?')) {
      try {
        await menuAPI.delete(maMon);
        fetchMenu();
      } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      MaMon: '',
      TenMon: '',
      DonGia: '',
      LoaiMon: 'MonChinh',
      MoTa: '',
      HinhAnh: '',
      Tag: '',
    });
    setEditingMon(null);
  };

  const getLoaiMonLabel = (loai) => {
    const labels = {
      MonChinh: 'Món chính',
      MonPhu: 'Món phụ',
      DoUong: 'Đồ uống',
    };
    return labels[loai] || loai;
  };

  const filteredMenu = filterLoai
    ? menu.filter((m) => m.LoaiMon === filterLoai)
    : menu;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const getLoaiMonGradient = (loai) => {
    switch (loai) {
      case 'MonChinh':
        return 'from-orange-500 to-red-500';
      case 'MonPhu':
        return 'from-yellow-500 to-amber-500';
      case 'DoUong':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-full">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FiPlus className="text-xl" />
            <span className="font-semibold">Thêm món mới</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <select
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
          className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none bg-white shadow-sm font-semibold text-gray-700"
        >
          <option value="">🍽️ Tất cả loại món</option>
          <option value="MonChinh">🍖 Món chính</option>
          <option value="MonPhu">🥗 Món phụ</option>
          <option value="DoUong">🥤 Đồ uống</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map((m) => (
          <div
            key={m.MaMon}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 relative"
          >
            {/* Hình ảnh món */}
            {m.HinhAnh ? (
              <div className="w-full h-48 overflow-hidden bg-gray-100">
                <img 
                  src={m.HinhAnh} 
                  alt={m.TenMon}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center hidden">
                  <span className="text-gray-400 text-4xl">🍽️</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-6xl">🍽️</span>
              </div>
            )}
            
            <div className="p-6 relative">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getLoaiMonGradient(m.LoaiMon)} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{m.TenMon}</h3>
                  <p className="text-xs text-gray-500 mb-3">Mã: {m.MaMon}</p>
                  <span className={`inline-block px-4 py-1.5 bg-gradient-to-r ${getLoaiMonGradient(m.LoaiMon)} text-white text-xs font-bold rounded-full shadow-md`}>
                    {getLoaiMonLabel(m.LoaiMon)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(m.MaMon)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 ml-2"
                >
                  <FiTrash2 className="text-lg" />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 relative z-10 line-clamp-2">{m.MoTa || 'Chưa có mô tả'}</p>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {new Intl.NumberFormat('vi-VN').format(m.DonGia)} đ
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  m.TrangThaiMon === 'DangBan' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {m.TrangThaiMon === 'DangBan' ? '✓ Đang bán' : '✗ Hết hàng'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  setEditingMon(m);
                  setFormData({
                    MaMon: m.MaMon,
                    TenMon: m.TenMon,
                    DonGia: m.DonGia,
                    LoaiMon: m.LoaiMon,
                    MoTa: m.MoTa || '',
                    TrangThaiMon: m.TrangThaiMon,
                    HinhAnh: m.HinhAnh || '',
                    Tag: m.Tag || '',
                  });
                  setShowModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-3 rounded-xl hover:from-blue-100 hover:to-purple-100 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 relative z-10"
              >
                <FiEdit />
                <span>Sửa thông tin</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white flex-shrink-0">
              <h2 className="text-xl font-bold">
                {editingMon ? 'Cập nhật món' : 'Thêm món mới'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
              {!editingMon && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã món</label>
                  <input
                    type="text"
                    value={formData.MaMon}
                    onChange={(e) =>
                      setFormData({ ...formData, MaMon: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên món</label>
                <input
                  type="text"
                  value={formData.TenMon}
                  onChange={(e) =>
                    setFormData({ ...formData, TenMon: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn giá</label>
                <input
                  type="number"
                  value={formData.DonGia}
                  onChange={(e) =>
                    setFormData({ ...formData, DonGia: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại món</label>
                <select
                  value={formData.LoaiMon}
                  onChange={(e) =>
                    setFormData({ ...formData, LoaiMon: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                >
                  <option value="MonChinh">🍖 Món chính</option>
                  <option value="MonPhu">🥗 Món phụ</option>
                  <option value="DoUong">🥤 Đồ uống</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.MoTa}
                  onChange={(e) =>
                    setFormData({ ...formData, MoTa: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Hình ảnh</label>
                <input
                  type="url"
                  value={formData.HinhAnh}
                  onChange={(e) =>
                    setFormData({ ...formData, HinhAnh: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                />
                {formData.HinhAnh && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    <img 
                      src={formData.HinhAnh} 
                      alt="Preview" 
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tag (Signature Dish, Best Seller, New Menu)</label>
                <select
                  value={formData.Tag || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, Tag: e.target.value || '' })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                >
                  <option value="">Không có tag</option>
                  <option value="SignatureDish">⭐ Signature Dish</option>
                  <option value="BestSeller">🔥 Best Seller</option>
                  <option value="NewMenu">✨ New Menu</option>
                </select>
              </div>
              {editingMon && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={formData.TrangThaiMon}
                    onChange={(e) =>
                      setFormData({ ...formData, TrangThaiMon: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                  >
                    <option value="DangBan">✓ Đang bán</option>
                    <option value="HetHang">✗ Hết hàng</option>
                  </select>
                </div>
              )}
              <div className="flex space-x-3 pt-3 flex-shrink-0">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {editingMon ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
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

export default QuanLyMenu;

