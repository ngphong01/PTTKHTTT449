import React, { useState, useEffect } from 'react';
import { banAPI, orderAPI, menuAPI } from '../api/api';
import { FiShoppingCart, FiCheck, FiX, FiPlus, FiMinus } from 'react-icons/fi';

const DonKhach = ({ user }) => {
  const [ban, setBan] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedBan, setSelectedBan] = useState(null);
  const [chiTietOrder, setChiTietOrder] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [banRes, menuRes] = await Promise.all([
        banAPI.getAll(),
        menuAPI.getAll(),
      ]);
      setBan(banRes.data);
      setMenu(menuRes.data.filter((m) => m.TrangThaiMon === 'DangBan'));
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chọn bàn cho khách mới
  const handleChonBan = async (banItem) => {
    if (banItem.TrangThai !== 'Trong') {
      alert('Bàn này đang được sử dụng!');
      return;
    }

    // Cập nhật trạng thái bàn thành "Đang phục vụ"
    try {
      await banAPI.updateTrangThai(banItem.MaBan, 'DangPhucVu');
      setSelectedBan(banItem);
      setChiTietOrder([]);
      await fetchData();
    } catch (error) {
      console.error('Lỗi cập nhật bàn:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  // Thêm món vào order
  const handleAddMon = (mon) => {
    const existing = chiTietOrder.find((ct) => ct.MaMon === mon.MaMon);
    if (existing) {
      setChiTietOrder(
        chiTietOrder.map((ct) =>
          ct.MaMon === mon.MaMon
            ? { ...ct, SoLuong: ct.SoLuong + 1 }
            : ct
        )
      );
    } else {
      setChiTietOrder([
        ...chiTietOrder,
        {
          MaMon: mon.MaMon,
          TenMon: mon.TenMon,
          DonGia: mon.DonGia,
          SoLuong: 1,
          LoaiMon: mon.LoaiMon,
          HinhAnh: mon.HinhAnh,
        },
      ]);
    }
  };

  // Xóa món khỏi order
  const handleRemoveMon = (maMon) => {
    setChiTietOrder(chiTietOrder.filter((ct) => ct.MaMon !== maMon));
  };

  // Cập nhật số lượng
  const handleUpdateSoLuong = (maMon, soLuong) => {
    if (soLuong <= 0) {
      handleRemoveMon(maMon);
      return;
    }
    setChiTietOrder(
      chiTietOrder.map((ct) =>
        ct.MaMon === maMon ? { ...ct, SoLuong: soLuong } : ct
      )
    );
  };

  // Tạo order
  const handleTaoOrder = async () => {
    if (!selectedBan || chiTietOrder.length === 0) {
      alert('Vui lòng chọn bàn và thêm món!');
      return;
    }

    try {
      await orderAPI.create({
        MaBan: selectedBan.MaBan,
        MaNV: user.MaNV,
        chiTiet: chiTietOrder.map((ct) => ({
          MaMon: ct.MaMon,
          SoLuong: ct.SoLuong,
          DonGia: ct.DonGia,
        })),
      });

      alert(`Đã tạo order thành công! Bạn (${user.TenNV}) đang phục vụ bàn ${selectedBan.TenBan}.`);
      setSelectedBan(null);
      setChiTietOrder([]);
      await fetchData();
    } catch (error) {
      console.error('Lỗi tạo order:', error);
      alert('Có lỗi xảy ra khi tạo order!');
    }
  };

  // Hủy chọn bàn
  const handleHuyChonBan = async () => {
    if (selectedBan && chiTietOrder.length === 0) {
      // Nếu chưa có order, trả bàn về trạng thái "Trống"
      try {
        await banAPI.updateTrangThai(selectedBan.MaBan, 'Trong');
        setSelectedBan(null);
        await fetchData();
      } catch (error) {
        console.error('Lỗi:', error);
      }
    } else {
      setSelectedBan(null);
      setChiTietOrder([]);
    }
  };

  const getTrangThaiColor = (trangThai) => {
    switch (trangThai) {
      case 'Trong':
        return 'bg-green-500 hover:bg-green-600';
      case 'DangPhucVu':
        return 'bg-yellow-500';
      case 'ChoThanhToan':
        return 'bg-blue-500';
      case 'DaDat':
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case 'Trong':
        return 'Trống';
      case 'DangPhucVu':
        return 'Đang phục vụ';
      case 'ChoThanhToan':
        return 'Chờ thanh toán';
      case 'DaDat':
        return 'Đã đặt';
      default:
        return trangThai;
    }
  };

  const filteredMenu = selectedCategory === 'All' 
    ? menu 
    : menu.filter(m => m.LoaiMon === selectedCategory);

  const tongTien = chiTietOrder.reduce((sum, ct) => sum + (ct.DonGia * ct.SoLuong), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">👋 Đón Khách</h1>
            <p className="text-gray-600">Chọn bàn và tạo order cho khách hàng mới</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Bạn đang đăng nhập:</div>
            <div className="flex items-center space-x-2">
              {user?.HinhAnh ? (
                <img
                  src={user.HinhAnh}
                  alt={user.TenNV}
                  className="w-8 h-8 rounded-full border-2 border-green-400"
                  onError={(e) => e.target.style.display = 'none'}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.TenNV?.charAt(0) || 'N'}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-800 text-sm">{user?.TenNV}</div>
                <div className="text-xs text-gray-500">{user?.ChucVu}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bên trái: Sơ đồ bàn */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Sơ đồ bàn</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Trống</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Đang phục vụ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Chờ thanh toán</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ban.map((b) => (
                <button
                  key={b.MaBan}
                  onClick={() => handleChonBan(b)}
                  disabled={b.TrangThai !== 'Trong' || (selectedBan && selectedBan.MaBan !== b.MaBan)}
                  className={`p-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 ${
                    selectedBan?.MaBan === b.MaBan
                      ? 'ring-4 ring-blue-500 scale-105'
                      : b.TrangThai === 'Trong'
                      ? 'hover:shadow-lg cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  } ${getTrangThaiColor(b.TrangThai)} text-white relative`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🪑</div>
                    <div className="font-bold text-lg">{b.TenBan}</div>
                    <div className="text-xs mt-1 opacity-90">{getTrangThaiText(b.TrangThai)}</div>
                    <div className="text-xs mt-1">{b.SoGhe} ghế</div>
                    
                    {/* Hiển thị nhân viên đang phục vụ */}
                    {b.TenNhanVien && b.TrangThai !== 'Trong' && (
                      <div className="mt-2 pt-2 border-t border-white/30">
                        <div className="text-xs opacity-90 mb-1">Nhân viên:</div>
                        <div className="flex items-center justify-center space-x-1">
                          {b.HinhAnhNV ? (
                            <img
                              src={b.HinhAnhNV}
                              alt={b.TenNhanVien}
                              className="w-5 h-5 rounded-full border border-white/50"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : null}
                          <div className="text-xs font-semibold truncate max-w-[80px]">
                            {b.TenNhanVien}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order hiện tại */}
          {selectedBan && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Order cho {selectedBan.TenBan}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">Nhân viên phục vụ:</span>
                    {user?.HinhAnh ? (
                      <img
                        src={user.HinhAnh}
                        alt={user.TenNV}
                        className="w-5 h-5 rounded-full border border-gray-300"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.TenNV?.charAt(0) || 'N'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-gray-700">{user?.TenNV}</span>
                  </div>
                </div>
                <button
                  onClick={handleHuyChonBan}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                >
                  <FiX />
                  <span>Hủy</span>
                </button>
              </div>

              {chiTietOrder.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiShoppingCart className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>Chưa có món nào. Click "Thêm món" để bắt đầu!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chiTietOrder.map((ct) => (
                    <div
                      key={ct.MaMon}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {ct.HinhAnh && (
                          <img
                            src={ct.HinhAnh}
                            alt={ct.TenMon}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{ct.TenMon}</p>
                          <p className="text-sm text-gray-600">
                            {new Intl.NumberFormat('vi-VN').format(ct.DonGia)} đ
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateSoLuong(ct.MaMon, ct.SoLuong - 1)}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                        >
                          <FiMinus className="text-sm" />
                        </button>
                        <span className="w-8 text-center font-bold">{ct.SoLuong}</span>
                        <button
                          onClick={() => handleUpdateSoLuong(ct.MaMon, ct.SoLuong + 1)}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
                        >
                          <FiPlus className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleRemoveMon(ct.MaMon)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tổng tiền:</span>
                      <span className="font-bold text-xl text-blue-600">
                        {new Intl.NumberFormat('vi-VN').format(tongTien)} đ
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => setShowMenuModal(true)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FiPlus className="inline mr-2" />
                      Thêm món
                    </button>
                    <button
                      onClick={handleTaoOrder}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <FiCheck />
                      <span>Tạo Order</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bên phải: Thống kê */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bàn trống:</span>
                <span className="font-bold text-green-600">
                  {ban.filter((b) => b.TrangThai === 'Trong').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang phục vụ:</span>
                <span className="font-bold text-yellow-600">
                  {ban.filter((b) => b.TrangThai === 'DangPhucVu').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chờ thanh toán:</span>
                <span className="font-bold text-blue-600">
                  {ban.filter((b) => b.TrangThai === 'ChoThanhToan').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chọn món */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">Chọn món</h2>
              <button
                onClick={() => setShowMenuModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="flex space-x-2 overflow-x-auto">
                {['All', 'MonChinh', 'MonPhu', 'DoUong'].map((loai) => (
                  <button
                    key={loai}
                    onClick={() => setSelectedCategory(loai)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === loai
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {loai === 'All' ? 'Tất cả' : loai === 'MonChinh' ? 'Món chính' : loai === 'MonPhu' ? 'Món phụ' : 'Đồ uống'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenu.map((mon) => (
                  <button
                    key={mon.MaMon}
                    onClick={() => {
                      handleAddMon(mon);
                      setShowMenuModal(false);
                    }}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
                  >
                    {mon.HinhAnh && (
                      <img
                        src={mon.HinhAnh}
                        alt={mon.TenMon}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <p className="font-semibold text-gray-800 mb-1">{mon.TenMon}</p>
                    <p className="text-green-600 font-bold">
                      {new Intl.NumberFormat('vi-VN').format(mon.DonGia)} đ
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonKhach;

