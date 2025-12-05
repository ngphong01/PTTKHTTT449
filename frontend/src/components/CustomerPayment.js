import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiCheck, FiArrowLeft, FiUser, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { orderAPI, hoaDonAPI, banAPI, nhanVienAPI } from '../api/api';

const CustomerPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], totalPrice: initialTotalPrice = 0, tableNumber = '' } = location.state || {};

  // Tính lại totalPrice từ cart nếu không có hoặc = 0
  const calculateTotal = () => {
    if (cart.length === 0) return 0;
    return cart.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0);
  };
  const totalPrice = initialTotalPrice > 0 ? initialTotalPrice : calculateTotal();

  // Lấy thông tin khách hàng đã đăng nhập
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  
  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem('customer') || 'null');
    if (customer) {
      setLoggedInCustomer(customer);
      // Tự động điền thông tin khách hàng đã đăng nhập
      setCustomerInfo({
        hoTen: customer.TenKH || '',
        soDienThoai: customer.SoDienThoai || '',
        email: customer.Email || '',
        diaChi: customer.DiaChi || ''
      });
    }
  }, []);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    diaChi: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (!customerInfo.hoTen || !customerInfo.soDienThoai) {
      alert('Vui lòng nhập đầy đủ thông tin liên hệ');
      return;
    }

    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setLoading(true);
    try {
      // Lấy thông tin khách hàng đăng nhập (nếu có)
      const customer = JSON.parse(localStorage.getItem('customer') || 'null');
      const MaKH = customer ? customer.MaKH : null;

      // Tìm hoặc tạo bàn từ tableNumber
      let maBan = null;
      if (tableNumber) {
        try {
          const banList = await banAPI.getAll();
          const foundBan = banList.data.find(b => 
            b.TenBan.toLowerCase().includes(tableNumber.toLowerCase()) ||
            b.MaBan.toLowerCase().includes(tableNumber.toLowerCase())
          );
          
          if (foundBan) {
            maBan = foundBan.MaBan;
          } else {
            // Tạo bàn mới nếu không tìm thấy
            const newMaBan = `BAN${Date.now()}`;
            await banAPI.create({
              MaBan: newMaBan,
              TenBan: tableNumber,
              SoGhe: 4,
              ViTri: 'Online',
              TrangThai: 'DangPhucVu'
            });
            maBan = newMaBan;
          }
        } catch (err) {
          console.error('Lỗi tìm/tạo bàn:', err);
          // Tạo bàn mặc định nếu lỗi
          const newMaBan = `BAN${Date.now()}`;
          await banAPI.create({
            MaBan: newMaBan,
            TenBan: tableNumber || 'Online',
            SoGhe: 4,
            ViTri: 'Online',
            TrangThai: 'DangPhucVu'
          });
          maBan = newMaBan;
        }
      } else {
        // Tạo bàn mặc định cho đơn online
        const newMaBan = `BAN${Date.now()}`;
        await banAPI.create({
          MaBan: newMaBan,
          TenBan: 'Online',
          SoGhe: 4,
          ViTri: 'Online',
          TrangThai: 'DangPhucVu'
        });
        maBan = newMaBan;
      }

      // Lấy nhân viên đầu tiên làm nhân viên mặc định (hoặc tạo nhân viên hệ thống)
      let maNV = null;
      try {
        const nhanVienList = await nhanVienAPI.getAll();
        if (nhanVienList.data && nhanVienList.data.length > 0) {
          maNV = nhanVienList.data[0].MaNV;
        } else {
          // Nếu không có nhân viên, sử dụng mã mặc định
          maNV = 'NV001';
        }
      } catch (err) {
        console.error('Lỗi lấy nhân viên:', err);
        maNV = 'NV001'; // Mã nhân viên mặc định
      }

      // Tạo order
      const orderResponse = await orderAPI.create({
        MaBan: maBan,
        MaNV: maNV,
        MaKH: MaKH,
        GhiChu: `Đơn online - ${customerInfo.hoTen} - ${customerInfo.soDienThoai} - ${paymentMethod}`,
        chiTiet: cart.map(item => ({
          MaMon: item.MaMon,
          SoLuong: item.SoLuong,
          DonGia: item.DonGia
        }))
      });

      const maOrder = orderResponse.data.MaOrder;

      // Cập nhật trạng thái order thành "ChoThanhToan"
      await orderAPI.updateTrangThai(maOrder, 'ChoThanhToan');

      // Tạo hóa đơn (backend sẽ tự tính tổng tiền từ chi tiết order)
      await hoaDonAPI.create({
        MaOrder: maOrder,
        MaNV: maNV,
        GiamGia: 0,
        HinhThucTT: paymentMethod === 'tienMat' ? 'TienMat' : 
                   paymentMethod === 'the' ? 'The' :
                   paymentMethod === 'viDienTu' ? 'ViDienTu' : 'ChuyenKhoan'
      });

      // Xóa giỏ hàng
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      setSuccess(true);
      setTimeout(() => {
        navigate('/thuc-don');
      }, 3000);
    } catch (error) {
      console.error('Lỗi thanh toán:', error);
      alert('Có lỗi xảy ra khi thanh toán: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !location.state) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1C1C1C] via-[#2C2C2C] to-[#1C1C1C]">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-xl text-[#F9F9F9]/70 mb-4 font-light">Giỏ hàng trống</p>
            <button
              onClick={() => navigate('/thuc-don')}
              className="bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] px-8 py-3 rounded-xl font-light tracking-wide hover:from-[#D4AF37] hover:to-[#C49B63] transition-all duration-300 shadow-lg hover:shadow-[#C49B63]/50"
            >
              Quay lại thực đơn
            </button>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1C1C1C] via-[#2C2C2C] to-[#1C1C1C]">
      <CustomerHeader />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
              Thanh toán
            </h1>
            <p className="text-xl text-[#F9F9F9]/70 font-light">
              Hoàn tất đơn hàng của bạn
            </p>
            {loggedInCustomer && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl px-4 py-2">
                <FiUser className="text-[#C49B63]" />
                <span className="text-[#F9F9F9]/70 font-light">Khách hàng: </span>
                <span className="text-[#C49B63] font-light">{loggedInCustomer.TenKH}</span>
              </div>
            )}
          </div>

          {success && (
            <div className="mb-6 bg-[#2C2C2C] border-l-4 border-[#C49B63] text-[#C49B63] px-6 py-4 rounded-lg flex items-center space-x-3">
              <FiCheck className="text-2xl" />
              <div>
                <p className="font-light text-lg">Thanh toán thành công!</p>
                <p className="text-sm text-[#F9F9F9]/70">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-[#2C2C2C] rounded-3xl shadow-2xl overflow-hidden border border-[#C49B63]/20">
                <div className="bg-gradient-to-r from-[#1C1C1C] to-[#2C2C2C] p-6 border-b border-[#C49B63]/20">
                  <h2 className="text-2xl font-serif font-light text-[#C49B63] tracking-wider">Thông tin đơn hàng</h2>
                  <div className="mt-3 space-y-1">
                    {loggedInCustomer && (
                      <p className="text-[#F9F9F9]/70 font-light flex items-center space-x-2">
                        <FiUser className="text-[#C49B63] text-sm" />
                        <span>Khách hàng: <span className="text-[#C49B63]">{loggedInCustomer.TenKH}</span></span>
                      </p>
                    )}
                    {tableNumber && (
                      <p className="text-[#F9F9F9]/70 font-light">Bàn: <span className="text-[#C49B63]">{tableNumber}</span></p>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 pb-4 border-b border-[#C49B63]/20 hover:bg-[#1C1C1C]/50 transition-colors rounded-lg p-3">
                        {item.HinhAnh ? (
                          <img
                            src={item.HinhAnh}
                            alt={item.TenMon}
                            className="w-24 h-24 object-cover rounded-lg border border-[#C49B63]/30"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-[#C49B63]/20 to-[#D4AF37]/20 rounded-lg flex items-center justify-center border border-[#C49B63]/30">
                            <span className="text-3xl">🍽️</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-light text-lg text-[#F9F9F9] mb-1">{item.TenMon}</h3>
                          <p className="text-sm text-[#F9F9F9]/60 font-light">
                            {new Intl.NumberFormat('vi-VN').format(item.DonGia)} đ × {item.SoLuong}
                          </p>
                        </div>
                        <p className="font-light text-xl text-[#D4AF37]">
                          {new Intl.NumberFormat('vi-VN').format(item.DonGia * item.SoLuong)} đ
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#C49B63]/20 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#F9F9F9]/70 font-light">Tạm tính:</span>
                      <span className="font-light text-[#F9F9F9]">{new Intl.NumberFormat('vi-VN').format(totalPrice)} đ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#F9F9F9]/70 font-light">Phí dịch vụ (10%):</span>
                      <span className="font-light text-[#F9F9F9]">{new Intl.NumberFormat('vi-VN').format(totalPrice * 0.1)} đ</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-light text-[#D4AF37] pt-3 border-t border-[#C49B63]/20">
                      <span>Tổng cộng:</span>
                      <span className="text-2xl">{new Intl.NumberFormat('vi-VN').format(totalPrice * 1.1)} đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#2C2C2C] rounded-3xl shadow-2xl overflow-hidden mt-6 border border-[#C49B63]/20">
                <div className="bg-gradient-to-r from-[#1C1C1C] to-[#2C2C2C] p-6 border-b border-[#C49B63]/20">
                  <h2 className="text-2xl font-serif font-light text-[#C49B63] tracking-wider">Phương thức thanh toán</h2>
                </div>

                <div className="p-6 space-y-3">
                  {[
                    { id: 'tienMat', label: 'Tiền mặt', icon: FiDollarSign, desc: 'Thanh toán tại quầy' },
                    { id: 'the', label: 'Thẻ tín dụng/Ghi nợ', icon: FiCreditCard, desc: 'Visa, Mastercard' },
                    { id: 'viDienTu', label: 'Ví điện tử', icon: FiSmartphone, desc: 'MoMo, ZaloPay, VNPay' },
                    { id: 'chuyenKhoan', label: 'Chuyển khoản', icon: FiSmartphone, desc: 'Chuyển khoản ngân hàng' }
                  ].map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-[#C49B63] bg-[#1C1C1C] shadow-lg shadow-[#C49B63]/20'
                          : 'border-[#C49B63]/20 hover:border-[#C49B63]/50 bg-[#1C1C1C]/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-[#C49B63] focus:ring-[#C49B63]"
                      />
                      <method.icon className={`text-2xl ${paymentMethod === method.id ? 'text-[#D4AF37]' : 'text-[#C49B63]/70'}`} />
                      <div className="flex-1">
                        <p className={`font-light ${paymentMethod === method.id ? 'text-[#D4AF37]' : 'text-[#F9F9F9]'}`}>{method.label}</p>
                        <p className={`text-sm ${paymentMethod === method.id ? 'text-[#F9F9F9]/70' : 'text-[#F9F9F9]/50'}`}>{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Info & Submit */}
            <div className="lg:col-span-1">
              <div className="bg-[#2C2C2C] rounded-3xl shadow-2xl overflow-hidden sticky top-24 border border-[#C49B63]/20">
                <div className="bg-gradient-to-r from-[#1C1C1C] to-[#2C2C2C] p-6 border-b border-[#C49B63]/20">
                  <h2 className="text-2xl font-serif font-light text-[#C49B63] tracking-wider">Thông tin khách hàng</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="bg-[#1C1C1C]/50 rounded-xl p-4 border border-[#C49B63]/20">
                    <p className="text-xs text-[#C49B63]/70 mb-3 font-light">
                      Vui lòng nhập thông tin để hoàn tất đơn hàng
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63]/70 mb-2 flex items-center space-x-2">
                      <FiUser className="text-[#C49B63]" />
                      <span>Họ và tên *</span>
                    </label>
                    <input
                      type="text"
                      value={customerInfo.hoTen}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, hoTen: e.target.value })}
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 text-[#F9F9F9] rounded-xl focus:ring-2 focus:ring-[#C49B63] focus:border-[#C49B63] transition-all duration-200 outline-none placeholder:text-[#F9F9F9]/30"
                      required
                    />
                    <p className="text-xs text-[#F9F9F9]/50 mt-1 font-light">Tên người nhận đơn hàng</p>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63]/70 mb-2 flex items-center space-x-2">
                      <FiPhone className="text-[#C49B63]" />
                      <span>Số điện thoại *</span>
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.soDienThoai}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, soDienThoai: e.target.value })}
                      placeholder="0901234567 hoặc 0123456789"
                      pattern="[0-9]{10,11}"
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 text-[#F9F9F9] rounded-xl focus:ring-2 focus:ring-[#C49B63] focus:border-[#C49B63] transition-all duration-200 outline-none placeholder:text-[#F9F9F9]/30"
                      required
                    />
                    <p className="text-xs text-[#F9F9F9]/50 mt-1 font-light">Để chúng tôi liên hệ xác nhận đơn hàng</p>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63]/70 mb-2 flex items-center space-x-2">
                      <FiMail className="text-[#C49B63]" />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 text-[#F9F9F9] rounded-xl focus:ring-2 focus:ring-[#C49B63] focus:border-[#C49B63] transition-all duration-200 outline-none placeholder:text-[#F9F9F9]/30"
                    />
                    <p className="text-xs text-[#F9F9F9]/50 mt-1 font-light">Để nhận thông báo về đơn hàng (tùy chọn)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63]/70 mb-2 flex items-center space-x-2">
                      <FiMapPin className="text-[#C49B63]" />
                      <span>Địa chỉ giao hàng</span>
                    </label>
                    <textarea
                      value={customerInfo.diaChi}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, diaChi: e.target.value })}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      rows="3"
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 text-[#F9F9F9] rounded-xl focus:ring-2 focus:ring-[#C49B63] focus:border-[#C49B63] transition-all duration-200 outline-none placeholder:text-[#F9F9F9]/30 resize-none"
                    />
                    <p className="text-xs text-[#F9F9F9]/50 mt-1 font-light">Nếu bạn chọn giao hàng tận nơi</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !paymentMethod}
                    className="w-full bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] py-4 px-6 rounded-xl font-light tracking-wide text-lg hover:from-[#D4AF37] hover:to-[#C49B63] focus:outline-none focus:ring-4 focus:ring-[#C49B63]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#C49B63]/50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1C1C1C]"></div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="text-xl" />
                        <span>Xác nhận thanh toán</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/thuc-don')}
                    className="w-full flex items-center justify-center text-[#F9F9F9]/70 hover:text-[#C49B63] transition-colors font-light"
                  >
                    <FiArrowLeft className="mr-2" />
                    <span>Quay lại</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default CustomerPayment;

