import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { nhanVienAPI, khachHangAPI } from '../api/api';
import { FiUser, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = ({ onLogin, isCustomer = false }) => {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Thử đăng nhập nhân viên trước
      try {
        const empResponse = await nhanVienAPI.login({ TaiKhoan: email, MatKhau: matKhau });
        onLogin(empResponse.data);
        // Navigate đến dashboard sau khi state được update
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
        return;
      } catch (empError) {
        // Nếu không phải nhân viên, thử đăng nhập khách hàng
        try {
          const customerResponse = await khachHangAPI.login({ TaiKhoan: email, Email: email, MatKhau: matKhau });
          onLogin(customerResponse.data);
          navigate('/');
          return;
        } catch (customerError) {
          // Cả hai đều thất bại
          throw new Error('Tài khoản hoặc mật khẩu không đúng');
        }
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      
      // Log chi tiết để debug
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      } else if (err.request) {
        console.error('Request error:', err.request);
        setError('Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1C1C1C] via-[#2C2C2C] to-[#1C1C1C] px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#1C1C1C] rounded-3xl shadow-2xl overflow-hidden border border-[#C49B63]/20">
          {/* Welcome Header */}
          <div className="px-8 pt-10 pb-8 bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] border-b border-[#C49B63]/20">
            <div className="flex items-center justify-center mb-4">
              {/* Logo Text-based Fine Dining */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Chữ L với hiệu ứng ánh sáng */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#C49B63] to-[#D4AF37] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#C49B63]/50 mb-2 relative overflow-hidden">
                    <span className="text-5xl font-serif font-bold text-[#1C1C1C] relative z-10">L</span>
                    {/* Hiệu ứng ánh sáng */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                  {/* Tia sáng xung quanh */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-[#C49B63]/30 to-[#D4AF37]/30 rounded-2xl blur-xl animate-pulse"></div>
                </div>
                {/* Tên nhà hàng */}
                <h1 className="text-2xl font-serif font-light text-[#C49B63] tracking-[0.3em] mt-2">
                  LUMIÈRE
                </h1>
                <p className="text-xs text-[#C49B63]/60 font-light tracking-[0.2em] uppercase mt-1">
                  Fine Dining
                </p>
              </div>
            </div>
            <h2 className="text-3xl font-serif font-light text-[#C49B63] mb-2 text-center tracking-wider">
              Chào mừng trở lại
            </h2>
            <p className="text-[#C49B63]/70 text-sm text-center font-light tracking-wide">
              Đăng nhập để tiếp tục trải nghiệm Lumière
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6 space-y-6">
            {error && (
              <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2 animate-shake">
                <span>⚠️</span>
                <span className="text-sm font-light">{error}</span>
              </div>
            )}

            {/* Username/Email Field */}
            <div>
              <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                <FiUser className="inline mr-2 text-[#C49B63]" />
                {isCustomer ? 'Tài khoản (username hoặc email)' : 'Tài khoản'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder={isCustomer ? 'Nhập username hoặc email' : 'Nhập tài khoản của bạn'}
                  required
                />
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C49B63]/60" />
              </div>
              {isCustomer && (
                <p className="text-xs text-[#C49B63]/50 mt-1 font-light">Bạn có thể đăng nhập bằng username hoặc email</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                <FiLock className="inline mr-2 text-[#C49B63]" />
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-12 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C49B63]/60" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C49B63]/60 hover:text-[#C49B63] transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#C49B63]/30 bg-[#2C2C2C] text-[#C49B63] focus:ring-[#C49B63]/50 focus:ring-offset-[#1C1C1C]"
                />
                <span className="text-[#C49B63]/70 font-light">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Tính năng quên mật khẩu đang được phát triển')}
                className="text-[#C49B63] hover:text-[#D4AF37] font-light transition-colors text-sm"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C49B63] via-[#D4AF37] to-[#C49B63] text-[#1C1C1C] py-4 px-6 rounded-xl font-light text-lg tracking-wide hover:from-[#D4AF37] hover:via-[#C49B63] hover:to-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#C49B63]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C49B63]/30 flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1C1C1C]"></div>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="px-8 pb-8 bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] border-t border-[#C49B63]/20">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C49B63]/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#1C1C1C] text-[#C49B63]/70 text-sm font-light">
                  Hoặc
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-[#C49B63]/70 mb-4 font-light">
                Chưa có tài khoản?
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full bg-transparent border-2 border-[#C49B63] text-[#C49B63] py-3 px-6 rounded-xl font-light text-lg hover:bg-[#C49B63]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 transform hover:scale-[1.02]"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
