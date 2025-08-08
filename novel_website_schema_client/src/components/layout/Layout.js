import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../common/Breadcrumb';
import CoinBalance from '../common/CoinBalance';
import '../layout/Layout.css';

function Layout({ children, onLogout, isAuthenticated }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [coins, setCoins] = useState(0);
  const [coinsLoading, setCoinsLoading] = useState(false);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const avatar = localStorage.getItem('avatar');
    if (username || email) {
      setUser({ username, email, avatar });
    }
    
    // Fetch coin balance if authenticated
    if (isAuthenticated) {
      fetchCoinBalance();
    } else {
      setCoins(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const fetchCoinBalance = async () => {
    try {
      setCoinsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setCoins(0);
        return;
      }
      
      const response = await axios.get('http://localhost:8080/api/coins/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCoins(response.data.coins || 0);
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      setCoins(0);
    } finally {
      setCoinsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('avatar');
    setUser(null);
    setCoins(0);
    onLogout();
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = (action) => {
    setShowProfileDropdown(false);
    setShowMobileMenu(false); // Đóng mobile menu khi click profile action
    if (action === 'login') {
      navigate('/login');
    } else if (action === 'register') {
      navigate('/register');
    } else if (action === 'logout') {
      handleLogout();
    } else if (action === 'profile') {
      navigate('/profile');
    }
  };

  const handleCategoryPage = () => {
    navigate('/categories');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page with search term
      navigate(`/stories?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Clear search input after search
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function để refresh coin balance (có thể gọi từ component khác)
  const refreshCoinBalance = () => {
    if (isAuthenticated) {
      fetchCoinBalance();
    }
  };

  // Expose refreshCoinBalance to window object for PaymentCallback
  useEffect(() => {
    window.refreshCoinBalance = refreshCoinBalance;
    
    // Cleanup when component unmounts
    return () => {
      delete window.refreshCoinBalance;
    };
  }, [isAuthenticated]);

  return (
    <div className="layout">
      {/* Header */}
      <div className="layout-header-container">
        <nav className="layout-dashboard-nav">
          <div className="layout-nav-brand">
            <div className="layout-logo">
              <div className="layout-logo-icon"><i className="bi-book"></i></div>
              <span>TruyệnHub</span>
            </div>
          </div>
          
          <div className="layout-nav-search">
            <form onSubmit={handleSearch} className="layout-search-form">
              <i className="bi bi-search layout-search-icon"></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm truyện, tác giả..." 
                className="layout-search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button type="submit" className="layout-search-btn">
                <i className="bi bi-arrow-right"></i>
              </button>
            </form>
          </div>
          
          <div className="layout-nav-menu">
            <button onClick={handleBackToDashboard} className="layout-nav-link">Trang chủ</button>
            <button onClick={handleCategoryPage} className="layout-nav-link">Thể loại</button>
            <button onClick={() => navigate('/stories')} className="layout-nav-link">Danh sách truyện</button>
            <button onClick={() => navigate('/ranking')} className="layout-nav-link">Bảng xếp hạng</button>
            {isAuthenticated && (
              <button onClick={() => navigate('/coin-shop')} className="layout-nav-link">Mua xu</button>
            )}
          </div>
           
          <div className="nav-icons">
            {/* Coin Balance */}
            {isAuthenticated && (
              <CoinBalance 
                isAuthenticated={isAuthenticated} 
                coins={coins} 
                loading={coinsLoading} 
              />
            )}
            
            {/* Mobile menu button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className="bi bi-list"></i>
            </button>
            
            {/* Profile dropdown */}
            <div className="profile-dropdown">
                <button 
                  className={`profile-btn ${isAuthenticated && user?.avatar ? '' : 'no-avatar'}`} 
                  onClick={toggleProfileDropdown}
                >
                  {isAuthenticated && user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="user-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-avatar');
                      }}
                    />
                  ) : (
                    <i className="bi bi-person-fill profile-icon"></i>
                  )}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown-menu">
                    {isAuthenticated ? (
                      <>
                        <div className="dropdown-header">
                          <span>Xin chào, {user?.username || 'User'}!</span>
                        </div>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleProfileClick('profile')}
                        >
                          <i className="bi bi-person"></i> Hồ sơ
                        </button>
                        <button 
                          className="dropdown-item"
                        onClick={() => navigate('/change-password')}
                        >
                          <i className="bi bi-key"></i> Đổi mật khẩu
                        </button>
                      
                        <div className="dropdown-divider"></div>
                        <button 
                          className="dropdown-item logout"
                          onClick={() => handleProfileClick('logout')}
                        >
                          <i className="bi bi-box-arrow-right"></i> Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleProfileClick('login')}
                        >
                          <i className="bi bi-box-arrow-in-right"></i> Đăng nhập
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleProfileClick('register')}
                        >
                          <i className="bi bi-person-plus"></i> Đăng ký
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
          </div>
        </nav>
        
        {/* Mobile menu dropdown */}
        {showMobileMenu && (
          <div className="mobile-menu-dropdown">
            <button onClick={() => { handleBackToDashboard(); setShowMobileMenu(false); }} className="mobile-nav-link">Trang chủ</button>
            <button onClick={() => { navigate('/stories'); setShowMobileMenu(false); }} className="mobile-nav-link">Danh sách truyện</button>
            <button onClick={() => { handleCategoryPage(); setShowMobileMenu(false); }} className="mobile-nav-link">Thể loại</button>
            <button onClick={() => { navigate('/ranking'); setShowMobileMenu(false); }} className="mobile-nav-link">Bảng xếp hạng</button>
            {isAuthenticated && (
              <button onClick={() => { navigate('/coin-shop'); setShowMobileMenu(false); }} className="mobile-nav-link">Mua xu</button>
            )}
            {isAuthenticated && (
              <div className="mobile-coin-balance">
                <i className="bi bi-coin"></i>
                <span>
                  Số xu: {coinsLoading ? '...' : coins.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <div className="logo-icon"><i className="bi bi-book"></i></div>
              <h3>TruyệnHub</h3>
              </div>
              <p>Nền tảng đọc truyện online hàng đầu với hàng ngàn câu chuyện hấp dẫn từ các tác giả tài năng.</p>
            </div>
            <div className="footer-section">
              <h4>Thể loại</h4>
              <ul>
                <li><a href="#">Tiên Hiệp</a></li>
                <li><a href="#">Kiếm Hiệp</a></li>
                <li><a href="#">Đô Thị</a></li>
                <li><a href="#">Huyền Huyễn</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <ul>
                <li><a href="#">Hướng dẫn</a></li>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">Báo lỗi</a></li>
                <li><a href="#">Góp ý</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Theo dõi</h4>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="bi bi-youtube"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 TruyệnHub. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 