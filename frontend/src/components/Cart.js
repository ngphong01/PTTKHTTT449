import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { menuAPI } from '../api/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);

      // Load menu items để lấy thông tin chi tiết
      const response = await menuAPI.getAll();
      const items = {};
      response.data.forEach(item => {
        items[item.MaMon] = item;
      });
      setMenuItems(items);
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (maMon, change) => {
    const newCart = cart.map(item => {
      if (item.MaMon === maMon) {
        const newQuantity = Math.max(1, item.SoLuong + change);
        return { ...item, SoLuong: newQuantity };
      }
      return item;
    });
    updateCart(newCart);
  };

  const removeItem = (maMon) => {
    const newCart = cart.filter(item => item.MaMon !== maMon);
    updateCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const menuItem = menuItems[item.MaMon];
      if (menuItem) {
        return total + (menuItem.DonGia * item.SoLuong);
      }
      return total;
    }, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
    navigate('/thanh-toan', { state: { cart, menuItems } });
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Giỏ hàng của tôi</h1>

          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-600 mb-6">Hãy thêm món ăn vào giỏ hàng của bạn!</p>
              <button
                onClick={() => navigate('/thuc-don')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                Xem thực đơn
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const menuItem = menuItems[item.MaMon];
                  if (!menuItem) return null;

                  return (
                    <div key={item.MaMon} className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4">
                      {menuItem.HinhAnh && (
                        <img
                          src={menuItem.HinhAnh}
                          alt={menuItem.TenMon}
                          className="w-24 h-24 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{menuItem.TenMon}</h3>
                        <p className="text-orange-600 font-semibold mb-2">
                          {new Intl.NumberFormat('vi-VN').format(menuItem.DonGia)} đ
                        </p>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.MaMon, -1)}
                            className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
                          >
                            <FiMinus />
                          </button>
                          <span className="font-bold text-gray-900 w-8 text-center">{item.SoLuong}</span>
                          <button
                            onClick={() => updateQuantity(item.MaMon, 1)}
                            className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
                          >
                            <FiPlus />
                          </button>
                          <button
                            onClick={() => removeItem(item.MaMon)}
                            className="ml-auto text-red-500 hover:text-red-700 p-2 rounded-lg transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
                  
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => {
                      const menuItem = menuItems[item.MaMon];
                      if (!menuItem) return null;
                      return (
                        <div key={item.MaMon} className="flex justify-between text-gray-700">
                          <span>{menuItem.TenMon} x {item.SoLuong}</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('vi-VN').format(menuItem.DonGia * item.SoLuong)} đ
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {new Intl.NumberFormat('vi-VN').format(calculateTotal())} đ
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default Cart;

