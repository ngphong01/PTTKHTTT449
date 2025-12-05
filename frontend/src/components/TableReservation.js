import React, { useState } from 'react';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiCheck, FiStar, FiAlertCircle } from 'react-icons/fi';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { banAPI, datBanAPI } from '../api/api';

const TableReservation = () => {
  const [formData, setFormData] = useState({
    ngay: '',
    gio: '',
    soNguoi: '',
    khuVuc: '',
    hoTen: '',
    soDienThoai: '',
    email: '',
    ghiChu: ''
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const availableSlots = [
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: true },
    { time: '19:30', available: true },
    { time: '20:00', available: false },
    { time: '20:30', available: true }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkAvailability = async () => {
    if (!formData.ngay || !formData.gio || !formData.soNguoi) {
      alert('Vui lòng chọn ngày, giờ và số người');
      return;
    }

    setLoading(true);
    try {
      const response = await banAPI.getAll();
      const allTables = response.data || [];
      
      const suitable = allTables.filter(
        table => table.TrangThai === 'Trong' && 
        table.SoGhe >= parseInt(formData.soNguoi)
      );
      
      setAvailableTables(suitable);
    } catch (error) {
      console.error('Lỗi kiểm tra bàn:', error);
      alert('Có lỗi xảy ra khi kiểm tra bàn trống');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ngay || !formData.gio || !formData.soNguoi) {
      alert('Vui lòng chọn ngày, giờ và số người');
      return;
    }

    if (!formData.hoTen || !formData.soDienThoai) {
      alert('Vui lòng nhập đầy đủ thông tin liên hệ');
      return;
    }

    setLoading(true);
    try {
      // Lấy thông tin khách hàng đăng nhập (nếu có)
      const customer = JSON.parse(localStorage.getItem('customer') || 'null');
      const MaKH = customer ? customer.MaKH : null;

      // Gọi API đặt bàn (tự động phân bổ bàn hoặc vào hàng đợi)
      const response = await datBanAPI.create({
        MaKH: MaKH,
        HoTen: formData.hoTen,
        SoDienThoai: formData.soDienThoai,
        Email: formData.email || null,
        NgayDat: formData.ngay,
        GioDat: formData.gio,
        SoNguoi: parseInt(formData.soNguoi),
        KhuVuc: formData.khuVuc || null,
        GhiChu: formData.ghiChu || null
      });

      setSuccess(true);
      
      // Hiển thị thông báo phù hợp
      if (response.data.MaBan) {
        alert(`✅ Đặt bàn thành công!\nBàn: ${response.data.MaBan}\nChúng tôi sẽ liên hệ với bạn để xác nhận.`);
      } else {
        alert(`⏳ ${response.data.message}\nVị trí của bạn trong hàng đợi: #1\nChúng tôi sẽ gọi cho bạn ngay khi có bàn trống.`);
      }

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          ngay: '',
          gio: '',
          soNguoi: '',
          khuVuc: '',
          hoTen: '',
          soDienThoai: '',
          email: '',
          ghiChu: ''
        });
        setAvailableTables([]);
      }, 5000);
    } catch (error) {
      console.error('Lỗi đặt bàn:', error);
      alert('Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1C1C1C]">
      <CustomerHeader />
      
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#C49B63] to-[#D4AF37] rounded-full mb-6 shadow-lg shadow-[#C49B63]/30">
              <FiStar className="text-[#1C1C1C] text-3xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
              Đặt bàn trước
            </h1>
            <p className="text-xl text-[#F9F9F9]/70 font-light">
              Đặt bàn ngay để đảm bảo có chỗ cho bạn và gia đình
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-[#2C2C2C] border-l-4 border-[#C49B63] text-[#C49B63] px-6 py-4 rounded-lg flex items-center space-x-3">
              <FiCheck className="text-2xl" />
              <div>
                <p className="font-light text-lg">Đặt bàn thành công!</p>
                <p className="text-sm text-[#F9F9F9]/70 font-light">Chúng tôi sẽ liên hệ với bạn để xác nhận.</p>
              </div>
            </div>
          )}

          <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header với background mờ nhà hàng ban đêm */}
            <div className="relative bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] p-8 border-b border-[#C49B63]/20">
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <h2 className="relative z-10 text-2xl font-serif font-light text-[#C49B63] tracking-wide">
                Thông tin đặt bàn
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                    <FiCalendar className="inline mr-2 text-[#C49B63]" />
                    Ngày đặt bàn
                  </label>
                  <input
                    type="date"
                    name="ngay"
                    value={formData.ngay}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                    <FiClock className="inline mr-2 text-[#C49B63]" />
                    Giờ đến
                  </label>
                  <input
                    type="time"
                    name="gio"
                    value={formData.gio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                    required
                  />
                </div>
              </div>

              {/* Available Time Slots */}
              {formData.ngay && (
                <div>
                  <label className="block text-sm font-light text-[#C49B63] mb-3 tracking-wide">
                    Thời gian còn trống hôm nay:
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, gio: slot.time })}
                        disabled={!slot.available}
                        className={`px-4 py-2 rounded-lg font-light text-sm transition-all duration-300 ${
                          slot.available
                            ? formData.gio === slot.time
                              ? 'bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C]'
                              : 'bg-[#1C1C1C] border border-[#C49B63]/30 text-[#C49B63] hover:border-[#C49B63]'
                            : 'bg-[#1C1C1C] border border-[#C49B63]/10 text-[#F9F9F9]/30 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Number of People & Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                    <FiUsers className="inline mr-2 text-[#C49B63]" />
                    Số người
                  </label>
                  <select
                    name="soNguoi"
                    value={formData.soNguoi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                    required
                  >
                    <option value="">Chọn số người</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num} className="bg-[#1C1C1C]">{num} người</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                    <FiMapPin className="inline mr-2 text-[#C49B63]" />
                    Khu vực (tùy chọn)
                  </label>
                  <select
                    name="khuVuc"
                    value={formData.khuVuc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  >
                    <option value="" className="bg-[#1C1C1C]">Không yêu cầu</option>
                    <option value="Trong nhà" className="bg-[#1C1C1C]">Trong nhà</option>
                    <option value="Ngoài trời" className="bg-[#1C1C1C]">Ngoài trời</option>
                    <option value="Phòng VIP" className="bg-[#1C1C1C]">Phòng VIP</option>
                  </select>
                </div>
              </div>

              {/* Check Availability Button */}
              <button
                type="button"
                onClick={checkAvailability}
                disabled={loading || !formData.ngay || !formData.gio || !formData.soNguoi}
                className="w-full bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] py-4 px-6 rounded-xl font-light text-lg tracking-wide hover:from-[#D4AF37] hover:to-[#C49B63] focus:outline-none focus:ring-4 focus:ring-[#C49B63]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-[#C49B63]/30"
              >
                {loading ? 'Đang kiểm tra...' : 'Kiểm tra bàn trống'}
              </button>

              {/* Available Tables */}
              {availableTables.length > 0 && (
                <div className="bg-[#1C1C1C] border-2 border-[#C49B63]/30 rounded-xl p-6">
                  <h3 className="font-light text-[#C49B63] mb-4 text-lg">
                    Có {availableTables.length} bàn phù hợp:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableTables.map(table => (
                      <div
                        key={table.MaBan}
                        className="bg-[#2C2C2C] border border-[#C49B63]/30 rounded-lg p-3 text-center hover:border-[#C49B63] transition-colors"
                      >
                        <p className="font-light text-[#C49B63]">{table.TenBan}</p>
                        <p className="text-sm text-[#F9F9F9]/60 font-light">{table.SoGhe} ghế</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableTables.length === 0 && formData.ngay && formData.gio && formData.soNguoi && !loading && (
                <div className="bg-[#1C1C1C] border-2 border-[#C49B63]/30 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="text-[#C49B63] text-2xl mt-1" />
                    <div>
                      <p className="text-[#C49B63] font-light mb-2">
                        Hiện tại không có bàn trống phù hợp.
                      </p>
                      <p className="text-[#F9F9F9]/70 font-light text-sm">
                        Bạn vẫn có thể đặt bàn và sẽ được thêm vào danh sách hàng đợi. Chúng tôi sẽ tự động phân bổ bàn khi có bàn trống và liên hệ với bạn.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="border-t border-[#C49B63]/20 pt-6">
                <h3 className="text-xl font-serif font-light text-[#C49B63] mb-4 tracking-wide">Thông tin liên hệ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="hoTen"
                      value={formData.hoTen}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Email (tùy chọn)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Ghi chú đặc biệt (tùy chọn)
                    </label>
                    <textarea
                      name="ghiChu"
                      value={formData.ghiChu}
                      onChange={handleChange}
                      rows="3"
                      placeholder="VD: Bàn gần cửa sổ, không cay, sinh nhật..."
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.ngay || !formData.gio || !formData.soNguoi || !formData.hoTen || !formData.soDienThoai}
                className="w-full bg-gradient-to-r from-[#C49B63] via-[#D4AF37] to-[#C49B63] text-[#1C1C1C] py-4 px-6 rounded-xl font-light text-lg tracking-wide hover:from-[#D4AF37] hover:via-[#C49B63] hover:to-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#C49B63]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-[#C49B63]/30 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1C1C1C]"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="text-xl" />
                    <span>Book a Table</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default TableReservation;
