import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css';

function toBase64Unicode(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function Dashboard() {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedStories();
    fetchLatestUpdates();
    fetchCategories();
    
    // Lấy thông tin user từ localStorage
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const avatar = localStorage.getItem('avatar');
    if (username || email) {
      setUser({ username, email, avatar });
    }
    
    setLoading(false);
  }, []);

  // Refresh user data when authentication status changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      const avatar = localStorage.getItem('avatar');
      if (username || email) {
        setUser({ username, email, avatar });
      }
    } else {
      setUser(null);
    }
  }, []);

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

  const fetchFeaturedStories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/stories/popular?limit=6');
      const data = await response.json();
      setFeaturedStories(data);
    } catch (error) {
      console.error('Error fetching featured stories:', error);
    }
  };

  const fetchLatestUpdates = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/stories/latest?limit=6');
      const data = await response.json();
      setLatestUpdates(data);
    } catch (error) {
      console.error('Error fetching latest updates:', error);
    }
  };

  // Map tên thể loại (không dấu, thường) sang class màu và icon
  const CATEGORY_STYLE_MAP = [
    { keys: ['tien-hiep', 'fantasy'], color: 'purple-blue', icon: 'bi-stars', description: 'Thế giới phép thuật và phiêu lưu' },
    { keys: ['kiem-hiep', 'action'], color: 'orange-red', icon: 'bi-lightning-fill', description: 'Hành động kịch tính và mạo hiểm' },
    { keys: ['do-thi', 'urban'], color: 'grey-blue', icon: 'bi-building', description: 'Cuộc sống hiện đại đô thị' },
    { keys: ['huyen-huyen', 'mystery'], color: 'pink-red', icon: 'bi-search', description: 'Những bí ẩn cần được giải mã' },
    { keys: ['vo-ng-du', 'game'], color: 'blue', icon: 'bi-controller', description: 'Thế giới game và ảo ảnh' },
    { keys: ['khoa-huyen', 'sci-fi'], color: 'dark-grey', icon: 'bi-rocket', description: 'Khoa học viễn tưởng, tương lai' },
    { keys: ['lang-man', 'romance', 'tinh-cam'], color: 'pink-red', icon: 'bi-heart-fill', description: 'Tình yêu ngọt ngào và lãng mạn' },
    { keys: ['hai-huoc', 'comedy'], color: 'yellow', icon: 'bi-emoji-laughing', description: 'Hài hước và vui nhộn' },
    { keys: ['kinh-di', 'horror'], color: 'dark-red', icon: 'bi-ghost', description: 'Những câu chuyện kinh dị rùng rợn' },
    { keys: ['lich-su', 'history'], color: 'purple-blue', icon: 'bi-clock-history', description: 'Truyện lịch sử và cổ đại' },
    { keys: ['trinh-tham', 'detective'], color: 'pink-red', icon: 'bi-search', description: 'Trinh thám, phá án' },
    { keys: ['drama'], color: 'orange-red', icon: 'bi-chat-left-text', description: 'Câu chuyện cuộc sống đầy cảm xúc' },
  ];
  function toKey(str) {
    return str
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function getCategoryStyle(name) {
    const key = toKey(name);
    for (const style of CATEGORY_STYLE_MAP) {
      if (style.keys.includes(key)) return style;
    }
    return { color: 'purple-blue', icon: 'bi-book', description: 'Thể loại truyện đa dạng' };
  }

  // Sửa fetchCategories để lấy động từ API mới
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories/with-count');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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
    navigate('/login');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileClick = (action) => {
    setShowProfileDropdown(false);
    if (action === 'login') {
      navigate('/login');
    } else if (action === 'register') {
      navigate('/register');
    } else if (action === 'logout') {
      handleLogout();
    }
  };

  const handleStoryClick = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  const handleStartReading = () => {
    navigate('/stories');
  };

  const handleHotStories = () => {
    navigate('/stories');
  };

  const handleCategoryPage = () => {
    navigate('/categories');
  };

  const handleBackFromCategoryPage = () => {
    navigate('/');
  };

  const handleCategoryStoryClick = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }



  return (
    <div className="dashboard-container">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="magical-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
            <div className="orb orb-4"></div>
          </div>
          <div className="light-particles"></div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-part-1">Khám phá</span>
            <span className="title-part-2">Thế giới truyện</span>
          </h1>
          <p className="hero-description">
            Hàng ngàn câu chuyện hấp dẫn đang chờ bạn khám phá. Từ tiểu thuyết lãng mạn đến phiêu lưu kỳ ảo, tất cả đều có tại đây.
          </p>
          <div className="hero-buttons">
            <button onClick={handleStartReading} className="hero-btn primary">
              Bắt đầu đọc ngay
            </button>
            <button onClick={handleHotStories} className="hero-btn secondary">
              Truyện hot nhất
            </button>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Truyện nổi bật</h2>
          <p>Những câu chuyện được yêu thích nhất</p>
        </div>
        
        <div className="featured-grid">
          {featuredStories
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3)
            .map((story, index) => (
            <div key={story.id} className="story-card" onClick={() => handleStoryClick(story.id)}>
              <div className="card-cover">
                <div className="card-header-overlay">
                  <span className="genre-tag bg-purple-600">{story.categories?.[0] || 'Fantasy'}</span>
                  <span className="rating bg-purple-600">★ {story.averageRating ? story.averageRating.toFixed(1) : '0.0'}</span>
                </div>
                <img 
                  src={story.coverImage || `https://via.placeholder.com/300x400?text=${encodeURIComponent(story.title)}`} 
                  alt={story.title}
                  onError={(e) => {
                    const svgString = `
                      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
                        <rect width="300" height="400" fill="#667eea"/>
                        <text x="150" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${story.title}</text>
                      </svg>
                    `;
                    e.target.src = `data:image/svg+xml;base64,${toBase64Unicode(svgString)}`;
                  }}
                />
              </div>
              <div className="card-content">
                <h3 className="card-title">{story.title}</h3>
                <p className="card-author">Tác giả: {story.author || 'Tác giả'}</p>
                <p className="card-description">
                  {story.description?.substring(0, 80) || 'Một câu chuyện hấp dẫn đang chờ bạn khám phá...'}...
                </p>
                <div className="card-stats">
                  <span className="stat">
                    <i className="bi bi-file-earmark-text"></i> {story.chapterCount || 0} chương
                  </span>
                  <span className="stat">
                    <i className="bi bi-star-fill"></i> {story.averageRating ? story.averageRating.toFixed(1) : '0.0'} ({story.ratingCount || 0})
                  </span>
                  <span className="stat">
                    <i className="bi bi-eye"></i> {story.viewCount ? (story.viewCount > 1000 ? (story.viewCount/1000).toFixed(1) + 'K' : story.viewCount) : (story.views ? (story.views/1000).toFixed(1) + 'K' : '0')}
                  </span>
                </div>
                <button className="read-btn">Đọc ngay</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="view-all-stories-container">
          <button className="view-all-stories-btn" onClick={handleStartReading}>
            Xem tất cả truyện →
          </button>
        </div>
      </section>

      {/* Popular Genres Section */}
      <section className="genres-section">
        <div className="section-header">
          <h2>Thể loại phổ biến</h2>
          <p>Khám phá các thể loại truyện được yêu thích</p>
        </div>
        <div className="genres-grid">
          {categories.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
              Đang tải thể loại...
            </div>
          ) : (
            categories.slice(0, 6).map((category) => {
              const style = getCategoryStyle(category.name);
              return (
                <div key={category.id} className={`genre-card ${style.color}`}>
                  <div className="genre-icon"><i className={`bi ${style.icon}`}></i></div>
                  <h3 className="genre-name">{category.name}</h3>
                  <p className="genre-description">{category.description ?? style.description}</p>
                  <span className="genre-count">{category.storyCount ?? 0} truyện</span>
                </div>
              );
            })
          )}
        </div>
        <div className="view-all-container">
          <button className="view-all-btn" onClick={handleCategoryPage}>
            Xem tất cả thể loại →
          </button>
        </div>
      </section>

      {/* Latest Updates Section */}
      <div className="updates-container">
        <section className="updates-section">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Cập nhật mới nhất</h2>
              <p>Những chương mới vừa được cập nhật</p>
            </div>
            <div className="section-header-right">
              <a href="#" className="view-all-link">Xem tất cả →</a>
            </div>
          </div>
          
          <div className="updates-grid">
            {latestUpdates.map((story, index) => (
              <div key={story.id} className="update-card" onClick={() => handleStoryClick(story.id)}>
                <div className="update-cover">
                  <img 
                    src={story.coverImage || `https://via.placeholder.com/150x200?text=${encodeURIComponent(story.title)}`} 
                    alt={story.title}
                  />
                </div>
                <div className="update-content">
                  <span className="category-tag">
                    {story.categories?.[0] || 'Action'}
                  </span>
                  <h3 className="update-title">{story.title}</h3>
                  <p className="update-author">Tác giả: {story.author || 'Tác giả'}</p>
                  <p className="update-chapter">{story.lastChapterTitle || 'Chương mới'}</p>
                  <div className="update-stats">
                    <span className="update-stat">
                      <i className="bi bi-star-fill"></i> {story.averageRating ? story.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="update-stat">
                      <i className="bi bi-heart-fill"></i> {story.likeCount || 0}
                    </span>
                    <span className="update-stat">
                      <i className="bi bi-eye"></i> {story.viewCount ? (story.viewCount > 1000 ? (story.viewCount/1000).toFixed(1) + 'K' : story.viewCount) : (story.views ? (story.views/1000).toFixed(1) + 'K' : '0')}
                    </span>
                  </div>
                  <span className="update-time">
                    <i className="bi bi-clock"></i> {index + 1} phút trước
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard; 



