import React from 'react';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { FiClock, FiMapPin, FiPhone, FiMail, FiAward, FiUsers, FiUser } from 'react-icons/fi';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#1C1C1C]">
      <CustomerHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-96 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920)',
                filter: 'brightness(0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C]/90 via-[#1C1C1C]/80 to-[#1C1C1C]/90"></div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#C49B63]/20 to-transparent"></div>
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-6xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
              Về Lumière
            </h1>
            <p className="text-xl text-[#F9F9F9]/80 font-light max-w-2xl mx-auto">
              Mỗi món ăn tại Lumière là sự kết hợp tinh tế giữa ánh sáng, hương vị và cảm xúc.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-[#C49B63] mb-6 tracking-wider">
                Câu chuyện của chúng tôi
              </h2>
              <p className="text-lg text-[#F9F9F9]/80 mb-4 leading-relaxed font-light">
                Lumière được thành lập với tình yêu và đam mê dành cho ẩm thực Việt Nam. 
                Chúng tôi tin rằng mỗi món ăn không chỉ là thức ăn, mà còn là một câu chuyện, 
                một kỷ niệm, và một trải nghiệm đáng nhớ.
              </p>
              <p className="text-lg text-[#F9F9F9]/80 mb-4 leading-relaxed font-light">
                Với hơn 10 năm kinh nghiệm trong ngành ẩm thực, đội ngũ đầu bếp của chúng tôi 
                luôn tìm tòi, sáng tạo để mang đến những món ăn độc đáo, giữ nguyên hương vị 
                truyền thống nhưng được trình bày một cách hiện đại và tinh tế.
              </p>
              <p className="text-lg text-[#F9F9F9]/80 leading-relaxed font-light">
                Mục tiêu của chúng tôi là tạo ra một không gian ấm cúng, thân thiện, nơi mọi 
                người có thể tận hưởng những bữa ăn ngon miệng cùng gia đình và bạn bè.
              </p>
            </div>
            <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl p-8 shadow-2xl">
              <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-[#C49B63]/20 to-[#D4AF37]/20 rounded-2xl overflow-hidden flex items-center justify-center">
                <span className="text-8xl">👨‍🍳</span>
              </div>
            </div>
          </div>

          {/* Chef's Choice Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
                Chef's Choice
              </h2>
              <p className="text-xl text-[#F9F9F9]/70 font-light">
                Món ăn đặc biệt do đầu bếp trưởng đề xuất
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Lẩu Bò Wagyu Signature',
                  chef: 'Chef Minh Khang',
                  description: 'Thịt bò Wagyu hảo hạng, hầm 8 tiếng với 15 loại gia vị đặc biệt',
                  price: '1.299.000 đ',
                  image: '🍲'
                },
                {
                  name: 'Salad Cá Hồi Sốt Cam Truffle',
                  chef: 'Chef Thu Hà',
                  description: 'Cá hồi Na Uy tươi ngon, sốt cam với nấm truffle thượng hạng',
                  price: '599.000 đ',
                  image: '🥗'
                },
                {
                  name: 'Mì Ý Sốt Kem Nấm Truffle',
                  chef: 'Chef Anh Tuấn',
                  description: 'Mì Ý handmade, sốt kem với nấm truffle đen và phô mai Parmigiano',
                  price: '499.000 đ',
                  image: '🍝'
                }
              ].map((dish, index) => (
                <div
                  key={index}
                  className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl overflow-hidden hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="h-48 bg-gradient-to-br from-[#C49B63]/20 to-[#D4AF37]/20 flex items-center justify-center text-7xl">
                    {dish.image}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiUser className="text-[#C49B63] text-sm" />
                      <span className="text-xs text-[#C49B63]/70 font-light">{dish.chef}</span>
                    </div>
                    <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">{dish.name}</h3>
                    <p className="text-sm text-[#F9F9F9]/60 mb-4 font-light leading-relaxed">{dish.description}</p>
                    <p className="text-[#C49B63] font-light text-lg">{dish.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-center text-[#C49B63] mb-12 tracking-wider">
              Giá trị cốt lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl p-8 text-center hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAward className="text-[#1C1C1C] text-2xl" />
                </div>
                <h3 className="text-2xl font-serif font-light text-[#C49B63] mb-3">Chất lượng</h3>
                <p className="text-[#F9F9F9]/70 font-light leading-relaxed">
                  Chúng tôi chỉ sử dụng nguyên liệu tươi ngon nhất, được chọn lọc kỹ càng 
                  để đảm bảo chất lượng món ăn.
                </p>
              </div>
              <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl p-8 text-center hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="text-[#1C1C1C] text-2xl" />
                </div>
                <h3 className="text-2xl font-serif font-light text-[#C49B63] mb-3">Phục vụ tận tâm</h3>
                <p className="text-[#F9F9F9]/70 font-light leading-relaxed">
                  Đội ngũ nhân viên chuyên nghiệp, thân thiện, luôn sẵn sàng phục vụ khách hàng 
                  với tất cả sự nhiệt tình và chu đáo.
                </p>
              </div>
              <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-2xl p-8 text-center hover:border-[#C49B63] hover:shadow-2xl hover:shadow-[#C49B63]/20 transition-all duration-300">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❤️</span>
                </div>
                <h3 className="text-2xl font-serif font-light text-[#C49B63] mb-3">Đam mê</h3>
                <p className="text-[#F9F9F9]/70 font-light leading-relaxed">
                  Tình yêu với ẩm thực được thể hiện qua từng món ăn, từng chi tiết nhỏ nhất 
                  trong cách chúng tôi phục vụ.
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl shadow-2xl p-12 mb-20">
            <h2 className="text-4xl font-serif font-light text-center text-[#C49B63] mb-12 tracking-wider">
              Thông tin nhà hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] p-3 rounded-lg flex-shrink-0">
                  <FiMapPin className="text-[#1C1C1C] text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Địa chỉ</h3>
                  <p className="text-[#F9F9F9]/70 font-light">
                    123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] p-3 rounded-lg flex-shrink-0">
                  <FiClock className="text-[#1C1C1C] text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Giờ mở cửa</h3>
                  <p className="text-[#F9F9F9]/70 font-light">
                    Thứ 2 - Chủ nhật: 10:00 - 22:00
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] p-3 rounded-lg flex-shrink-0">
                  <FiPhone className="text-[#1C1C1C] text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Điện thoại</h3>
                  <p className="text-[#F9F9F9]/70 font-light">
                    0123 456 789
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] p-3 rounded-lg flex-shrink-0">
                  <FiMail className="text-[#1C1C1C] text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Email</h3>
                  <p className="text-[#F9F9F9]/70 font-light">
                    info@lumiere.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default About;
