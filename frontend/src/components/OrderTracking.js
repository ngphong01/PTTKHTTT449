import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiSearch } from 'react-icons/fi';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { orderAPI } from '../api/api';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [searchOrderId, setSearchOrderId] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getOrderStatus = async (id) => {
    if (!id) {
      setError('Vui lòng nhập mã đơn hàng');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await orderAPI.getById(id);
      setOrder(response.data);
    } catch (err) {
      setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      getOrderStatus(orderId);
    }
  }, [orderId]);

  const getStatusInfo = (status) => {
    const statuses = {
      'ChoCheBien': {
        label: 'Chờ chế biến',
        icon: FiClock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-300'
      },
      'DangCheBien': {
        label: 'Đang chế biến',
        icon: FiPackage,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-300'
      },
      'DaCheBien': {
        label: 'Đã chế biến xong',
        icon: FiTruck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-300'
      },
      'SanSang': {
        label: 'Sẵn sàng phục vụ',
        icon: FiCheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-300'
      },
      'DaThanhToan': {
        label: 'Đã hoàn tất',
        icon: FiCheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-300'
      }
    };
    return statuses[status] || statuses['ChoCheBien'];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <CustomerHeader />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Theo dõi đơn hàng
            </h1>
            <p className="text-xl text-gray-600">
              Nhập mã đơn hàng để xem trạng thái
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="Nhập mã đơn hàng (VD: ORD001)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && getOrderStatus(searchOrderId)}
                />
              </div>
              <button
                onClick={() => getOrderStatus(searchOrderId)}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <FiSearch />
                <span>{loading ? 'Đang tìm...' : 'Tìm kiếm'}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Đơn hàng #{order.MaOrder}</h2>
                    <p className="text-white/90">Bàn: {order.TenBan || order.MaBan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/80">Thời gian đặt</p>
                    <p className="font-semibold">
                      {new Date(order.ThoiGian).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Trạng thái đơn hàng</h3>
                  <div className="relative">
                    {(() => {
                      const statusInfo = getStatusInfo(order.TrangThai);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div className={`flex items-center space-x-4 p-6 rounded-xl border-2 ${statusInfo.border} ${statusInfo.bg}`}>
                          <StatusIcon className={`text-4xl ${statusInfo.color}`} />
                          <div>
                            <p className={`font-bold text-lg ${statusInfo.color}`}>
                              {statusInfo.label}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.TrangThai === 'ChoCheBien' && 'Đơn hàng đã được tiếp nhận, đang chờ bếp xử lý'}
                              {order.TrangThai === 'DangCheBien' && 'Đầu bếp đang chế biến món ăn của bạn'}
                              {order.TrangThai === 'DaCheBien' && 'Món ăn đã được chế biến xong, sẵn sàng phục vụ'}
                              {order.TrangThai === 'SanSang' && 'Món ăn đã sẵn sàng, nhân viên sẽ mang đến bàn của bạn'}
                              {order.TrangThai === 'DaThanhToan' && 'Đơn hàng đã hoàn tất. Cảm ơn bạn!'}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
                  <div className="space-y-3">
                    {order.chiTiet && order.chiTiet.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          {item.HinhAnh && (
                            <img
                              src={item.HinhAnh}
                              alt={item.TenMon}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-800">{item.TenMon}</p>
                            <p className="text-sm text-gray-600">
                              {new Intl.NumberFormat('vi-VN').format(item.DonGia)} đ × {item.SoLuong}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-orange-600">
                          {new Intl.NumberFormat('vi-VN').format(item.DonGia * item.SoLuong)} đ
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center text-xl font-bold text-orange-600">
                    <span>Tổng cộng:</span>
                    <span>
                      {new Intl.NumberFormat('vi-VN').format(
                        order.chiTiet?.reduce((sum, item) => sum + item.DonGia * item.SoLuong, 0) || 0
                      )} đ
                    </span>
                  </div>
                </div>

                {order.GhiChu && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Ghi chú:</p>
                    <p className="text-blue-700">{order.GhiChu}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default OrderTracking;

