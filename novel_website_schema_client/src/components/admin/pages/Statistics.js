import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStories: 0,
    totalChapters: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalCoins: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [topStories, setTopStories] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    data: []
  });
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetchStatistics();
    fetchTopStories();
    fetchRecentActivities();
    fetchRevenueChart();
    fetchPopularCategories();
  }, [timeRange]);

  useEffect(() => {
    if (chartRef.current && revenueData.labels.length > 0) {
      createChart();
    }
  }, [revenueData]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/statistics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/statistics/top-stories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTopStories(response.data);
    } catch (error) {
      console.error('Error fetching top stories:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/statistics/recent-activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRecentActivities(response.data);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchPopularCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/statistics/popular-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPopularCategories(response.data);
    } catch (error) {
      console.error('Error fetching popular categories:', error);
    }
  };

  const fetchRevenueChart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/statistics/revenue-chart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue chart:', error);
      // Fallback data for demo
      setRevenueData({
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        data: [1200000, 1900000, 1500000, 2100000, 1800000, 2500000, 2200000, 2800000, 2400000, 3000000, 2700000, 3200000]
      });
    }
  };

  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: revenueData.labels,
        datasets: [{
          label: '',
          data: revenueData.data.map(value => value / 1000000), // Triệu VND
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderWidth: 1.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#222',
            bodyColor: '#222',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 0,
            displayColors: false,
            padding: 10,
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              title: function(context) {
                return `Tháng ${context[0].label}`;
              },
              label: function(context) {
                return `${context.parsed.y.toFixed(1)} triệu VND`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: '#e5e7eb',
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: { size: 13 },
              padding: 8
            },
            border: { display: true, color: '#e5e7eb' }
          },
          y: {
            grid: {
              display: true,
              color: '#e5e7eb',
              lineWidth: 1,
              drawBorder: false
            },
            ticks: {
              color: '#6b7280',
              font: { size: 12 },
              padding: 8,
              callback: function(value) { return value; }
            },
            border: { display: true, color: '#e5e7eb' },
            beginAtZero: true,
            max: undefined
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0
          }
        }
      }
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="statistics-loading">Đang tải thống kê...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-page">
        <div className="statistics-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <h1 className="statistics-title">Thống kê tổng quan</h1>
        <div className="statistics-time-filter">
          <button 
            className={`time-filter-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Tuần này
          </button>
          <button 
            className={`time-filter-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Tháng này
          </button>
          <button 
            className={`time-filter-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Năm nay
          </button>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card users">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(stats.totalUsers)}</h3>
            <p className="stat-label">Người dùng</p>
          </div>
        </div>

        <div className="stat-card stories">
          <div className="stat-icon">
            <i className="bi bi-book-fill"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(stats.totalStories)}</h3>
            <p className="stat-label">Truyện</p>
          </div>
        </div>
        
        <div className="stat-card coins">
          <div className="stat-icon">
            <i className="bi bi-coin"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(stats.totalCoins)}</h3>
            <p className="stat-label">Xu đã nạp</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="stat-label">Doanh thu</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="statistics-chart-section">
        <div className="chart-container">
          <div className="chart-title-row">
            <h2 className="chart-title">Biểu Đồ Doanh Thu</h2>
            <span className="chart-year">Năm: <b>2025</b></span>
          </div>
          <p className="chart-subtitle">Doanh Thu Theo Tháng (Triệu VND)</p>
          <div className="chart-wrapper">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Statistics */}
      <div className="statistics-details">
        <div className="statistics-section">
          <h2 className="section-title">Truyện nổi bật</h2>
          <div className="top-stories-list">
            {topStories.map((story, index) => (
              <div key={story.id} className="top-story-item">
                <div className="story-rank">{index + 1}</div>
                <div className="story-cover">
                  <img src={story.coverImage || '/default-cover.jpg'} alt={story.title} />
                </div>
                <div className="story-info">
                  <h4 className="story-title">{story.title}</h4>
                  <p className="story-author">{story.author}</p>
                  <div className="story-stats">
                    <span><i className="bi bi-eye"></i> {formatNumber(story.views)}</span>
                    <span><i className="bi bi-heart"></i> {formatNumber(story.likes)}</span>
                    <span><i className="bi bi-chat"></i> {formatNumber(story.comments)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="statistics-section">
          <h2 className="section-title">Thể loại phổ biến</h2>
          <div className="popular-categories-list-statistics">
            {popularCategories.map((category, index) => (
              <div key={category.id} className="category-item-statistics">
                <div className="category-info-statistics">
                  <div 
                    className="category-icon-statistics" 
                    style={{ backgroundColor: getCategoryColor(index) }}
                  ></div>
                  <span className="category-name-statistics">{category.name}</span>
                </div>
                <div className="category-progress-statistics">
                  <div className="progress-bar-statistics">
                    <div 
                      className="progress-fill-statistics"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: getCategoryColor(index)
                      }}
                    ></div>
                  </div>
                  <span className="category-percentage-statistics">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (index) => {
  const colors = [
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#f97316', // Orange
    '#3b82f6', // Blue
    '#10b981', // Green
    '#ef4444', // Red
    '#06b6d4'  // Teal
  ];
  return colors[index % colors.length];
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'user_register': return 'bi-person-plus';
    case 'story_create': return 'bi-book';
    case 'chapter_add': return 'bi-file-text';
    case 'payment': return 'bi-coin';
    case 'comment': return 'bi-chat';
    case 'like': return 'bi-heart';
    default: return 'bi-info-circle';
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
};

export default Statistics; 