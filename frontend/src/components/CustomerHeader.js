import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const CustomerHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Lấy số lượng sản phẩm trong giỏ hàng từ localStorage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  };

  React.useEffect(() => {
    updateCartCount();
    // Lắng nghe sự kiện cập nhật giỏ hàng
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const customer = localStorage.getItem('customer');

  const handleLogout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="bg-[#1C1C1C] shadow-2xl sticky top-0 z-50 border-b border-[#C49B63]/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-4 flex-shrink-0 group">
            {/* Logo Text-based Fine Dining */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#C49B63] to-[#D4AF37] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-[#C49B63]/50 transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1C1C] relative z-10">L</span>
                {/* Hiệu ứng ánh sáng */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent group-hover:animate-pulse"></div>
              </div>
              {/* Tia sáng xung quanh */}
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-br from-[#C49B63]/30 to-[#D4AF37]/30 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-light text-[#C49B63] tracking-wider group-hover:text-[#D4AF37] transition-colors duration-300">
                Lumière
              </h1>
              <p className="text-xs text-[#C49B63]/70 font-light tracking-[0.2em] uppercase mt-1">
                Fine Dining
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
            <Link
              to="/"
              className={`px-5 py-2.5 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                isActive('/') || isActive('/home')
                  ? 'text-[#C49B63] bg-[#C49B63]/10 border-b-2 border-[#C49B63]'
                  : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/thuc-don"
              className={`px-5 py-2.5 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                isActive('/thuc-don')
                  ? 'text-[#C49B63] bg-[#C49B63]/10 border-b-2 border-[#C49B63]'
                  : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
              }`}
            >
              Thực đơn
            </Link>
            <Link
              to="/dat-ban"
              className={`px-5 py-2.5 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                isActive('/dat-ban')
                  ? 'text-[#C49B63] bg-[#C49B63]/10 border-b-2 border-[#C49B63]'
                  : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
              }`}
            >
              Đặt bàn
            </Link>
            <Link
              to="/theo-doi-don-hang"
              className={`px-5 py-2.5 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                isActive('/theo-doi-don-hang')
                  ? 'text-[#C49B63] bg-[#C49B63]/10 border-b-2 border-[#C49B63]'
                  : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
              }`}
            >
              Theo dõi đơn
            </Link>
            <Link
              to="/gioi-thieu"
              className={`px-5 py-2.5 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                isActive('/gioi-thieu')
                  ? 'text-[#C49B63] bg-[#C49B63]/10 border-b-2 border-[#C49B63]'
                  : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
              }`}
            >
              Giới thiệu
            </Link>
            <Link
              to="/lien-he"
              className={`px-5 py-2.5 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                isActive('/lien-he')
                  ? 'text-[#C49B63] bg-[#C49B63]/10 border-b-2 border-[#C49B63]'
                  : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
              }`}
            >
              Liên hệ
            </Link>
          </nav>

          {/* Right Side - Cart & Login */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              to="/gio-hang"
              className="relative p-2.5 text-[#F9F9F9] hover:text-[#C49B63] transition-all duration-300 rounded-lg hover:bg-[#C49B63]/10 group"
            >
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C49B63] text-[#1C1C1C] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login/User Button */}
            {customer ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/tai-khoan"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] rounded-lg hover:from-[#D4AF37] hover:to-[#C49B63] transition-all duration-300 font-light tracking-wide shadow-lg hover:shadow-[#C49B63]/50 group"
                >
                  <FiUser className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline text-sm">
                    {JSON.parse(customer).TenKH}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-[#F9F9F9] hover:text-[#C49B63] transition-all duration-300 rounded-lg hover:bg-[#C49B63]/10 group"
                  title="Đăng xuất"
                >
                  <FiLogOut className="text-xl group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] rounded-lg hover:from-[#D4AF37] hover:to-[#C49B63] transition-all duration-300 font-light tracking-wide shadow-lg hover:shadow-[#C49B63]/50 group"
              >
                <FiUser className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-sm">Đăng nhập</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-[#F9F9F9] hover:text-[#C49B63] transition-colors rounded-lg hover:bg-[#C49B63]/10"
            >
              {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#C49B63]/20">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-light text-sm ${
                  isActive('/') || isActive('/home')
                    ? 'text-[#C49B63] bg-[#C49B63]/10'
                    : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/thuc-don"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-light text-sm ${
                  isActive('/thuc-don') ? 'text-[#C49B63] bg-[#C49B63]/10' : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
                }`}
              >
                Thực đơn
              </Link>
              <Link
                to="/dat-ban"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-light text-sm ${
                  isActive('/dat-ban') ? 'text-[#C49B63] bg-[#C49B63]/10' : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
                }`}
              >
                Đặt bàn
              </Link>
              <Link
                to="/theo-doi-don-hang"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-light text-sm ${
                  isActive('/theo-doi-don-hang') ? 'text-[#C49B63] bg-[#C49B63]/10' : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
                }`}
              >
                Theo dõi đơn
              </Link>
              <Link
                to="/gioi-thieu"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-light text-sm ${
                  isActive('/gioi-thieu') ? 'text-[#C49B63] bg-[#C49B63]/10' : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
                }`}
              >
                Giới thiệu
              </Link>
              <Link
                to="/lien-he"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-light text-sm ${
                  isActive('/lien-he') ? 'text-[#C49B63] bg-[#C49B63]/10' : 'text-[#F9F9F9] hover:text-[#C49B63] hover:bg-[#C49B63]/5'
                }`}
              >
                Liên hệ
              </Link>
              {customer ? (
                <>
                  <Link
                    to="/tai-khoan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] rounded-lg font-light text-sm text-center mt-2"
                  >
                    {JSON.parse(customer).TenKH}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-3 bg-transparent border-2 border-[#C49B63] text-[#C49B63] rounded-lg font-light text-sm text-center mt-2 flex items-center justify-center space-x-2 hover:bg-[#C49B63]/10"
                  >
                    <FiLogOut />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 bg-gradient-to-r from-[#C49B63] to-[#D4AF37] text-[#1C1C1C] rounded-lg font-light text-sm text-center mt-2"
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default CustomerHeader;
