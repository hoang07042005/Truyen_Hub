import React, { Component } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './ViewStory.css';

// HOC to provide navigation and params to class component
function withRouter(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    const params = useParams();
    return <Component {...props} navigate={navigate} params={params} />;
  };
}

class ViewStory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      story: null,
      chapters: [],
      stats: null,
      error: null
    };
  }

  componentDidMount() {
    this.fetchStoryData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.id !== this.props.params.id) {
      this.setState({ loading: true, error: null });
      this.fetchStoryData();
    }
  }

  fetchStoryData = async () => {
    try {
      this.setState({ loading: true, error: null });
      const token = localStorage.getItem('adminToken');
      const { id } = this.props.params;
      
      // Fetch story details
      const storyResponse = await axios.get(`http://localhost:8080/api/admin/stories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch story statistics
      const statsResponse = await axios.get(`http://localhost:8080/api/admin/stories/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch chapters
      const chaptersResponse = await axios.get(`http://localhost:8080/api/chapters/admin/story/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.setState({
        story: storyResponse.data,
        stats: statsResponse.data,
        chapters: chaptersResponse.data || [],
        loading: false
      });
    } catch (error) {
      console.error('Error fetching story data:', error);
      this.setState({
        error: 'Lỗi khi tải thông tin truyện: ' + (error.response?.data?.message || error.message),
        loading: false
      });
    }
  };

  formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  getStatusBadge = (status) => {
    const statusConfig = {
      'ONGOING': { text: 'Đang cập nhật', class: 'status-ongoing' },
      'COMPLETED': { text: 'Hoàn thành', class: 'status-completed' },
      'PAUSED': { text: 'Tạm dừng', class: 'status-paused' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  formatNumber = (num) => {
    return num ? num.toLocaleString('vi-VN') : '0';
  };

  handleBackClick = () => {
    this.props.navigate('/admin/stories');
  };

  handleEditClick = () => {
    const { story } = this.state;
    this.props.navigate(`/admin/edit-story/${story.id}`);
  };

  handleAddChapter = () => {
    const { story } = this.state;
    this.props.navigate(`/admin/stories/${story.id}/chapters/add`);
  };

  handleViewChapter = (chapterId) => {
    this.props.navigate(`/admin/stories/${this.props.params.id}/chapters/${chapterId}/view`);
  };

  handleEditChapter = (chapterId) => {
    this.props.navigate(`/admin/stories/${this.props.params.id}/chapters/${chapterId}/edit`);
  };

  handleToggleChapterLock = async (chapterId, isLocked) => {
    try {
      const token = localStorage.getItem('adminToken');
      const action = isLocked ? 'unlock' : 'lock';
      
      await axios.patch(`http://localhost:8080/api/admin/chapters/${chapterId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh chapters data
      this.fetchStoryData();
      
      // Show success message
      alert(`Đã ${isLocked ? 'mở khóa' : 'khóa'} chương thành công!`);
    } catch (error) {
      console.error('Error toggling chapter lock:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái khóa chương');
    }
  };

  handleSetChapterPrice = async (chapterId, currentPrice) => {
    const newPrice = prompt('Nhập số xu cần thiết để mở khóa chương:', currentPrice || 10);
    
    if (newPrice === null) return; // User cancelled
    
    const price = parseInt(newPrice);
    if (isNaN(price) || price < 0) {
      alert('Vui lòng nhập số xu hợp lệ (>= 0)');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.patch(`http://localhost:8080/api/admin/chapters/${chapterId}/price`, {
        coinsRequired: price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh chapters data
      this.fetchStoryData();
      
      alert('Đã cập nhật giá chương thành công!');
    } catch (error) {
      console.error('Error setting chapter price:', error);
      alert('Có lỗi xảy ra khi cập nhật giá chương');
    }
  };

  handleViewAllChapters = () => {
    const { story } = this.state;
    this.props.navigate(`/admin/stories/${story.id}/chapters`);
  };

  handleAddFirstChapter = () => {
    const { story } = this.state;
    this.props.navigate(`/admin/stories/${story.id}/chapters/add`);
  };

  renderLoadingSpinner() {
    return (
      <div className="view-story-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Đang tải thông tin truyện...</p>
        </div>
      </div>
    );
  }

  renderErrorMessage() {
    const { error } = this.state;
    return (
      <div className="view-story-container">
        <div className="error-message" style={{ textAlign: 'left' }}>
          <i className="bi bi-exclamation-triangle"></i>
          <p style={{ textAlign: 'left' }}>{error}</p>
        </div>
      </div>
    );
  }

  renderStoryCover() {
    const { story } = this.state;
    return (
      <div className="story-cover-section">
        <div className="story-cover">
          {story.coverImage ? (
            <img 
              src={story.coverImage.startsWith('http') ? story.coverImage : `http://localhost:8080/uploads/story-covers/${story.coverImage}`}
              alt={story.title}
              className="cover-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="cover-placeholder" style={{ textAlign: 'left' }}>
              <i className="bi bi-image"></i>
              <span style={{ textAlign: 'left' }}>Không có ảnh bìa</span>
            </div>
          )}
          <div className="cover-placeholder" style={{display: 'none', textAlign: 'left'}}>
            <i className="bi bi-image"></i>
            <span style={{ textAlign: 'left' }}>Không thể tải ảnh</span>
          </div>
        </div>
      </div>
    );
  }

  renderStoryDetails() {
    const { story } = this.state;
    return (
      <div className="story-details">
        <div className="story-title-section">
          <h2>{story.title}</h2>
          {this.getStatusBadge(story.status)}
        </div>
        
        <div className="story-meta">
          <div className="meta-item">
            <i className="bi bi-person"></i>
            <span>Tác giả: {story.author || 'Không xác định'}</span>
          </div>
          <div className="meta-item">
            <i className="bi bi-calendar"></i>
            <span>Ngày tạo: {this.formatDate(story.createdAt)}</span>
          </div>
          <div className="meta-item">
            <i className="bi bi-clock"></i>
            <span>Cập nhật: {this.formatDate(story.updatedAt)}</span>
          </div>
          <div className="meta-item">
            <i className="bi bi-book"></i>
            <span>Số chương: {story.chapterCount || 0}</span>
          </div>
        </div>

        {story.description && (
          <div className="story-description">
            <h3>Mô tả</h3>
            <p>{story.description}</p>
          </div>
        )}

        {story.categories && story.categories.length > 0 && (
          <div className="story-categories">
            <h3>Thể loại</h3>
            <div className="category-tags">
              {story.categories.map((category, index) => (
                <span key={index} className="category-tag">{category}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  renderStatistics() {
    const { story } = this.state;
    return (
      <div className="story-stats-section">
        <h3>Thống kê</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-eye"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{this.formatNumber(story.viewCount)}</div>
              <div className="stat-label">Lượt xem</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-star-fill"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{story.averageRating?.toFixed(1) || '0.0'}</div>
              <div className="stat-label">Đánh giá trung bình</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-star"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{this.formatNumber(story.ratingCount)}</div>
              <div className="stat-label">Số lượt đánh giá</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-heart"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{this.formatNumber(story.likeCount)}</div>
              <div className="stat-label">Lượt thích</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderChaptersList() {
    const { chapters, story } = this.state;
    return (
      <div className="chapters-section">
        <div className="section-header">
          <h3>Danh sách chương ({chapters.length})</h3>
          <button 
            className="add-chapter-btn"
            onClick={this.handleAddChapter}
          >
            <i className="bi bi-plus"></i>
            Thêm chương
          </button>
        </div>
        
        <div className="chapters-list">
          {chapters.slice(0, 10).map((chapter, index) => (
            <div key={chapter.id} className="chapter-item">
              <div className="chapter-info" style={{ textAlign: 'left' }}>
                <div className="chapter-header">
                  <span className="chapter-number" style={{ textAlign: 'left', display: 'block' }}>
                    Chương {chapter.chapterNumber}
                  </span>
                  <span className="chapter-title" style={{ textAlign: 'left', display: 'block' }}>
                    {chapter.title}
                  </span>
                </div>
                
                {/* Chapter Lock Status */}
                <div className="chapter-lock-status">
                  {chapter.isLocked ? (
                    <span className="lock-badge locked">
                      <i className="bi bi-lock-fill"></i>
                      Khóa ({chapter.coinsRequired || 10} xu)
                    </span>
                  ) : (
                    <span className="lock-badge unlocked">
                      <i className="bi bi-unlock-fill"></i>
                      Miễn phí
                    </span>
                  )}
                </div>
              </div>
              
              <div className="chapter-meta">
                <span className="chapter-date">{this.formatDate(chapter.createdAt)}</span>
                <div className="chapter-actions">
                  <button 
                    className="view-chapter-btn"
                    onClick={() => this.handleViewChapter(chapter.id)}
                    title="Xem chương"
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                  <button 
                    className="edit-chapter-btn"
                    onClick={() => this.handleEditChapter(chapter.id)}
                    title="Sửa chương"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  
                  {/* Lock/Unlock Button */}
                  <button 
                    className={`lock-chapter-btn ${chapter.isLocked ? 'unlock' : 'lock'}`}
                    onClick={() => this.handleToggleChapterLock(chapter.id, chapter.isLocked)}
                    title={chapter.isLocked ? 'Mở khóa chương' : 'Khóa chương'}
                  >
                    <i className={`bi ${chapter.isLocked ? 'bi-unlock-fill' : 'bi-lock-fill'}`}></i>
                  </button>
                  
                  {/* Set Price Button */}
                  <button 
                    className="price-chapter-btn"
                    onClick={() => this.handleSetChapterPrice(chapter.id, chapter.coinsRequired)}
                    title="Đặt giá chương"
                  >
                    <i className="bi bi-coin"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {chapters.length > 10 && (
            <div className="view-more-chapters" style={{ textAlign: 'left' }}>
              <button onClick={this.handleViewAllChapters}>
                Xem tất cả {chapters.length} chương
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  renderNoChapters() {
    return (
      <div className="no-chapters" style={{ textAlign: 'left' }}>
        <i className="bi bi-book"></i>
        <p style={{ textAlign: 'left' }}>Chưa có chương nào</p>
        <button 
          className="add-first-chapter-btn"
          onClick={this.handleAddFirstChapter}
        >
          <i className="bi bi-plus"></i>
          Thêm chương đầu tiên
        </button>
      </div>
    );
  }

  render() {
    const { loading, story, chapters, error } = this.state;

    if (loading) {
      return this.renderLoadingSpinner();
    }

    if (error || !story) {
      return this.renderErrorMessage();
    }

    return (
      <div className="view-story-container">
        <div className="view-story-header">
          <button 
            className="back-btn"
            onClick={this.handleBackClick}
          >
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>
          <h1>Chi tiết truyện</h1>
          <div className="header-actions">
            <button 
              className="edit-btn"
              onClick={this.handleEditClick}
            >
              <i className="bi bi-pencil"></i>
              Sửa truyện
            </button>
          </div>
        </div>

        <div className="view-story-content">
          <div className="story-main-info">
            {this.renderStoryCover()}
            {this.renderStoryDetails()}
          </div>

          {this.renderStatistics()}

          {chapters.length > 0 ? this.renderChaptersList() : this.renderNoChapters()}
        </div>
      </div>
    );
  }
}

export default withRouter(ViewStory); 