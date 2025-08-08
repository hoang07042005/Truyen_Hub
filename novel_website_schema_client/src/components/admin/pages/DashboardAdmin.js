import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardAdmin.css';

function StatCard({ icon, color, value, label, percent }) {
  return (
    <div className="stat-card-dashboard">
      <div className="stat-card-row">
        <div className="stat-card-icon-square" style={{ backgroundColor: color + '15', color }}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div className="stat-card-percent" style={{ color: '#22c55e' }}>{percent > 0 ? `+${percent}%` : `${percent}%`}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function DashboardAdmin() {
  const [statsData, setStatsData] = useState({
    totalStories: 0,
    activeUsers: 0,
    dailyReads: 0,
    monthlyRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topStories, setTopStories] = useState([]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    data: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        
        // Fetch statistics
        const statsResponse = await axios.get('http://localhost:8080/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch recent activities
        const activitiesResponse = await axios.get('http://localhost:8080/api/admin/dashboard/activities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch top stories
        const storiesResponse = await axios.get('http://localhost:8080/api/admin/dashboard/top-stories', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch revenue chart data
        const revenueResponse = await axios.get('http://localhost:8080/api/admin/statistics/revenue-chart', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStatsData(statsResponse.data);
        setRecentActivities(activitiesResponse.data);
        setTopStories(storiesResponse.data);
        setRevenueData(revenueResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard');
        
        // Fallback to mock data if API fails
        setStatsData({
          totalStories: 0,
          activeUsers: 0,
          dailyReads: 0,
          monthlyRevenue: 0
        });
        setRecentActivities([]);
        setTopStories([]);
        setRevenueData({
          labels: [],
          data: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Định nghĩa các hàm format và tính phần trăm tăng trưởng
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCurrentMonthRevenue = () => {
    if (revenueData.data && revenueData.data.length > 0) {
      const currentMonth = new Date().getMonth(); // 0-11
      return revenueData.data[currentMonth] || 0;
    }
    return 0;
  };

  const getPrevMonthRevenue = () => {
    if (revenueData.data && revenueData.data.length > 1) {
      const currentMonth = new Date().getMonth();
      return revenueData.data[currentMonth - 1] || 0;
    }
    return 0;
  };

  const getRevenueGrowth = () => {
    const prev = getPrevMonthRevenue();
    const curr = getCurrentMonthRevenue();
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  // Tương tự, bạn có thể thêm các hàm tính phần trăm tăng trưởng cho các chỉ số khác nếu có dữ liệu

  // Card data
  const statCards = [
    {
      icon: 'bi-book',
      color: '#3b82f6',
      value: statsData.totalStories.toLocaleString(),
      label: 'Tổng số truyện',
      percent: 12 // TODO: thay bằng dữ liệu thực nếu có
    },
    {
      icon: 'bi-person',
      color: '#10b981',
      value: statsData.activeUsers.toLocaleString(),
      label: 'Người dùng hoạt động',
      percent: 8 // TODO: thay bằng dữ liệu thực nếu có
    },
    {
      icon: 'bi-eye',
      color: '#8b5cf6',
      value: statsData.dailyReads.toLocaleString(),
      label: 'Lượt đọc hôm nay',
      percent: 15 // TODO: thay bằng dữ liệu thực nếu có
    },
    {
      icon: 'bi-currency-dollar',
      color: '#f59e42',
      value: formatCurrency(getCurrentMonthRevenue()),
      label: 'Doanh thu tháng',
      percent: getRevenueGrowth()
    }
  ];

  const getActivityColor = (type) => {
    switch (type) {
      case 'approval': return '#007bff';
      case 'user': return '#28a745';
      case 'report': return '#dc3545';
      case 'pending': return '#007bff';
      case 'comment': return '#17a2b8';
      case 'rating': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-header">
          <h1>Tổng quan</h1>
          <p>Đang tải dữ liệu...</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-header">
          <h1>Tổng quan</h1>
          <p>Chào mừng bạn quay lại! Đây là tình hình hoạt động của hệ thống.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard-header">
        <h1>Tổng quan</h1>
        <p>Chào mừng bạn quay lại! Đây là tình hình hoạt động của hệ thống.</p>
      </div>

      {/* Stats Cards */}
      <div className="stat-cards-dashboard-row">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Revenue Chart Section */}
      <div className="admin-revenue-section">
        <div className="admin-section-header">
          <h2>Doanh thu theo tháng</h2>
          <span className="admin-revenue-year">Năm: 2025</span>
        </div>
        <div className="admin-revenue-chart">
          {revenueData.labels && revenueData.labels.length > 0 ? (
            <div className="admin-revenue-bars">
              {revenueData.labels.map((label, index) => (
                <div key={index} className="admin-revenue-bar-item">
                  <div className="admin-revenue-bar-label">{label}</div>
                  <div className="admin-revenue-bar-container">
                    <div 
                      className="admin-revenue-bar-fill"
                      style={{ 
                        height: `${(revenueData.data[index] / Math.max(...revenueData.data)) * 100}%`,
                        backgroundColor: 'rgb(174 144 242)'
                      }}
                    ></div>
                  </div>
                  <div className="admin-revenue-bar-value">
                    {formatCurrency(revenueData.data[index])}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              Không có dữ liệu doanh thu
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="admin-content-grid">
        {/* Recent Activities */}
        <div className="admin-activity-section">
          <div className="admin-section-header">
            <h2>Hoạt động gần đây</h2>
            <button className="admin-view-all-btn">Xem tất cả →</button>
          </div>
          <div className="admin-activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="admin-activity-item">
                  <div 
                    className="admin-activity-bullet"
                    style={{ backgroundColor: getActivityColor(activity.type) }}
                  ></div>
                  <div className="admin-activity-content">
                    <p className="admin-activity-message">{activity.message}</p>
                    <span className="admin-activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                Không có hoạt động gần đây
              </div>
            )}
          </div>
        </div>

        {/* Top Stories */}
        <div className="admin-stories-section">
          <div className="admin-section-header">
            <h2>Truyện được đọc nhiều nhất</h2>
            <button className="admin-view-all-btn">Xem chi tiết →</button>
          </div>
          <div className="admin-stories-list">
            {topStories.length > 0 ? (
              topStories.slice(0, 5).map((story, index) => (
                <div key={index} className="admin-story-item">
                  <div className="admin-story-rank">{index + 1}</div>
                  <div className="admin-story-info">
                    <h3 className="admin-story-title">{story.title}</h3>
                    <p className="admin-story-author">{story.author}</p>
                  </div>
                  <div className="admin-story-meta">
                      <span className="admin-story-rating">{story.averageRating?.toFixed(1) || 'N/A'}</span>
                      <span className="admin-story-reads">{story.viewCount?.toLocaleString() || 0} lượt đọc</span>
                    </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                Không có dữ liệu truyện
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin; 