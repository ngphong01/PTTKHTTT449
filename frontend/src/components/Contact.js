import React, { useState } from 'react';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import { FiMapPin, FiPhone, FiMail, FiSend, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    noiDung: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ hoTen: '', email: '', soDienThoai: '', noiDung: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1C1C1C]">
      <CustomerHeader />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-[#F9F9F9]/70 font-light">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl shadow-2xl p-8">
                <h2 className="text-3xl font-serif font-light text-[#C49B63] mb-6 tracking-wide">
                  Thông tin liên hệ
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-[#C49B63] to-[#D4AF37] p-3 rounded-lg flex-shrink-0">
                      <FiMapPin className="text-[#1C1C1C] text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-light text-[#C49B63] mb-2">Địa chỉ</h3>
                      <p className="text-[#F9F9F9]/70 font-light">
                        123 Đường ABC, Phường XYZ, Quận 1<br />
                        TP. Hồ Chí Minh, Việt Nam
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
                        Hotline: 0123 456 789<br />
                        Đặt bàn: 0987 654 321
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
                        info@lumiere.com<br />
                        booking@lumiere.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="mt-8 pt-8 border-t border-[#C49B63]/20">
                  <h3 className="text-lg font-serif font-light text-[#C49B63] mb-4">Theo dõi chúng tôi</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-lg flex items-center justify-center text-[#C49B63] hover:bg-[#C49B63] hover:text-[#1C1C1C] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-[#C49B63]/30"
                    >
                      <FiFacebook className="text-xl" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-lg flex items-center justify-center text-[#C49B63] hover:bg-[#C49B63] hover:text-[#1C1C1C] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-[#C49B63]/30"
                    >
                      <FiInstagram className="text-xl" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-lg flex items-center justify-center text-[#C49B63] hover:bg-[#C49B63] hover:text-[#1C1C1C] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-[#C49B63]/30"
                    >
                      <FiTwitter className="text-xl" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-96 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.319515355088!2d106.6296543152604!3d10.823061261821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bee0b0ef9e5%3A0x5b4da59e47aa97a8!2zQ8O0bmcgdmnDqm4gUGjhuqduIE3hu4FtIExpw6pu!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '0.75rem' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                    title="Lumière Restaurant Location"
                  ></iframe>
                  <div className="absolute top-4 left-4 bg-[#1C1C1C]/90 backdrop-blur-sm border border-[#C49B63]/30 rounded-lg px-4 py-2">
                    <p className="text-[#C49B63] font-light text-sm">📍 Lumière Restaurant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl shadow-2xl p-8">
              <h2 className="text-3xl font-serif font-light text-[#C49B63] mb-6 tracking-wide">
                Gửi tin nhắn
              </h2>
              
              {submitted ? (
                <div className="bg-[#1C1C1C] border-l-4 border-[#C49B63] text-[#C49B63] p-4 rounded-lg mb-6">
                  <p className="font-light">Cảm ơn bạn đã liên hệ!</p>
                  <p className="text-sm text-[#F9F9F9]/70 font-light mt-1">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={formData.hoTen}
                      onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                      Nội dung *
                    </label>
                    <textarea
                      value={formData.noiDung}
                      onChange={(e) => setFormData({ ...formData, noiDung: e.target.value })}
                      rows="5"
                      className="w-full px-4 py-3 bg-[#1C1C1C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#C49B63] via-[#D4AF37] to-[#C49B63] text-[#1C1C1C] py-4 px-6 rounded-xl font-light text-lg tracking-wide hover:from-[#D4AF37] hover:via-[#C49B63] hover:to-[#D4AF37] transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-[#C49B63]/30 flex items-center justify-center space-x-2"
                  >
                    <FiSend />
                    <span>Gửi tin nhắn</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Visit Lumière Section */}
          <div className="mt-16 text-center">
            <div className="bg-[#2C2C2C] border border-[#C49B63]/20 rounded-3xl p-12">
              <h2 className="text-4xl font-serif font-light text-[#C49B63] mb-4 tracking-wider">
                Visit Lumière
              </h2>
              <p className="text-xl text-[#F9F9F9]/70 font-light mb-8 max-w-2xl mx-auto">
                Trải nghiệm không gian sang trọng và ẩm thực đẳng cấp tại Lumière
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] rounded-xl font-light text-lg tracking-wide hover:from-[#D4AF37] hover:to-[#C49B63] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#C49B63]/30"
              >
                <FiMapPin className="mr-2" />
                Xem trên Google Maps
              </a>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default Contact;
