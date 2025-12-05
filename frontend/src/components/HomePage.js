import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiMapPin, FiPhone, FiChevronDown } from 'react-icons/fi';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#1C1C1C]">
      <CustomerHeader />
      
      <main className="flex-1">
        {/* Hero Section - Full Screen với Video/Ảnh nền */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background với overlay */}
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)',
                filter: 'brightness(0.4)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C]/90 via-[#1C1C1C]/80 to-[#1C1C1C]/90"></div>
            </div>
            {/* Ánh sáng vàng đồng chiếu từ bên phải */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#C49B63]/20 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Logo với hiệu ứng lấp lánh - Fine Dining Style */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-[#C49B63] to-[#D4AF37] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#C49B63]/50 mb-4 relative overflow-hidden animate-pulse">
                  <span className="text-6xl sm:text-7xl font-serif font-bold text-[#1C1C1C] relative z-10">L</span>
                  {/* Hiệu ứng ánh sáng */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
                {/* Tia sáng xung quanh */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#C49B63]/40 to-[#D4AF37]/40 rounded-3xl blur-2xl animate-pulse"></div>
              </div>
              {/* Tên nhà hàng */}
              <h1 className="text-3xl sm:text-4xl font-serif font-light text-[#C49B63] tracking-[0.3em] mb-2">
                LUMIÈRE
              </h1>
              <p className="text-sm text-[#C49B63]/70 font-light tracking-[0.2em] uppercase">
                Fine Dining
              </p>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-light text-[#F9F9F9] mb-4 sm:mb-6 tracking-wider px-4">
              Welcome to <span className="text-[#C49B63] font-normal">Lumière</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-light text-[#C49B63] mb-3 sm:mb-4 tracking-wide px-4">
              The Art of Light and Taste
            </p>
            <p className="text-base sm:text-lg md:text-xl text-[#F9F9F9]/80 font-light mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Thưởng thức tinh hoa ẩm thực Âu – Á trong không gian sang trọng.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link
                to="/thuc-don"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#C49B63] via-[#D4AF37] to-[#C49B63] text-[#1C1C1C] rounded-xl font-light text-base sm:text-lg tracking-wide hover:from-[#D4AF37] hover:via-[#C49B63] hover:to-[#D4AF37] transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[#C49B63]/50 group"
              >
                <span>Khám phá thực đơn</span>
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dat-ban"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-4 bg-transparent border-2 border-[#C49B63] text-[#C49B63] rounded-xl font-light text-base sm:text-lg tracking-wide hover:bg-[#C49B63]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 transform hover:scale-105"
              >
                Đặt bàn ngay
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <FiChevronDown className="text-[#C49B63] text-3xl" />
            </div>
          </div>
        </section>

        {/* Features Section - Tại sao chọn chúng tôi */}
        <section className="py-20 bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-center text-[#C49B63] mb-16 tracking-wider">
              Tại sao chọn Lumière?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🍽️',
                  title: 'Món ăn tươi ngon',
                  description: 'Nguyên liệu được chọn lọc kỹ càng, đảm bảo chất lượng và độ tươi ngon tuyệt đối.'
                },
                {
                  icon: '👨‍🍳',
                  title: 'Đầu bếp chuyên nghiệp',
                  description: 'Đội ngũ đầu bếp giàu kinh nghiệm, chế biến món ăn với tâm huyết và nghệ thuật.'
                },
                {
                  icon: '⭐',
                  title: 'Dịch vụ chu đáo',
                  description: 'Nhân viên phục vụ nhiệt tình, chuyên nghiệp, luôn sẵn sàng hỗ trợ quý khách.'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl p-8 text-center hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-serif font-light text-[#C49B63] mb-4">{feature.title}</h3>
                  <p className="text-[#F9F9F9]/70 font-light leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Preview Section - Món ăn nổi bật */}
        <section className="py-20 bg-[#1C1C1C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
                Món ăn nổi bật
              </h2>
              <p className="text-xl text-[#F9F9F9]/70 font-light">
                Khám phá những món ăn đặc biệt của chúng tôi
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                { name: 'Lẩu Bò Lumière Signature', price: '899.000 đ', image: '🍲', description: 'Thịt bò hầm 8 tiếng, rau củ tươi, nước dùng đậm đà' },
                { name: 'Salad Cá Hồi Sốt Cam', price: '299.000 đ', image: '🥗', description: 'Cá hồi tươi ngon, sốt cam chua ngọt đặc biệt' },
                { name: 'Mì Ý Sốt Kem Nấm Truffle', price: '399.000 đ', image: '🍝', description: 'Nấm truffle thượng hạng, kem béo ngậy' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl overflow-hidden hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <div className="h-64 bg-gradient-to-br from-[#C49B63]/20 to-[#D4AF37]/20 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300">
                    {item.image}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-serif font-light text-[#C49B63] mb-2">{item.name}</h3>
                    <p className="text-[#F9F9F9]/60 text-sm mb-4 font-light">{item.description}</p>
                    <p className="text-[#C49B63] font-light text-xl mb-4">{item.price}</p>
                    <button className="w-full bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] py-3 rounded-lg font-light hover:from-[#D4AF37] hover:to-[#C49B63] transition-all duration-300">
                      Đặt món ngay 🍲
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/thuc-don"
                className="inline-flex items-center px-10 py-4 bg-transparent border-2 border-[#C49B63] text-[#C49B63] rounded-xl font-light text-lg tracking-wide hover:bg-[#C49B63]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 transform hover:scale-105"
              >
                Xem toàn bộ thực đơn
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-20 bg-gradient-to-br from-[#2C2C2C] to-[#1C1C1C]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <FiMapPin className="text-4xl mx-auto mb-4 text-[#C49B63]" />
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Địa chỉ</h3>
                  <p className="text-[#F9F9F9]/70 font-light">123 Đường ABC, Quận XYZ<br />TP. Hồ Chí Minh</p>
                </div>
                <div>
                  <FiClock className="text-4xl mx-auto mb-4 text-[#C49B63]" />
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Giờ mở cửa</h3>
                  <p className="text-[#F9F9F9]/70 font-light">Thứ 2 - Chủ nhật<br />8:00 - 22:00</p>
                </div>
                <div>
                  <FiPhone className="text-4xl mx-auto mb-4 text-[#C49B63]" />
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Liên hệ</h3>
                  <p className="text-[#F9F9F9]/70 font-light">0123 456 789<br />info@lumiere.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default HomePage;
