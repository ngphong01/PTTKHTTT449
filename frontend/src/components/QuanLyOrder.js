import React, { useState, useEffect } from 'react';
import { orderAPI, banAPI, menuAPI, nhanVienAPI } from '../api/api';
import { FiPlus, FiX, FiShoppingCart, FiTrash2, FiCheck, FiClock, FiUser, FiEdit2, FiCamera, FiRefreshCw } from 'react-icons/fi';

const QuanLyOrder = ({ user, onUserUpdate }) => {
  const [orders, setOrders] = useState([]);
  const [ban, setBan] = useState([]);
  const [menu, setMenu] = useState([]);
  const [nhanVien, setNhanVien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNhanVienModal, setShowNhanVienModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedBan, setSelectedBan] = useState('');
  const [chiTietOrder, setChiTietOrder] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingNhanVien, setEditingNhanVien] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, banRes, menuRes, nhanVienRes] = await Promise.all([
        orderAPI.getAll(),
        banAPI.getAll(),
        menuAPI.getAll(),
        nhanVienAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setBan(banRes.data.filter((b) => b.TrangThai === 'Trong' || b.TrangThai === 'DangPhucVu'));
      setMenu(menuRes.data.filter((m) => m.TrangThaiMon === 'DangBan'));
      setNhanVien(nhanVienRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm resize ảnh để giảm kích thước
  const resizeImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Tính toán kích thước mới
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(resizedBase64);
        };
        img.onerror = () => {
          // Nếu resize thất bại, dùng FileReader trực tiếp
          resolve(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Hàm generate ảnh random cho nhân viên - Cải thiện với nhiều style đẹp hơn
  const generateRandomAvatar = (tenNV, forceNew = false) => {
    const name = tenNV || 'User';
    
    // Tạo seed ngẫu nhiên dựa trên tên + timestamp để mỗi lần generate khác nhau
    const timestamp = forceNew ? Date.now() : 0;
    const seedValue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + timestamp;
    
    // Danh sách style đẹp và đa dạng từ DiceBear
    const styles = [
      'adventurer',      // Style đẹp, hiện đại
      'adventurer-neutral', // Style trung tính
      'avataaars',       // Classic
      'big-ears',        // Dễ thương
      'big-smile',       // Vui vẻ
      'bottts',          // Robot style
      'croodles',        // Dễ thương
      'fun-emoji',       // Emoji style
      'icons',           // Icon style
      'identicon',       // Geometric
      'lorelei',         // Style đẹp mới
      'micah',           // Style đẹp
      'miniavs',         // Mini avatars
      'notionists',      // Notion style
      'open-peeps',      // Open style
      'personas',        // Personas
      'pixel-art',       // Pixel art
      'shapes',          // Shapes
      'thumbs'           // Thumbs
    ];
    
    // Chọn style dựa trên seed
    const style = styles[seedValue % styles.length];
    
    // Màu sắc đẹp và đa dạng hơn
    const bgColors = [
      '0D8ABC', 'FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', 
      '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2', 'F8B739', 
      '52BE80', 'E74C3C', '9B59B6', '3498DB', '1ABC9C',
      'F39C12', 'E67E22', '95A5A6', '34495E', '16A085'
    ];
    const bgColor = bgColors[seedValue % bgColors.length];
    
    // Tạo seed string từ tên + random để đảm bảo đa dạng
    const seedString = `${name}_${seedValue}_${Math.random().toString(36).substring(7)}`;
    
    // Tùy chỉnh thêm cho một số style
    let url = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seedString)}&backgroundColor=${bgColor}`;
    
    // Thêm options cho một số style để đẹp hơn
    if (style === 'adventurer' || style === 'adventurer-neutral') {
      url += '&radius=50'; // Bo tròn
    } else if (style === 'lorelei') {
      url += '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
    } else if (style === 'micah') {
      url += '&backgroundColor=b6e3f4,c0aede,d1d4f9';
    }
    
    return url;
  };

  // Hàm xử lý generate ảnh random - Cải thiện để mỗi lần generate khác nhau
  const handleGenerateRandomAvatar = async (maNV, tenNV) => {
    if (!maNV) return;
    
    setUploadingImage(true);
    try {
      // Force generate ảnh mới mỗi lần bằng cách thêm timestamp
      const avatarUrl = generateRandomAvatar(tenNV, true);
      
      const response = await nhanVienAPI.update(maNV, {
        HinhAnh: avatarUrl
      });
      const updatedEmployee = response.data; // Lấy dữ liệu từ response
      
      // Cập nhật lại state với dữ liệu mới từ server
      if (editingNhanVien && editingNhanVien.MaNV === maNV) {
        setEditingNhanVien(updatedEmployee);
      }
      
      // Nếu đang cập nhật chính user đang đăng nhập, cập nhật lại user state
      if (user && user.MaNV === maNV) {
        const updatedUser = {
          ...user,
          ...updatedEmployee // Sử dụng dữ liệu từ server response
        };
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      }
      
      await fetchData();
      alert('Đã tạo ảnh ngẫu nhiên mới thành công!');
    } catch (error) {
      console.error('Lỗi generate ảnh:', error);
      alert('Có lỗi xảy ra khi tạo ảnh!');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (file, maNV) => {
    if (!file) return;

    // Kiểm tra file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    // Kiểm tra file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB!');
      return;
    }

    setUploadingImage(true);

    try {
      // Resize ảnh trước khi lưu để giảm kích thước
      const resizedBase64 = await resizeImage(file);
      
      // Kiểm tra kích thước base64 (nếu vẫn quá lớn, giảm quality)
      let finalBase64 = resizedBase64;
      if (resizedBase64.length > 500000) { // ~500KB base64
        finalBase64 = await resizeImage(file, 300, 300, 0.7);
      }
      
      // Lưu ảnh lên server
      const response = await nhanVienAPI.update(maNV, {
        HinhAnh: finalBase64
      });
      const updatedEmployee = response.data; // Lấy dữ liệu từ response
      
      // Cập nhật lại state với dữ liệu mới từ server
      if (editingNhanVien && editingNhanVien.MaNV === maNV) {
        setEditingNhanVien(updatedEmployee);
      }
      
      // Nếu đang cập nhật chính user đang đăng nhập, cập nhật lại user state
      if (user && user.MaNV === maNV) {
        const updatedUser = {
          ...user,
          ...updatedEmployee // Sử dụng dữ liệu từ server response
        };
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      }
      
      await fetchData();
      alert('Upload ảnh thành công!');
      setUploadingImage(false);
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi lưu ảnh!';
      alert(`Lỗi: ${errorMessage}`);
      setUploadingImage(false);
    }
  };

  // Hàm xử lý cập nhật thông tin nhân viên
  const handleUpdateNhanVien = async (data) => {
    try {
      // Đảm bảo giữ lại HinhAnh nếu đã có
      const updateData = {
        ...data,
        HinhAnh: data.HinhAnh || editingNhanVien.HinhAnh
      };
      
      const response = await nhanVienAPI.update(editingNhanVien.MaNV, updateData);
      const updatedEmployee = response.data; // Lấy dữ liệu từ response
      
      // Fetch lại tất cả dữ liệu TRƯỚC để đảm bảo có dữ liệu mới nhất
      await fetchData();
      
      // Sau khi fetch, lấy lại dữ liệu mới nhất từ state nhanVien
      const allEmployees = await nhanVienAPI.getAll();
      const latestEmployee = allEmployees.data.find(emp => emp.MaNV === editingNhanVien.MaNV);
      
      // Cập nhật lại editingNhanVien với dữ liệu mới nhất
      if (latestEmployee) {
        setEditingNhanVien(latestEmployee);
      } else {
        setEditingNhanVien(updatedEmployee);
      }
      
      // Nếu đang cập nhật chính user đang đăng nhập, cập nhật lại user state
      if (user && user.MaNV === editingNhanVien.MaNV) {
        // Lấy dữ liệu mới nhất từ server
        const finalUpdatedUser = latestEmployee || updatedEmployee;
        const updatedUser = {
          ...user,
          ...finalUpdatedUser // Sử dụng dữ liệu mới nhất từ server
        };
        
        // Cập nhật state và localStorage
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      }
      
      alert('Cập nhật thông tin thành công!');
      // Không đóng modal ngay, để user có thể xem kết quả
      // setShowNhanVienModal(false);
      // setEditingNhanVien(null);
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Có lỗi xảy ra khi cập nhật!');
    }
  };

  // Hàm tạo ảnh món ăn từ tên
  const getFoodEmoji = (tenMon, loaiMon) => {
    const lowerName = tenMon.toLowerCase();
    
    if (loaiMon === 'DoUong') {
      if (lowerName.includes('cà phê') || lowerName.includes('cafe')) return '☕';
      if (lowerName.includes('trà')) return '🍵';
      if (lowerName.includes('nước')) return '🥤';
      if (lowerName.includes('sinh tố')) return '🥤';
      if (lowerName.includes('bia')) return '🍺';
      if (lowerName.includes('cam')) return '🍊';
      return '🥤';
    }
    
    if (lowerName.includes('phở')) return '🍜';
    if (lowerName.includes('bún')) return '🍜';
    if (lowerName.includes('cơm')) return '🍚';
    if (lowerName.includes('bánh mì')) return '🥖';
    if (lowerName.includes('bánh xèo')) return '🥞';
    if (lowerName.includes('gỏi cuốn')) return '🌯';
    if (lowerName.includes('nem')) return '🥢';
    if (lowerName.includes('chả giò')) return '🥟';
    if (lowerName.includes('gỏi')) return '🥗';
    if (lowerName.includes('bánh')) return '🍰';
    
    return '🍽️';
  };

  const handleAddMon = (mon) => {
    const existing = chiTietOrder.find((ct) => ct.MaMon === mon.MaMon);
    if (existing) {
      setChiTietOrder(
        chiTietOrder.map((ct) =>
          ct.MaMon === mon.MaMon
            ? { ...ct, SoLuong: ct.SoLuong + 1 }
            : ct
        )
      );
    } else {
      setChiTietOrder([
        ...chiTietOrder,
        {
          MaMon: mon.MaMon,
          TenMon: mon.TenMon,
          DonGia: mon.DonGia,
          SoLuong: 1,
          LoaiMon: mon.LoaiMon,
        },
      ]);
    }
  };

  const handleRemoveMon = (maMon) => {
    setChiTietOrder(chiTietOrder.filter((ct) => ct.MaMon !== maMon));
  };

  const handleUpdateSoLuong = (maMon, soLuong) => {
    if (soLuong <= 0) {
      handleRemoveMon(maMon);
      return;
    }
    setChiTietOrder(
      chiTietOrder.map((ct) =>
        ct.MaMon === maMon ? { ...ct, SoLuong: soLuong } : ct
      )
    );
  };

  const handleCreateOrder = async () => {
    if (!selectedBan || chiTietOrder.length === 0) {
      alert('Vui lòng chọn bàn và thêm món');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    try {
      await orderAPI.create({
        MaBan: selectedBan,
        MaNV: user.MaNV,
        chiTiet: chiTietOrder.map((ct) => ({
          MaMon: ct.MaMon,
          SoLuong: ct.SoLuong,
          DonGia: ct.DonGia,
        })),
      });
      fetchData();
      setShowModal(false);
      setSelectedBan('');
      setChiTietOrder([]);
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const tongTien = chiTietOrder.reduce(
    (sum, ct) => sum + ct.DonGia * ct.SoLuong,
    0
  );

  const categories = ['All', 'MonChinh', 'MonPhu', 'DoUong'];
  const categoryLabels = {
    'All': 'Tất cả',
    'MonChinh': 'Món chính',
    'MonPhu': 'Món phụ',
    'DoUong': 'Đồ uống'
  };

  const filteredMenu = selectedCategory === 'All' 
    ? menu 
    : menu.filter(m => m.LoaiMon === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const getTrangThaiStyle = (trangThai) => {
    switch (trangThai) {
      case 'DangXuLy':
        return 'bg-gradient-to-r from-amber-400 to-orange-500';
      case 'HoanThanh':
        return 'bg-gradient-to-r from-emerald-400 to-green-500';
      case 'ChoThanhToan':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTrangThaiIcon = (trangThai) => {
    switch (trangThai) {
      case 'DangXuLy':
        return '⏳';
      case 'HoanThanh':
        return '✅';
      case 'ChoThanhToan':
        return '💳';
      default:
        return '📋';
    }
  };

  const getTrangThaiText = (trangThai) => {
    switch (trangThai) {
      case 'DangXuLy':
        return 'Đang xử lý';
      case 'HoanThanh':
        return 'Hoàn thành';
      case 'ChoThanhToan':
        return 'Chờ thanh toán';
      default:
        return trangThai;
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Quản Lý Order
            </h1>
            <p className="text-gray-600 flex items-center space-x-2">
              <FiShoppingCart className="text-indigo-500" />
              <span>Tạo và quản lý đơn hàng của nhà hàng</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowModal(true);
                setChiTietOrder([]);
                setSelectedBan('');
                setSelectedCategory('All');
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <FiPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Tạo order mới</span>
            </button>
            <button
              onClick={() => setShowNhanVienModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FiUser className="text-xl" />
              <span className="font-semibold">Quản lý NV</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn</p>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
                <p className="text-2xl font-bold text-amber-600">
                  {orders.filter(o => o.TrangThai === 'DangXuLy').length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.TrangThai === 'HoanThanh').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chờ thanh toán</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.TrangThai === 'ChoThanhToan').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <span className="text-2xl">💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-8xl mb-6">📋</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-600 mb-6">Hãy tạo đơn hàng đầu tiên của bạn</p>
          <button
            onClick={() => {
              setShowModal(true);
              setChiTietOrder([]);
              setSelectedBan('');
              setSelectedCategory('All');
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FiPlus className="text-xl" />
            <span className="font-semibold">Tạo order mới</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order.MaOrder}
              onClick={async () => {
                try {
                  const detailRes = await orderAPI.getById(order.MaOrder);
                  setSelectedOrder(detailRes.data);
                  setShowOrderDetailModal(true);
                } catch (error) {
                  console.error('Lỗi tải chi tiết order:', error);
                  alert('Không thể tải chi tiết đơn hàng');
                }
              }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group cursor-pointer"
            >
              {/* Header with Status */}
              <div className={`${getTrangThaiStyle(order.TrangThai)} p-4 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTrangThaiIcon(order.TrangThai)}</span>
                    <span className="font-bold text-sm">{getTrangThaiText(order.TrangThai)}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold">{order.MaOrder}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Table Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl shadow-md">
                    <span className="text-white text-xl">🪑</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bàn số</p>
                    <p className="text-lg font-bold text-gray-800">{order.TenBan}</p>
                  </div>
                </div>

                {/* Staff Info */}
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                  {order.HinhAnhNV ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 shadow-md flex-shrink-0 relative group/avatar">
                      <img 
                        src={order.HinhAnhNV} 
                        alt={order.TenNhanVien}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg hidden">
                        {order.TenNhanVien?.charAt(0) || 'N'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                      {order.TenNhanVien?.charAt(0) || 'N'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center space-x-1">
                      <FiUser className="text-xs" />
                      <span>Nhân viên</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{order.TenNhanVien}</p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiClock className="text-indigo-500" />
                  <span>{new Date(order.ThoiGian).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Click để xem chi tiết</span>
                <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                  #{order.MaOrder.slice(-6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Chi tiết Order */}
      {showOrderDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Chi tiết đơn hàng</h2>
                  <p className="text-white/90 text-sm">Mã đơn: {selectedOrder.MaOrder}</p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bàn</p>
                  <p className="font-bold text-gray-800">{selectedOrder.TenBan || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trạng thái</p>
                  <p className="font-bold text-gray-800">
                    {getTrangThaiText(selectedOrder.TrangThai)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nhân viên</p>
                  <p className="font-bold text-gray-800">{selectedOrder.TenNhanVien || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Thời gian</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedOrder.ThoiGian).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Chi tiết món */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <FiShoppingCart />
                  <span>Món đã đặt</span>
                </h3>
                <div className="space-y-3">
                  {selectedOrder.chiTiet && selectedOrder.chiTiet.length > 0 ? (
                    selectedOrder.chiTiet.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            {item.HinhAnh ? (
                              <img
                                src={item.HinhAnh}
                                alt={item.TenMon}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">{getFoodEmoji(item.TenMon, item.LoaiMon)}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{item.TenMon}</p>
                              <p className="text-sm text-gray-600">
                                {new Intl.NumberFormat('vi-VN').format(item.DonGia)} đ × {item.SoLuong}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-600 text-lg">
                              {new Intl.NumberFormat('vi-VN').format(item.DonGia * item.SoLuong)} đ
                            </p>
                            {item.TrangThai && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.TrangThai === 'ChoCheBien' ? '⏳ Chờ chế biến' :
                                 item.TrangThai === 'DangCheBien' ? '🔥 Đang chế biến' :
                                 item.TrangThai === 'HoanThanh' ? '✅ Hoàn thành' : item.TrangThai}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Không có món nào trong đơn hàng này</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tổng tiền */}
              {selectedOrder.chiTiet && selectedOrder.chiTiet.length > 0 && (
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {new Intl.NumberFormat('vi-VN').format(
                        selectedOrder.chiTiet.reduce((sum, item) => sum + (item.DonGia * item.SoLuong), 0)
                      )} đ
                    </span>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {selectedOrder.GhiChu && (
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold">Ghi chú:</span> {selectedOrder.GhiChu}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowOrderDetailModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Nhân viên */}
      {showNhanVienModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                    <FiUser className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Quản Lý Nhân Viên</h2>
                    <p className="text-white/80 text-sm mt-1">Cập nhật thông tin và ảnh đại diện</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNhanVienModal(false);
                    setEditingNhanVien(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-xl transition-all duration-200"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {editingNhanVien ? (
                // Form chỉnh sửa nhân viên
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      {editingNhanVien.HinhAnh ? (
                        <img
                          src={editingNhanVien.HinhAnh}
                          alt={editingNhanVien.TenNV}
                          className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-green-200 shadow-lg ${editingNhanVien.HinhAnh ? 'hidden' : ''}`}>
                        {editingNhanVien.TenNV?.charAt(0) || 'N'}
                      </div>
                      
                      {/* Nút upload ảnh */}
                      <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-200 transform hover:scale-110 z-10">
                        <FiCamera className="text-xl" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleImageUpload(e.target.files[0], editingNhanVien.MaNV);
                            }
                          }}
                          disabled={uploadingImage}
                        />
                      </label>
                      
                      {/* Nút generate ảnh random */}
                      <button
                        onClick={() => handleGenerateRandomAvatar(editingNhanVien.MaNV, editingNhanVien.TenNV)}
                        disabled={uploadingImage}
                        className="absolute bottom-0 left-0 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-200 transform hover:scale-110 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Tạo ảnh ngẫu nhiên"
                      >
                        <FiRefreshCw className={`text-xl ${uploadingImage ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    {uploadingImage && (
                      <p className="text-sm text-green-600 mt-2 flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span>Đang xử lý...</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                      Click <FiCamera className="inline mx-1" /> để upload ảnh hoặc <FiRefreshCw className="inline mx-1" /> để tạo ảnh ngẫu nhiên
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên nhân viên</label>
                    <input
                      type="text"
                      value={editingNhanVien.TenNV}
                      onChange={(e) => setEditingNhanVien({...editingNhanVien, TenNV: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                      placeholder="Nhập tên nhân viên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chức vụ</label>
                    <select
                      value={editingNhanVien.ChucVu}
                      onChange={(e) => setEditingNhanVien({...editingNhanVien, ChucVu: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 outline-none"
                    >
                      <option value="QuanLy">Quản lý</option>
                      <option value="PhucVu">Phục vụ</option>
                      <option value="Bep">Bếp</option>
                      <option value="ThuNgan">Thu ngân</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdateNhanVien({
                        TenNV: editingNhanVien.TenNV,
                        ChucVu: editingNhanVien.ChucVu,
                        HinhAnh: editingNhanVien.HinhAnh // Giữ lại ảnh hiện tại
                      })}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FiCheck className="inline mr-2" />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => setEditingNhanVien(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 font-bold transition-all duration-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                // Danh sách nhân viên
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nhanVien.map((nv) => (
                    <div
                      key={nv.MaNV}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg group"
                    >
                      <div className="flex items-center space-x-4">
                        {nv.HinhAnh ? (
                          <img
                            src={nv.HinhAnh}
                            alt={nv.TenNV}
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-200 shadow-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-green-200 shadow-md ${nv.HinhAnh ? 'hidden' : ''}`}>
                          {nv.TenNV?.charAt(0) || 'N'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{nv.TenNV}</p>
                          <p className="text-sm text-gray-600">{nv.ChucVu}</p>
                          <p className="text-xs text-gray-500 mt-1">{nv.TaiKhoan}</p>
                        </div>
                        <button
                          onClick={() => setEditingNhanVien(nv)}
                          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all duration-200 transform group-hover:scale-110 shadow-md"
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Order (giữ nguyên như cũ) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col animate-modal-appear">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                    <FiShoppingCart className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Tạo Order Mới</h2>
                    <p className="text-white/80 text-sm mt-1">Chọn bàn và thêm món ăn vào đơn hàng</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setChiTietOrder([]);
                    setSelectedBan('');
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-xl transition-all duration-200"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Select Table */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <span>🪑</span>
                  <span>Chọn bàn</span>
                </label>
                <select
                  value={selectedBan}
                  onChange={(e) => setSelectedBan(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none text-lg font-semibold bg-white"
                >
                  <option value="">-- Chọn bàn --</option>
                  {ban.map((b) => (
                    <option key={b.MaBan} value={b.MaBan}>
                      {b.TenBan} - {b.TrangThai === 'Trong' ? '✅ Trống' : '👥 Đang phục vụ'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Section */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <span>📋</span>
                        <span>Thực đơn</span>
                      </h3>
                      <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
                        {filteredMenu.length} món
                      </span>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                            selectedCategory === cat
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {categoryLabels[cat]}
                        </button>
                      ))}
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredMenu.map((mon) => (
                        <div
                          key={mon.MaMon}
                          className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center space-x-4 border border-gray-100 group hover:border-indigo-300"
                        >
                          {mon.HinhAnh ? (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <img
                                src={mon.HinhAnh}
                                alt={mon.TenMon}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center hidden">
                                <span className="text-4xl">{getFoodEmoji(mon.TenMon, mon.LoaiMon)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <span className="text-4xl">{getFoodEmoji(mon.TenMon, mon.LoaiMon)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 mb-1 truncate">{mon.TenMon}</p>
                            <p className="text-sm text-gray-500 mb-2">{mon.MoTa || 'Món ngon đặc biệt'}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-emerald-600">
                                {new Intl.NumberFormat('vi-VN').format(mon.DonGia)}đ
                              </span>
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                                {categoryLabels[mon.LoaiMon]}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddMon(mon)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 font-semibold group-hover:scale-105"
                          >
                            <FiPlus className="inline mr-1" /> Thêm
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cart Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-200 sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <span>🛒</span>
                        <span>Đơn hàng</span>
                      </h3>
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {chiTietOrder.length}
                      </span>
                    </div>

                    {chiTietOrder.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-7xl mb-4">🛒</div>
                        <p className="text-gray-500 font-semibold mb-2">Chưa có món nào</p>
                        <p className="text-gray-400 text-sm">Chọn món từ thực đơn bên trái</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4 custom-scrollbar">
                          {chiTietOrder.map((ct) => (
                            <div
                              key={ct.MaMon}
                              className="bg-white p-4 rounded-2xl shadow-md border border-gray-100"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">{getFoodEmoji(ct.TenMon, ct.LoaiMon)}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm truncate">{ct.TenMon}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Intl.NumberFormat('vi-VN').format(ct.DonGia)}đ
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveMon(ct.MaMon)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdateSoLuong(ct.MaMon, ct.SoLuong - 1)}
                                    className="bg-red-500 text-white w-8 h-8 rounded-lg hover:bg-red-600 transition-all duration-200 font-bold flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-lg w-12 text-center bg-gray-100 py-1 rounded-lg">
                                    {ct.SoLuong}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateSoLuong(ct.MaMon, ct.SoLuong + 1)}
                                    className="bg-green-500 text-white w-8 h-8 rounded-lg hover:bg-green-600 transition-all duration-200 font-bold flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                                <p className="text-sm font-bold text-emerald-600">
                                  {new Intl.NumberFormat('vi-VN').format(ct.DonGia * ct.SoLuong)}đ
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80 font-semibold">Tổng số món:</span>
                            <span className="font-bold text-xl">{chiTietOrder.reduce((sum, ct) => sum + ct.SoLuong, 0)}</span>
                          </div>
                          <div className="h-px bg-white/20 my-3"></div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/80 font-semibold">Tổng tiền:</span>
                            <span className="font-bold text-2xl">
                              {new Intl.NumberFormat('vi-VN').format(tongTien)}đ
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-4 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCreateOrder}
                disabled={!selectedBan || chiTietOrder.length === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                <FiCheck className="text-xl" />
                <span>Tạo Order</span>
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setChiTietOrder([]);
                  setSelectedBan('');
                }}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl hover:bg-gray-50 font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FiX className="text-xl" />
                <span>Hủy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #9333ea);
        }
      `}</style>
    </div>
  );
};

export default QuanLyOrder;