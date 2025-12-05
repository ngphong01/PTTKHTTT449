import React, { useState, useEffect } from 'react';
import { orderAPI, hoaDonAPI } from '../api/api';
import { FiDollarSign } from 'react-icons/fi';

const ThanhToan = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [giamGia, setGiamGia] = useState(0);
  const [hinhThucTT, setHinhThucTT] = useState('TienMat');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll({ trangThai: 'ChoThanhToan' });
      const ordersData = await Promise.all(
        response.data.map(async (order) => {
          const detailRes = await orderAPI.getById(order.MaOrder);
          return detailRes.data;
        })
      );
      setOrders(ordersData);
    } catch (error) {
      console.error('Lỗi tải orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThanhToan = async () => {
    if (!selectedOrder) {
      alert('Vui lòng chọn order');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    try {
      await hoaDonAPI.create({
        MaOrder: selectedOrder.MaOrder,
        MaNV: user.MaNV,
        GiamGia: giamGia,
        HinhThucTT: hinhThucTT,
      });
      alert('Thanh toán thành công!');
      fetchOrders();
      setSelectedOrder(null);
      setGiamGia(0);
      setHinhThucTT('TienMat');
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const tongTien = selectedOrder
    ? selectedOrder.chiTiet?.reduce(
        (sum, ct) => sum + ct.DonGia * ct.SoLuong,
        0
      ) || 0
    : 0;

  const thanhTien = tongTien - giamGia;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Danh sách order chờ thanh toán</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-gray-500 text-xl font-semibold">Không có order nào chờ thanh toán</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const tongTienOrder = order.chiTiet?.reduce(
                  (sum, ct) => sum + ct.DonGia * ct.SoLuong,
                  0
                ) || 0;
                return (
                  <div
                    key={order.MaOrder}
                    className={`bg-white rounded-2xl shadow-lg p-6 border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                      selectedOrder?.MaOrder === order.MaOrder
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          selectedOrder?.MaOrder === order.MaOrder
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gray-200'
                        }`}>
                          <span className={`text-xl font-bold ${
                            selectedOrder?.MaOrder === order.MaOrder ? 'text-white' : 'text-gray-600'
                          }`}>#</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Order: {order.MaOrder}</h3>
                          <p className="text-sm text-gray-600">🍽️ Bàn: {order.TenBan}</p>
                          <p className="text-sm text-gray-600">
                            🕐 {new Date(order.ThoiGian).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {new Intl.NumberFormat('vi-VN').format(tongTienOrder)} đ
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">💰 Chi tiết thanh toán</h2>
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Order:</p>
                  <p className="font-bold text-gray-800">{selectedOrder.MaOrder}</p>
                  <p className="text-sm text-gray-600 mt-2 mb-1">Bàn:</p>
                  <p className="font-bold text-gray-800">{selectedOrder.TenBan}</p>
                </div>
                
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Chi tiết món:</p>
                  {selectedOrder.chiTiet?.map((ct) => (
                    <div key={ct.MaCT} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-700">
                        {ct.TenMon} <span className="text-gray-500">x {ct.SoLuong}</span>
                      </span>
                      <span className="font-semibold text-gray-800">
                        {new Intl.NumberFormat('vi-VN').format(ct.DonGia * ct.SoLuong)} đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-700">Tổng tiền:</span>
                    <span className="font-bold text-gray-800">
                      {new Intl.NumberFormat('vi-VN').format(tongTien)} đ
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Giảm giá</label>
                    <input
                      type="number"
                      value={giamGia}
                      onChange={(e) => setGiamGia(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hình thức thanh toán</label>
                    <select
                      value={hinhThucTT}
                      onChange={(e) => setHinhThucTT(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                    >
                      <option value="TienMat">💵 Tiền mặt</option>
                      <option value="The">💳 Thẻ</option>
                      <option value="ChuyenKhoan">🏦 Chuyển khoản</option>
                    </select>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-700">Thành tiền:</span>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {new Intl.NumberFormat('vi-VN').format(thanhTien)} đ
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleThanhToan}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <FiDollarSign className="text-xl" />
                    <span>Thanh toán</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👆</div>
                <p className="text-gray-500 font-semibold">Chọn order để thanh toán</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThanhToan;

