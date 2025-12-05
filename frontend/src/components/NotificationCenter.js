import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { orderAPI } from '../api/api';

const NotificationCenter = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch notifications based on user role
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Get orders that need attention based on user role
      const response = await orderAPI.getAll();
      const orders = response.data || [];

      const newNotifications = [];

      // For Kitchen (Bep): Notify when new orders arrive
      if (user.ChucVu === 'Bep') {
        const pendingOrders = orders.filter(
          o => o.TrangThai === 'DangXuLy' || o.TrangThai === 'ChoCheBien'
        );
        pendingOrders.forEach(order => {
          newNotifications.push({
            id: `order-${order.MaOrder}`,
            type: 'info',
            title: 'Đơn hàng mới',
            message: `Bàn ${order.TenBan} có đơn hàng #${order.MaOrder} cần chế biến`,
            time: new Date(order.ThoiGian),
            read: false,
            orderId: order.MaOrder
          });
        });
      }

      // For Waiters (PhucVu): Notify when dishes are ready
      if (user.ChucVu === 'PhucVu') {
        const readyOrders = orders.filter(
          o => o.TrangThai === 'DaCheBien' || o.TrangThai === 'SanSang'
        );
        readyOrders.forEach(order => {
          newNotifications.push({
            id: `ready-${order.MaOrder}`,
            type: 'success',
            title: 'Món đã hoàn thành',
            message: `Bàn ${order.TenBan} - Đơn hàng #${order.MaOrder} đã sẵn sàng phục vụ`,
            time: new Date(order.ThoiGian),
            read: false,
            orderId: order.MaOrder
          });
        });
      }

      // For Cashier (ThuNgan): Notify when customers request payment
      if (user.ChucVu === 'ThuNgan') {
        const paymentOrders = orders.filter(
          o => o.TrangThai === 'ChoThanhToan' || o.TrangThai === 'DaCheBien'
        );
        paymentOrders.forEach(order => {
          newNotifications.push({
            id: `payment-${order.MaOrder}`,
            type: 'warning',
            title: 'Yêu cầu thanh toán',
            message: `Bàn ${order.TenBan} - Đơn hàng #${order.MaOrder} đang chờ thanh toán`,
            time: new Date(order.ThoiGian),
            read: false,
            orderId: order.MaOrder
          });
        });
      }

      // For Manager (QuanLy): All notifications
      if (user.ChucVu === 'QuanLy') {
        const allPending = orders.filter(
          o => o.TrangThai === 'DangXuLy' || o.TrangThai === 'ChoCheBien'
        );
        allPending.forEach(order => {
          newNotifications.push({
            id: `manager-${order.MaOrder}`,
            type: 'info',
            title: 'Đơn hàng cần xử lý',
            message: `Bàn ${order.TenBan} - Đơn hàng #${order.MaOrder}`,
            time: new Date(order.ThoiGian),
            read: false,
            orderId: order.MaOrder
          });
        });
      }

      // Check for out of stock items (if we have menu data)
      // This would require menu API integration

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" />;
      case 'error':
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
      >
        <FiBell className="text-xl group-hover:animate-pulse" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiBell className="text-orange-600" />
                <h3 className="font-bold text-gray-800">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FiBell className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không có thông báo mới</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`mb-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : getBgColor(notification.type)
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${
                                notification.read ? 'text-gray-600' : 'text-gray-800'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-xs mt-1 ${
                                notification.read ? 'text-gray-500' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.time).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                              title="Đánh dấu đã đọc"
                            >
                              Đọc
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                            title="Xóa"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Xóa tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;

