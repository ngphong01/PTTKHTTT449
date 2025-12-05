import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiArrowLeft } from 'react-icons/fi';
import { khachHangAPI } from '../api/api';

const Register = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    taiKhoan: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.matKhau !== formData.xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.matKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await khachHangAPI.register({
        TenKH: formData.hoTen,
        TaiKhoan: formData.taiKhoan || undefined, // Nếu không có sẽ tự động tạo từ email
        Email: formData.email,
        MatKhau: formData.matKhau
      });
      
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1C1C1C] via-[#2C2C2C] to-[#1C1C1C] px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#1C1C1C] rounded-3xl shadow-2xl overflow-hidden border border-[#C49B63]/20">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1C1C1C] to-[#2C2C2C] p-8 text-center border-b border-[#C49B63]/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C49B63] to-[#D4AF37] rounded-lg flex items-center justify-center shadow-lg shadow-[#C49B63]/30">
                  <span className="text-3xl font-serif font-bold text-[#1C1C1C]">L</span>
                </div>
              </div>
              <h1 className="text-3xl font-serif font-light text-[#C49B63] mb-2 tracking-wider">
                Đăng ký tài khoản
              </h1>
              <p className="text-[#C49B63]/70 text-sm font-light tracking-wide">
                Tạo tài khoản để trải nghiệm Lumière
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  <p className="text-sm font-light">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                  <FiUser className="inline mr-2 text-[#C49B63]" />
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                  <FiUser className="inline mr-2 text-[#C49B63]" />
                  Tên đăng nhập (tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.taiKhoan}
                  onChange={(e) => setFormData({ ...formData, taiKhoan: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder="Nhập tên đăng nhập (nếu không có sẽ tự động tạo)"
                />
                <p className="text-xs text-[#C49B63]/50 mt-1 font-light">Nếu để trống, hệ thống sẽ tự động tạo từ email của bạn</p>
              </div>

              <div>
                <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                  <FiMail className="inline mr-2 text-[#C49B63]" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                  <FiLock className="inline mr-2 text-[#C49B63]" />
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={formData.matKhau}
                  onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-[#C49B63] mb-2 tracking-wide">
                  <FiLock className="inline mr-2 text-[#C49B63]" />
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  value={formData.xacNhanMatKhau}
                  onChange={(e) => setFormData({ ...formData, xacNhanMatKhau: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2C2C2C] border border-[#C49B63]/30 rounded-xl text-[#F9F9F9] placeholder-[#C49B63]/40 focus:ring-2 focus:ring-[#C49B63]/50 focus:border-[#C49B63] transition-all duration-300 outline-none font-light"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#C49B63] via-[#D4AF37] to-[#C49B63] text-[#1C1C1C] py-4 px-6 rounded-xl font-light text-lg tracking-wide hover:from-[#D4AF37] hover:via-[#C49B63] hover:to-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#C49B63]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C49B63]/30"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
              </button>

              <div className="text-center pt-4 border-t border-[#C49B63]/20">
                <p className="text-[#C49B63]/70 font-light">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-[#C49B63] hover:text-[#D4AF37] font-light transition-colors">
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

              <Link
                to="/"
                className="flex items-center justify-center text-[#C49B63]/70 hover:text-[#C49B63] transition-colors font-light"
              >
                <FiArrowLeft className="mr-2" />
                <span>Quay về trang chủ</span>
              </Link>
            </form>
          </div>
        </div>
    </div>
  );
};

export default Register;
