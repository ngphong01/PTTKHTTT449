import React, { useState, useEffect } from 'react';
import { datBanAPI, hangDoiAPI, banAPI } from '../api/api';
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiCheck, FiX, FiAlertCircle, FiPhone, FiMail, FiUser } from 'react-icons/fi';

const QuanLyDatBan = ({ user }) => {
  const [datBan, setDatBan] = useState([]);
  const [hangDoi, setHangDoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('datban'); // 'datban' hoặc 'hangdoi'
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const [filterNgay, setFilterNgay] = useState('');

  useEffect(() => {
    fetchData();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filterTrangThai, filterNgay]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filterTrangThai !== 'all') {
        params.trangThai = filterTrangThai;
      }
      if (filterNgay) {
        params.ngay = filterNgay;
      }

      const [datBanRes, hangDoiRes] = await Promise.all([
        datBanAPI.getAll(params),
        hangDoiAPI.getAll({ trangThai: 'Cho' })
      ]);

      setDatBan(datBanRes.data || []);
      setHangDoi(hangDoiRes.data || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleXacNhan = async (maDatBan, maBan) => {
    try {
      await datBanAPI.updateTrangThai(maDatBan, 'DaXacNhan');
      if (maBan) {
        await banAPI.updateTrangThai(maBan, 'DaDat');
      }
      alert('Đã xác nhận đặt bàn');
      fetchData();
    } catch (error) {
      console.error('Lỗi xác nhận:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleHuy = async (maDatBan, maBan) => {
    if (!window.confirm('Bạn có chắc muốn hủy đặt bàn này?')) return;

    try {
      await datBanAPI.delete(maDatBan);
      if (maBan) {
        await banAPI.updateTrangThai(maBan, 'Trong');
      }
      alert('Đã hủy đặt bàn');
      fetchData();
    } catch (error) {
      console.error('Lỗi hủy:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleXoaHangDoi = async (maHangDoi) => {
    if (!window.confirm('Bạn có chắc muốn xóa khỏi hàng đợi?')) return;

    try {
      await hangDoiAPI.delete(maHangDoi);
      alert('Đã xóa khỏi hàng đợi');
      fetchData();
    } catch (error) {
      console.error('Lỗi xóa:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const getTrangThaiLabel = (trangThai) => {
    const labels = {
      'ChoXacNhan': 'Chờ xác nhận',
      'DaXacNhan': 'Đã xác nhận',
      'TrongHangDoi': 'Trong hàng đợi',
      'DaHuy': 'Đã hủy',
      'Cho': 'Chờ',
      'DaPhanBan': 'Đã phân bàn'
    };
    return labels[trangThai] || trangThai;
  };

  const getTrangThaiColor = (trangThai) => {
    const colors = {
      'ChoXacNhan': 'bg-yellow-100 text-yellow-800',
      'DaXacNhan': 'bg-green-100 text-green-800',
      'TrongHangDoi': 'bg-orange-100 text-orange-800',
      'DaHuy': 'bg-red-100 text-red-800',
      'Cho': 'bg-blue-100 text-blue-800',
      'DaPhanBan': 'bg-purple-100 text-purple-800'
    };
    return colors[trangThai] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Đặt Bàn & Hàng Đợi</h1>
        <p className="text-gray-600">Quản lý đặt bàn và danh sách hàng đợi của khách hàng</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('datban')}
          className={`px-6 py-3 font-semibold transition-all ${
            selectedTab === 'datban'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-orange-600'
          }`}
        >
          Đặt Bàn ({datBan.length})
        </button>
        <button
          onClick={() => setSelectedTab('hangdoi')}
          className={`px-6 py-3 font-semibold transition-all ${
            selectedTab === 'hangdoi'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-600 hover:text-orange-600'
          }`}
        >
          Hàng Đợi ({hangDoi.length})
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filterTrangThai}
          onChange={(e) => setFilterTrangThai(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="ChoXacNhan">Chờ xác nhận</option>
          <option value="DaXacNhan">Đã xác nhận</option>
          <option value="TrongHangDoi">Trong hàng đợi</option>
        </select>
        <input
          type="date"
          value={filterNgay}
          onChange={(e) => setFilterNgay(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Lọc theo ngày"
        />
        <button
          onClick={() => {
            setFilterTrangThai('all');
            setFilterNgay('');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'datban' ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Mã đặt bàn</th>
                  <th className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày/Giờ</th>
                  <th className="px-6 py-4 text-left font-semibold">Số người</th>
                  <th className="px-6 py-4 text-left font-semibold">Bàn</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datBan.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Không có đặt bàn nào
                    </td>
                  </tr>
                ) : (
                  datBan.map((db) => (
                    <tr key={db.MaDatBan} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">{db.MaDatBan}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{db.HoTen}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <FiPhone className="text-xs" />
                            <span>{db.SoDienThoai}</span>
                          </div>
                          {db.Email && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                              <FiMail className="text-xs" />
                              <span>{db.Email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-gray-400" />
                          <span className="text-sm">{new Date(db.NgayDat).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <FiClock className="text-gray-400" />
                          <span className="text-sm">{db.GioDat}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FiUsers className="text-gray-400" />
                          <span>{db.SoNguoi} người</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {db.MaBan ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {db.TenBan || db.MaBan}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Chưa phân bàn</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTrangThaiColor(db.TrangThai)}`}>
                          {getTrangThaiLabel(db.TrangThai)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {db.TrangThai === 'ChoXacNhan' && (
                            <button
                              onClick={() => handleXacNhan(db.MaDatBan, db.MaBan)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1"
                            >
                              <FiCheck className="text-sm" />
                              <span>Xác nhận</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleHuy(db.MaDatBan, db.MaBan)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                          >
                            <FiX className="text-sm" />
                            <span>Hủy</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="text-blue-600 text-2xl" />
              <div>
                <h3 className="font-semibold text-gray-800">Danh sách hàng đợi</h3>
                <p className="text-sm text-gray-600">Khách hàng đang chờ bàn trống</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {hangDoi.length === 0 ? (
              <div className="text-center py-12">
                <FiAlertCircle className="text-gray-400 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không có khách hàng nào trong hàng đợi</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hangDoi.map((hd) => (
                  <div
                    key={hd.MaHangDoi}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-400 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full">
                          <FiUser className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{hd.HoTen}</h4>
                          <p className="text-sm text-gray-600">#{hd.MaHangDoi}</p>
                        </div>
                      </div>
                      {hd.MaBan && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Đã phân bàn
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiPhone className="text-gray-400" />
                        <span>{hd.SoDienThoai}</span>
                      </div>
                      {hd.Email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiMail className="text-gray-400" />
                          <span>{hd.Email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiUsers className="text-gray-400" />
                        <span>{hd.SoNguoi} người</span>
                      </div>
                      {hd.KhuVuc && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiMapPin className="text-gray-400" />
                          <span>{hd.KhuVuc}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiClock className="text-gray-400" />
                        <span>{new Date(hd.ThoiGianTao).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    {hd.GhiChu && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{hd.GhiChu}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {hd.MaBan && (
                        <span className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold text-center">
                          Bàn: {hd.TenBan || hd.MaBan}
                        </span>
                      )}
                      <button
                        onClick={() => handleXoaHangDoi(hd.MaHangDoi)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <FiX className="text-sm" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyDatBan;

