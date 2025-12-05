import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../api/api';
import { FiShoppingCart, FiPlus, FiMinus, FiX, FiSearch, FiCoffee, FiCheck } from 'react-icons/fi';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchMenu();
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenu(response.data.filter((m) => m.TrangThaiMon === 'DangBan'));
    } catch (error) {
      console.error('Lỗi tải menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFoodEmoji = (tenMon, loaiMon) => {
    const lowerName = tenMon.toLowerCase();
    if (loaiMon === 'DoUong') {
      if (lowerName.includes('cà phê') || lowerName.includes('cafe')) return '☕';
      if (lowerName.includes('trà')) return '🍵';
      if (lowerName.includes('nước')) return '🥤';
      if (lowerName.includes('sinh tố')) return '🥤';
      if (lowerName.includes('bia')) return '🍺';
      if (lowerName.includes('cam')) return '🍊';
      return '🥤';
    }
    if (lowerName.includes('phở')) return '🍜';
    if (lowerName.includes('bún')) return '🍜';
    if (lowerName.includes('cơm')) return '🍚';
    if (lowerName.includes('bánh mì')) return '🥖';
    if (lowerName.includes('bánh xèo')) return '🥞';
    if (lowerName.includes('gỏi cuốn')) return '🌯';
    if (lowerName.includes('nem')) return '🥢';
    if (lowerName.includes('chả giò')) return '🥟';
    if (lowerName.includes('gỏi')) return '🥗';
    if (lowerName.includes('bánh')) return '🍰';
    return '🍽️';
  };

  const addToCart = (mon) => {
    const existing = cart.find((item) => item.MaMon === mon.MaMon);
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item.MaMon === mon.MaMon
          ? { ...item, SoLuong: item.SoLuong + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...mon, SoLuong: 1 }];
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Dispatch event để header cập nhật
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Hàm xử lý đặt ngay - thêm vào giỏ và chuyển đến thanh toán
  const handleOrderNow = (mon) => {
    // Thêm món vào giỏ hàng trước
    addToCart(mon);
    
    // Lấy giỏ hàng mới nhất
    const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalPrice = updatedCart.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0);
    
    // Nếu chưa có số bàn, hỏi số bàn
    let currentTableNumber = tableNumber || localStorage.getItem('tableNumber') || '';
    
    if (!currentTableNumber) {
      const inputTable = prompt('Vui lòng nhập số bàn của bạn:');
      if (!inputTable) {
        // Nếu người dùng hủy, không làm gì
        return;
      }
      currentTableNumber = inputTable.trim();
      setTableNumber(currentTableNumber);
      localStorage.setItem('tableNumber', currentTableNumber);
    }
    
    // Chuyển đến trang thanh toán
    navigate('/thanh-toan', {
      state: {
        cart: updatedCart,
        totalPrice: totalPrice,
        tableNumber: currentTableNumber
      }
    });
  };

  const removeFromCart = (maMon) => {
    const newCart = cart.filter((item) => item.MaMon !== maMon);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (maMon, soLuong) => {
    if (soLuong <= 0) {
      removeFromCart(maMon);
      return;
    }
    const newCart = cart.map((item) =>
      item.MaMon === maMon ? { ...item, SoLuong: soLuong } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.LoaiMon === selectedCategory;
    const matchesSearch = item.TenMon.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPrice = cart.reduce((sum, item) => sum + item.DonGia * item.SoLuong, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 text-xl font-semibold">Đang tải menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50">
      <CustomerHeader cartCount={cart.length} />
      
      <main className="flex-1">
        {/* Set Lẩu/Combo Section - Nổi bật */}
        <section className="bg-gradient-to-br from-[#1C1C1C] via-[#2C2C2C] to-[#1C1C1C] py-16 border-b border-[#C49B63]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
                Lẩu Lumière Premium Set
              </h2>
              <p className="text-xl text-[#F9F9F9]/70 font-light">
                Combo hoàn hảo cho 2 đến 6 người - Nghi ngút khói, đậm đà hương vị
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Lẩu Lumière Signature',
                  description: 'Bò Wagyu, tôm sú, rau hữu cơ, nước lẩu cay nhẹ',
                  price: '899.000',
                  people: '2-3 người',
                  image: '🍲',
                  popular: true
                },
                {
                  name: 'Set Ánh Sáng',
                  description: 'Cá hồi, mực, nấm, mì Udon, trứng cút',
                  price: '749.000',
                  people: '2-3 người',
                  image: '🍜',
                  popular: false
                },
                {
                  name: 'Set Family Feast',
                  description: 'Bò Mỹ, hải sản tổng hợp, rau tươi',
                  price: '1.099.000',
                  people: '4-6 người',
                  image: '🦐',
                  popular: false
                }
              ].map((set, index) => (
                <div
                  key={index}
                  className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl overflow-hidden hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300 transform hover:-translate-y-2 group relative"
                >
                  {set.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] px-4 py-1 rounded-full text-xs font-light tracking-wide z-10">
                      ⭐ Phổ biến
                    </div>
                  )}
                  <div className="h-64 bg-gradient-to-br from-[#C49B63]/20 to-[#D4AF37]/20 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/50 to-transparent"></div>
                    <span className="relative z-10">{set.image}</span>
                    {/* Hiệu ứng khói bốc nhẹ khi hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#C49B63]/20 rounded-full blur-3xl animate-pulse"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-serif font-light text-[#C49B63] mb-2">{set.name}</h3>
                    <p className="text-[#F9F9F9]/60 text-sm mb-4 font-light leading-relaxed">{set.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#C49B63] font-light text-sm">{set.people}</span>
                      <span className="text-[#C49B63] font-light text-xl">{set.price} đ</span>
                    </div>
                    <button
                      onClick={() => {
                        // Tạo combo item và đặt ngay
                        const comboItem = {
                          MaMon: `COMBO-${index + 1}`,
                          TenMon: set.name,
                          DonGia: parseInt(set.price.replace(/\./g, '')),
                          SoLuong: 1,
                          MoTa: set.description,
                          HinhAnh: null,
                          LoaiMon: 'Combo'
                        };
                        handleOrderNow(comboItem);
                      }}
                      className="w-full bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] py-3 rounded-lg font-light hover:from-[#D4AF37] hover:to-[#C49B63] transition-all duration-300 transform hover:scale-105"
                    >
                      Đặt ngay 🍲
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-4">
            <FiSearch className="text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-3">
          {[
            { value: 'All', label: 'Tất cả' },
            { value: 'KhaiVi', label: 'Khai vị' },
            { value: 'MonChinh', label: 'Món chính' },
            { value: 'Combo', label: 'Combo/Set' },
            { value: 'Lau', label: 'Lẩu' },
            { value: 'TrangMieng', label: 'Tráng miệng' },
            { value: 'DoUong', label: 'Đồ uống' },
            { value: 'MonChay', label: 'Món chay' }
          ].map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${
                selectedCategory === category.value
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Menu Grid - 3 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((mon) => {
            const isSignature = mon.Tag === 'SignatureDish';
            const isBestSeller = mon.Tag === 'BestSeller';
            const isNew = mon.Tag === 'NewMenu';
            const isCombo = mon.LoaiMon === 'Combo' || mon.LoaiMon === 'Lau';
            
            return (
              <div
                key={mon.MaMon}
                onClick={() => setSelectedItem(mon)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer ${
                  isSignature ? 'border-2 border-[#C49B63]' : ''
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-red-100 to-amber-100 overflow-hidden">
                  {mon.HinhAnh ? (
                    <img
                      src={mon.HinhAnh}
                      alt={mon.TenMon}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gradient-to-br from-red-200 to-amber-200 text-6xl" style={{ display: 'none' }}>
                    <div className="h-full w-full flex items-center justify-center">
                      {getFoodEmoji(mon.TenMon, mon.LoaiMon)}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isSignature && (
                      <span className="bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 shadow-lg">
                        🌟 Signature
                      </span>
                    )}
                    {isBestSeller && (
                      <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 shadow-lg">
                        🔥 Best Seller
                      </span>
                    )}
                    {isNew && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 shadow-lg">
                        🆕 New Menu
                      </span>
                    )}
                  </div>

                  {/* Combo/Lẩu Animation - Khói nhẹ */}
                  {isCombo && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#C49B63]/30 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  )}
                  
                  {/* Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(mon);
                    }}
                    className="absolute bottom-4 right-4 bg-gradient-to-r from-red-600 to-amber-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10"
                  >
                    <FiPlus className="text-xl" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    {mon.TenMon}
                  </h3>
                  {mon.MoTa && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{mon.MoTa}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-red-600">
                      {new Intl.NumberFormat('vi-VN').format(mon.DonGia)} đ
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderNow(mon);
                      }}
                      className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                    >
                      Đặt món ngay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenu.length === 0 && (
          <div className="text-center py-12">
            <FiCoffee className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không tìm thấy món nào</p>
          </div>
        )}
      </div>

      {/* Popup Menu Item Detail */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Header */}
            <div className="relative h-64 bg-gradient-to-br from-red-100 to-amber-100 overflow-hidden">
              {selectedItem.HinhAnh ? (
                <img
                  src={selectedItem.HinhAnh}
                  alt={selectedItem.TenMon}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full bg-gradient-to-br from-red-200 to-amber-200 text-8xl hidden items-center justify-center">
                {getFoodEmoji(selectedItem.TenMon, selectedItem.LoaiMon)}
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
              >
                <FiX className="text-xl text-gray-800" />
              </button>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {selectedItem.Tag === 'SignatureDish' && (
                  <span className="bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] px-4 py-2 rounded-full text-sm font-light flex items-center gap-2 shadow-lg">
                    🌟 Signature Dish
                  </span>
                )}
                {selectedItem.Tag === 'BestSeller' && (
                  <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-light flex items-center gap-2 shadow-lg">
                    🔥 Best Seller
                  </span>
                )}
                {selectedItem.Tag === 'NewMenu' && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-light flex items-center gap-2 shadow-lg">
                    🆕 New Menu
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-gray-800 mb-4">
                {selectedItem.TenMon}
              </h2>
              
              {selectedItem.MoTa && (
                <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg">
                  {selectedItem.MoTa}
                </p>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Giá</p>
                  <p className="text-3xl sm:text-4xl font-bold text-red-600">
                    {new Intl.NumberFormat('vi-VN').format(selectedItem.DonGia)} đ
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleOrderNow(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Đặt món ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <FiShoppingCart />
                <span>Giỏ hàng của bạn</span>
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-200"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Giỏ hàng trống</p>
                  <p className="text-gray-500 text-sm mt-2">Hãy chọn món từ thực đơn</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.MaMon}
                      className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4"
                    >
                      {item.HinhAnh ? (
                        <img
                          src={item.HinhAnh}
                          alt={item.TenMon}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-20 h-20 bg-gradient-to-br from-red-200 to-amber-200 rounded-lg text-3xl" style={{ display: 'none' }}>
                        <div className="h-full w-full flex items-center justify-center">
                          {getFoodEmoji(item.TenMon, item.LoaiMon)}
                        </div>
                      </div>
                      
                      {/* eslint-disable-next-line */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.TenMon}</h3>
                        <p className="text-red-600 font-semibold">
                          {new Intl.NumberFormat('vi-VN').format(item.DonGia)} đ
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.MaMon, item.SoLuong - 1)}
                          className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          <FiMinus />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{item.SoLuong}</span>
                        <button
                          onClick={() => updateQuantity(item.MaMon, item.SoLuong + 1)}
                          className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          <FiPlus />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.MaMon)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Số bàn của bạn:
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="VD: Bàn 1, B001, 1..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-3xl font-bold text-red-600">
                    {new Intl.NumberFormat('vi-VN').format(totalPrice)} đ
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    if (!tableNumber || cart.length === 0) {
                      alert('Vui lòng nhập số bàn và chọn món!');
                      return;
                    }
                    // Navigate to payment page with state
                    navigate('/thanh-toan', {
                      state: {
                        cart: cart,
                        totalPrice: totalPrice,
                        tableNumber: tableNumber
                      }
                    });
                  }}
                  disabled={!tableNumber || cart.length === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-amber-600 text-white py-4 rounded-xl hover:from-red-700 hover:to-amber-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <FiCheck className="text-xl" />
                  <span>Thanh toán</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </main>
      
      <CustomerFooter />
    </div>
  );
};

export default CustomerMenu;

