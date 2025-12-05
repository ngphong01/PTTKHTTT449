import React, { useState, useEffect } from 'react';
import { baoCaoAPI } from '../api/api';
import { FiBarChart2, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

const BaoCao = () => {
  const [doanhThuNgay, setDoanhThuNgay] = useState(null);
  const [doanhThuThang, setDoanhThuThang] = useState([]);
  const [topMon, setTopMon] = useState([]);
  const [doanhSoNV, setDoanhSoNV] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThang, setSelectedThang] = useState(new Date().getMonth() + 1);
  const [selectedNam, setSelectedNam] = useState(new Date().getFullYear());

  const fetchBaoCao = async () => {
    try {
      const [ngayRes, thangRes, topMonRes, nvRes] = await Promise.all([
        baoCaoAPI.doanhThuNgay(),
        baoCaoAPI.doanhThuThang(selectedThang, selectedNam),
        baoCaoAPI.topMon({ limit: 10 }),
        baoCaoAPI.doanhSoNhanVien({}),
      ]);
      setDoanhThuNgay(ngayRes.data);
      setDoanhThuThang(Array.isArray(thangRes.data) ? thangRes.data : []);
      setTopMon(topMonRes.data);
      setDoanhSoNV(nvRes.data);
    } catch (error) {
      console.error('Lỗi tải báo cáo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaoCao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThang, selectedNam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-full">
      {/* Doanh thu hôm nay */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
            <FiDollarSign className="text-white" />
          </div>
          <span>Doanh thu hôm nay</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-md">
            <p className="text-sm text-gray-600 mb-2 font-semibold">📄 Số hóa đơn</p>
            <p className="text-3xl font-bold text-blue-600">{doanhThuNgay?.SoHoaDon || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border-2 border-green-200 shadow-md">
            <p className="text-sm text-gray-600 mb-2 font-semibold">💰 Tổng doanh thu</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {new Intl.NumberFormat('vi-VN').format(doanhThuNgay?.TongDoanhThu || 0)} đ
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl border-2 border-purple-200 shadow-md">
            <p className="text-sm text-gray-600 mb-2 font-semibold">📊 Trung bình/hóa đơn</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {doanhThuNgay?.SoHoaDon > 0
                ? new Intl.NumberFormat('vi-VN').format(
                    (doanhThuNgay.TongDoanhThu || 0) / doanhThuNgay.SoHoaDon
                  )
                : 0}{' '}
              đ
            </p>
          </div>
        </div>
      </div>

      {/* Doanh thu theo tháng */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center space-x-2 text-gray-800">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
              <FiTrendingUp className="text-white" />
            </div>
            <span>Doanh thu theo tháng</span>
          </h2>
          <div className="flex space-x-3">
            <select
              value={selectedThang}
              onChange={(e) => setSelectedThang(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none font-semibold"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((thang) => (
                <option key={thang} value={thang}>
                  Tháng {thang}
                </option>
              ))}
            </select>
            <select
              value={selectedNam}
              onChange={(e) => setSelectedNam(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none font-semibold"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((nam) => (
                <option key={nam} value={nam}>
                  {nam}
                </option>
              ))}
            </select>
          </div>
        </div>
        {doanhThuThang.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doanhThuThang.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-gray-800">{item.Ngay}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-sm text-gray-600 font-semibold">{item.SoHoaDon} hóa đơn</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat('vi-VN').format(item.TongDoanhThu)} đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top món bán chạy */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
            <FiBarChart2 className="text-white" />
          </div>
          <span>Top món bán chạy</span>
        </h2>
        {topMon.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topMon.map((mon, index) => (
              <div key={mon.MaMon} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-600 to-red-600' :
                    'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{mon.TenMon}</p>
                    <p className="text-sm text-gray-600">{mon.LoaiMon}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">{mon.TongSoLuong} phần</p>
                  <p className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat('vi-VN').format(mon.TongDoanhThu)} đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doanh số theo nhân viên */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-gray-800">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-2 rounded-lg">
            <FiBarChart2 className="text-white" />
          </div>
          <span>Doanh số theo nhân viên</span>
        </h2>
        {doanhSoNV.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doanhSoNV.map((nv) => (
              <div key={nv.MaNV} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{nv.TenNV}</p>
                    <p className="text-sm text-gray-600">{nv.ChucVu}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 font-semibold">{nv.SoHoaDon} hóa đơn</p>
                  <p className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat('vi-VN').format(nv.TongDoanhThu)} đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaoCao;

