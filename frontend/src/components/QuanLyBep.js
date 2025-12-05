import React, { useState, useEffect } from 'react';
import { orderAPI } from '../api/api';
import { FiCheck, FiClock } from 'react-icons/fi';

const QuanLyBep = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh mỗi 5 giây
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll({ trangThai: 'DangXuLy' });
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

  const handleUpdateTrangThai = async (maCT, trangThai) => {
    try {
      await orderAPI.updateChiTietTrangThai(maCT, trangThai);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
      </div>
    );
  }

  const getTrangThaiStyle = (trangThai) => {
    switch (trangThai) {
      case 'ChoCheBien':
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-800',
          button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
        };
      case 'DangCheBien':
        return {
          border: 'border-yellow-500',
          bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
          button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
        };
      case 'HoanThanh':
        return {
          border: 'border-green-500',
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
          badge: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
          button: null
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          badge: 'bg-gray-100 text-gray-800',
          button: null
        };
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-full">
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <p className="text-gray-500 text-xl font-semibold">Không có order nào đang chờ chế biến</p>
          <p className="text-gray-400 text-sm mt-2">Tất cả món đã được xử lý!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order.MaOrder}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-lg">
                    <span className="text-white text-xl font-bold">#</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Order: {order.MaOrder}</h3>
                    <p className="text-sm text-gray-600">🍽️ Bàn: {order.TenBan}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <span>🕐</span>
                  <span>{new Date(order.ThoiGian).toLocaleString('vi-VN')}</span>
                </p>
              </div>

              <div className="space-y-4">
                {order.chiTiet?.map((ct) => {
                  const style = getTrangThaiStyle(ct.TrangThai);
                  return (
                    <div
                      key={ct.MaCT}
                      className={`p-5 rounded-xl border-2 ${style.border} ${style.bg} transition-all duration-200`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-800 mb-2">{ct.TenMon}</p>
                          <p className="text-sm text-gray-600">
                            Số lượng: <span className="font-semibold">{ct.SoLuong}</span> x <span className="font-semibold text-green-600">{new Intl.NumberFormat('vi-VN').format(ct.DonGia)} đ</span>
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md ${style.badge}`}
                        >
                          {ct.TrangThai === 'ChoCheBien'
                            ? '⏳ Chờ chế biến'
                            : ct.TrangThai === 'DangCheBien'
                            ? '🔥 Đang chế biến'
                            : '✅ Hoàn thành'}
                        </span>
                      </div>
                      {style.button && (
                        <button
                          onClick={() => handleUpdateTrangThai(ct.MaCT, ct.TrangThai === 'ChoCheBien' ? 'DangCheBien' : 'HoanThanh')}
                          className={`w-full ${style.button} text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold`}
                        >
                          {ct.TrangThai === 'ChoCheBien' ? (
                            <>
                              <FiClock />
                              <span>Bắt đầu chế biến</span>
                            </>
                          ) : (
                            <>
                              <FiCheck />
                              <span>Hoàn thành</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuanLyBep;

