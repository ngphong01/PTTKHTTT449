import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiClock, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const CustomerFooter = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT59OHrMhVKmGISwDmiZIIZKKQ3HxonBMPgqw&s"
                alt="Logo Lumière"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg items-center justify-center hidden">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Lumière</h3>
                <p className="text-sm text-gray-400">Hương vị đậm đà</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Chúng tôi cam kết mang đến những món ăn ngon nhất, 
              phục vụ tận tâm và không gian ấm cúng cho quý khách.
            </p>
            <div className="flex space-x-4">
              <button type="button" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Facebook">
                <FiFacebook className="text-2xl" />
              </button>
              <button type="button" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Instagram">
                <FiInstagram className="text-2xl" />
              </button>
              <button type="button" className="text-gray-400 hover:text-orange-500 transition-colors" aria-label="Twitter">
                <FiTwitter className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/thuc-don" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Thực đơn
                </Link>
              </li>
              <li>
                <Link to="/dat-ban" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Đặt bàn
                </Link>
              </li>
              <li>
                <Link to="/gioi-thieu" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/lien-he" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="text-orange-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Đường ABC, Phường XYZ<br />
                  Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">0123 456 789</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">info@lumiere.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiClock className="text-orange-500 flex-shrink-0" />
                <span className="text-gray-400">10:00 - 22:00 (Hàng ngày)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Lumière. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
