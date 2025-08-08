import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LayoutAdmin.css';

function LayoutAdmin({ children }) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy username và avatar từ localStorage khi component mount
  useEffect(() => {
    const username = localStorage.getItem('adminUsername') || localStorage.getItem('username') || 'Admin';
    const avatar = localStorage.getItem('adminAvatar') || localStorage.getItem('avatar') || '';
    setAdminUsername(username);
    setAdminAvatar(avatar);
  }, []);

  const menuItems = [
    { key: 'overview', label: 'Tổng quan', icon: 'bi-grid', path: '/admin' },
    { key: 'stories', label: 'Quản lý truyện', icon: 'bi-book', path: '/admin/stories' },
    { key: 'users', label: 'Quản lý người dùng', icon: 'bi-person', path: '/admin/users' },
    { key: 'categories', label: 'Quản lý thể loại', icon: 'bi-tags', path: '/admin/categories' },
    { key: 'statistics', label: 'Thống kê', icon: 'bi-bar-chart', path: '/admin/statistics' },
    { key: 'settings', label: 'Cài đặt', icon: 'bi-gear', path: '/admin/settings' },
  ];

  const getActiveMenuKey = () => {
    const path = location.pathname;
    if (path === '/admin') return 'overview';
    if (path.startsWith('/admin/stories')) return 'stories';
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/categories')) return 'categories';
    if (path.startsWith('/admin/statistics')) return 'statistics';
    if (path.startsWith('/admin/settings')) return 'settings';
    return 'overview';
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Xử lý tìm kiếm
    console.log('Searching for:', searchTerm);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    // Xử lý đăng xuất
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminAvatar');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('avatar');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <i className="bi bi-book"></i>
            <span>TruyệnHub</span>
          </div>
          <div className="admin-divider"></div>
          <div className="admin-role">Quản trị</div>
        </div>

        <nav className="admin-nav">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${getActiveMenuKey() === item.key ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-search">
            <form onSubmit={handleSearch} className="admin-search-form">
              <i className="bi bi-search admin-search-icon"></i>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </form>
          </div>

          <div className="admin-header-right">
            <div className="admin-notifications">
              <i className="bi bi-bell"></i>
              <span className="admin-notification-dot"></span>
            </div>

            <div className="admin-user-dropdown">
              <button className="admin-user-btn" onClick={toggleUserDropdown}>
                <div className="admin-avatar">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt="Admin Avatar" />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
                <span className="admin-username">{adminUsername}</span>
                <i className="bi bi-chevron-down"></i>
              </button>

              {showUserDropdown && (
                <div className="admin-dropdown-menu">
                  <button className="admin-dropdown-menu-item">
                    <i className="bi bi-person"></i>
                    Hồ sơ
                  </button>
                  <button className="admin-dropdown-menu-item">
                    <i className="bi bi-gear"></i>
                    Cài đặt
                  </button>
                  <div className="admin-dropdown-divider"></div>
                  <button className="admin-dropdown-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
