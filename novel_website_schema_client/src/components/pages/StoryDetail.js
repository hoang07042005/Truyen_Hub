import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../pages/StoryDetail.css';

function StoryDetail() {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [chapterSearch, setChapterSearch] = useState('');
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' hoặc 'comments'
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [readChapters, setReadChapters] = useState([]);
  const [lastReadChapter, setLastReadChapter] = useState(null);
  const [comments, setComments] = useState([]); // Thêm state để lưu bình luận
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [unlockedChapters, setUnlockedChapters] = useState([]);

  useEffect(() => {
    fetchStoryDetail();
    fetchChapters();
    fetchCategories();
    checkBookmarkStatus();
    fetchReadChapters();
    fetchComments(); // Gọi API lấy bình luận
    fetchStoryStats(); // Gọi API lấy thống kê truyện
    checkUserRating(); // Kiểm tra đánh giá của user
    checkUserLike(); // Kiểm tra like của user
    fetchRatings(); // Gọi API lấy danh sách đánh giá
    fetchUnlockedChapters(); // Gọi API lấy danh sách chương đã mở khóa
  }, [storyId]);

  const fetchStoryDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`http://localhost:8080/api/stories/${storyId}`, { headers });
      setStory(response.data);
    } catch (err) {
      setError('Lỗi khi tải thông tin truyện');
      console.error('Error fetching story detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    setChaptersLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/chapters/story/${storyId}`);
      setChapters(response.data);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setChaptersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const checkBookmarkStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/bookmarks/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(res.data === true);
    } catch (err) {
      setIsBookmarked(false);
    }
  };

  const handleToggleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginNotice(true);
      setTimeout(() => setShowLoginNotice(false), 2500);
      return;
    }
    setBookmarkLoading(true);
    try {
      if (!isBookmarked) {
        await axios.post(`http://localhost:8080/api/bookmarks/${storyId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(true);
      } else {
        await axios.delete(`http://localhost:8080/api/bookmarks/${storyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(false);
      }
    } catch (err) {
      alert('Có lỗi xảy ra!');
    }
    setBookmarkLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleChapterClick = (chapter) => {
    // Kiểm tra xem chương có bị khóa và chưa mở khóa không
    const isActuallyLocked = chapter.isLocked && !unlockedChapters.includes(chapter.id);
    
    if (isActuallyLocked) {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowLoginNotice(true);
        setTimeout(() => setShowLoginNotice(false), 2500);
        return;
      }
      
      // Hiển thị thông báo yêu cầu mở khóa
      const confirmUnlock = window.confirm(
        `Chương này đã bị khóa và cần ${chapter.coinsRequired || 10} xu để mở khóa.\n\nBạn có muốn mở khóa chương này không?`
      );
      
      if (confirmUnlock) {
        // Chuyển đến trang mở khóa chương
        navigate(`/stories/${storyId}/chapters/${chapter.id}/unlock`);
      }
    } else {
      // Chương không bị khóa hoặc đã mở khóa, chuyển đến trang đọc bình thường
      navigate(`/stories/${storyId}/chapters/${chapter.id}`);
    }
  };

  const handleReadFirstChapter = () => {
    if (chapters.length > 0) {
      // Nếu có chương đã đọc dở, đọc tiếp chương đó
      if (lastReadChapter) {
        navigate(`/stories/${storyId}/chapters/${lastReadChapter.chapterId}`);
      } else {
        // Nếu chưa đọc chương nào, đọc chương đầu tiên
        const firstChapter = chapters.find(ch => ch.chapterNumber === 1);
        if (firstChapter) {
          navigate(`/stories/${storyId}/chapters/${firstChapter.id}`);
        }
      }
    }
  };

  const handleReadLatestChapter = () => {
    if (chapters.length > 0) {
      const latestChapter = chapters.sort((a, b) => b.chapterNumber - a.chapterNumber)[0];
      if (latestChapter) {
        navigate(`/stories/${storyId}/chapters/${latestChapter.id}`);
      }
    }
  };

  const handleReadFromBeginning = () => {
    if (chapters.length > 0) {
      const firstChapter = chapters.find(ch => ch.chapterNumber === 1);
      if (firstChapter) {
        navigate(`/stories/${storyId}/chapters/${firstChapter.id}`);
      }
    }
  };

  const handleBack = () => {
    navigate('/stories');
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const filteredAndSortedChapters = chapters
    .filter(chapter => 
      chapterSearch === '' || 
      chapter.chapterNumber.toString().includes(chapterSearch)
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.chapterNumber - a.chapterNumber;
      } else {
        return a.chapterNumber - b.chapterNumber;
      }
    });

  const fetchReadChapters = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:8080/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data.filter(item => item.storyId === parseInt(storyId));
      if (items.length > 0) {
        // Tìm entry có lastReadAt mới nhất
        const latest = items.reduce((a, b) =>
          new Date(a.lastReadAt) > new Date(b.lastReadAt) ? a : b
        );
        setReadChapters([latest.chapterId]);
        setLastReadChapter(latest);
      } else {
        setReadChapters([]);
        setLastReadChapter(null);
      }
    } catch (err) {
      setReadChapters([]);
      setLastReadChapter(null);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/comments/story/${storyId}`);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchStoryStats = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/stories/${storyId}/stats`);
      const stats = response.data;
      setLikeCount(stats.likeCount || 0);
      setRatingCount(stats.ratingCount || 0);
      setAverageRating(stats.averageRating || 0);
      setViewCount(stats.viewCount || 0);
    } catch (err) {
      console.error('Error fetching story stats:', err);
    }
  };

  const checkUserRating = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/ratings/story/${storyId}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setUserRating(response.data.rating);
        setRatingComment(response.data.comment || '');
      }
    } catch (err) {
      // User chưa đánh giá
    }
  };

  const checkUserLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/likes/story/${storyId}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(response.data === true);
    } catch (err) {
      setIsLiked(false);
    }
  };

  const fetchRatings = async () => {
    try {
      console.log('Fetching ratings for story:', storyId);
      const response = await axios.get(`http://localhost:8080/api/ratings/story/${storyId}`);
      console.log('Ratings response:', response.data);
      setRatings(response.data || []);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      console.error('Error details:', err.response?.data);
      setRatings([]);
    }
  };

  const fetchUnlockedChapters = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`http://localhost:8080/api/chapters/unlock/story/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unlockedChapterIds = response.data.unlockedChapters.map(item => item.chapterId);
      setUnlockedChapters(unlockedChapterIds);
      console.log('Unlocked chapters:', unlockedChapterIds);
    } catch (err) {
      console.error('Error fetching unlocked chapters:', err);
      setUnlockedChapters([]);
    }
  };

  // Thêm hàm tính thời gian tương đối
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000); // giây
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff/60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff/3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff/86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff/2592000)} tháng trước`;
    return `${Math.floor(diff/31536000)} năm trước`;
  }

  if (loading) {
    return (
      <div className="story-detail-container">
        <div className="loading">Đang tải thông tin truyện...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-detail-container">
        <div className="error-message">{error}</div>
        <button onClick={handleBack} className="back-btn">← Quay lại</button>
      </div>
    );
  }

  const handleRating = async (ratingValue) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginNotice(true);
      setTimeout(() => setShowLoginNotice(false), 2500);
      return;
    }

    try {
      await axios.post(`http://localhost:8080/api/ratings/story/${storyId}`, {
        rating: ratingValue,
        comment: ratingComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserRating(ratingValue);
      fetchStoryStats(); // Refresh stats
      fetchRatings(); // Refresh ratings list
      alert('Đánh giá thành công!');
    } catch (err) {
      alert('Lỗi khi đánh giá: ' + (err.response?.data || 'Lỗi không xác định'));
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginNotice(true);
      setTimeout(() => setShowLoginNotice(false), 2500);
      return;
    }

    try {
      if (!isLiked) {
        await axios.post(`http://localhost:8080/api/likes/story/${storyId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      } else {
        await axios.delete(`http://localhost:8080/api/likes/story/${storyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    } catch (err) {
      alert('Lỗi khi thích/bỏ thích: ' + (err.response?.data || 'Lỗi không xác định'));
    }
  };

  if (!story) {
    return (
      <div className="story-detail-container">
        <div className="error-message">Không tìm thấy truyện</div>
        <button onClick={handleBack} className="back-btn">← Quay lại</button>
      </div>
    );
  }

  return (
    <div className="story-detail-container">
      {showLoginNotice && (
        <div className="login-notice-popup">Bạn cần đăng nhập để sử dụng chức năng này!</div>
      )}
      <div className="story-detail-main-modern">
        {/* Card trái: Ảnh, tiêu đề, tác giả, stats, nút, tags */}
        <aside className="story-detail-left-card">
          <div className="story-detail-cover-modern">
            <img 
              src={story.coverImage || 'https://via.placeholder.com/300x400/6b7280/ffffff?text=No+Cover'} 
              alt={story.title}
              className="story-detail-cover-img"
              onError={e => { e.target.src = 'https://via.placeholder.com/300x400/6b7280/ffffff?text=No+Cover'; }}
            />
          </div>
          <div className="story-detail-title-modern">{story.title}</div>
          <div className="story-detail-author-modern">Tác giả: {story.author || 'Không xác định'}</div>
          <div className="story-detail-stats-modern">
            <div className="story-detail-stat-col">
              <div className="story-detail-stat-value highlight-purple">{averageRating.toFixed(1)}</div>
              <div className="story-detail-stat-label">Đánh giá ({ratingCount})</div>
            </div>
            <div className="story-detail-stat-col">
              <div className="story-detail-stat-value highlight-blue">{chapters.length}</div>
              <div className="story-detail-stat-label">Chương</div>
            </div>
          </div>
          <div className="story-detail-stats-modern">
            <div className="story-detail-stat-col">
              <div className="story-detail-stat-value highlight-green">{viewCount > 1000 ? (viewCount/1000).toFixed(1) + 'K' : viewCount}</div>
              <div className="story-detail-stat-label">Lượt đọc</div>
            </div>
            <div className="story-detail-stat-col">
              <div className="story-detail-stat-value highlight-red">{likeCount}</div>
              <div className="story-detail-stat-label">Lượt thích</div>
            </div>
          </div>
          <button className="story-detail-read-btn" onClick={handleReadFirstChapter}>
            {lastReadChapter ? 'Đọc tiếp' : 'Đọc từ đầu'}
          </button>
          <button
            className={`story-detail-like-btn${isLiked ? ' liked' : ''}`}
            onClick={handleLike}
          >
            {isLiked ? (
              <>
                <i className="bi bi-heart-fill" style={{color: '#e91e63'}}></i> Đã thích
              </>
            ) : (
              <>
                <i className="bi bi-heart"></i> Thích
              </>
            )}
          </button>
          <button
            className={`story-detail-fav-btn${isBookmarked ? ' bookmarked' : ''}`}
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
          >
            {isBookmarked ? (
              <>
                <i className="bi bi-check-circle-fill" style={{color: '#4caf50'}}></i> Đã Theo Dõi
              </>
            ) : (
              <>
                <i className="bi bi-bookmark"></i> Theo Dõi
              </>
            )}
          </button>
          <div className="story-detail-info-list">
            <div><b>Thể loại:</b> <span className="story-detail-info-value ">{story.genre || 'Mystery'}</span></div>
            <div><b>Trạng thái:</b> <span className="story-detail-info-value status-updating">{story.status === 'ONGOING' ? 'Đang cập nhật' : 'Hoàn thành'}</span></div>
            <div><b>Lượt bookmark:</b> <span className="story-detail-info-value">{story.bookmarks ? (story.bookmarks/1000).toFixed(1) + 'K' : '28.9K'}</span></div>
          </div>
          <div className="story-detail-tags-list">
            {(story.tags || ['Mystery','Thám tử','Tội phạm','Điều tra','Hành động']).map((tag, idx) => (
              <span key={idx} className="story-detail-tag">{tag}</span>
            ))}
          </div>
        </aside>

        {/* Card phải: Giới thiệu, tabs, danh sách chương, đánh giá */}
        <section className="story-detail-right-card">
          <div className="story-detail-intro-card">
            <div className="story-detail-intro-title">Giới thiệu</div>
            <div className="story-detail-intro-content">
              {story.description ? (
                <span>{story.description.length > 300 ? story.description.slice(0, 300) + '...' : story.description}</span>
              ) : (
                <span className="no-description">Chưa có mô tả cho truyện này.</span>
              )}
              {story.description && story.description.length > 300 && (
                <span className="story-detail-intro-more">Xem thêm</span>
              )}
            </div>
          </div>

          <div className="story-detail-tabs">
            <button
              className={`story-detail-tab${activeTab === 'chapters' ? ' active' : ''}`}
              onClick={() => setActiveTab('chapters')}
            >
              Danh sách chương ({chapters.length})
            </button>
            <button
              className={`story-detail-tab${activeTab === 'comments' ? ' active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Bình luận
            </button>
            <button
              className={`story-detail-tab${activeTab === 'rating' ? ' active' : ''}`}
              onClick={() => setActiveTab('rating')}
            >
              Đánh giá
            </button>
          </div>

          {activeTab === 'chapters' && (
            <div className="story-detail-chapter-list-modern">
              {chaptersLoading ? (
                <div className="chapters-loading">Đang tải danh sách chương...</div>
              ) : filteredAndSortedChapters.length > 0 ? (
                filteredAndSortedChapters.slice(0, 10).map(chapter => {
                  const isActuallyLocked = chapter.isLocked && !unlockedChapters.includes(chapter.id);
                  const isUnlocked = chapter.isLocked && unlockedChapters.includes(chapter.id);
                  
                  return (
                    <div 
                      key={chapter.id} 
                      className={`story-detail-chapter-row ${isActuallyLocked ? 'locked' : ''} ${isUnlocked ? 'unlocked' : ''}`}
                      onClick={() => handleChapterClick(chapter)}
                    >
                      <div className="story-detail-chapter-title">
                        {chapter.chapterNumber}: {chapter.title}
                        {readChapters.includes(chapter.id) && (
                          <i className="bi bi-clock-history" style={{marginLeft: 8, color: '#4caf50'}} title="Đã đọc"></i>
                        )}
                        {isActuallyLocked && (
                          <span className="chapter-lock-badge">
                            <i className="bi bi-lock-fill"></i>
                            {chapter.coinsRequired || 10} xu
                          </span>
                        )}
                        {isUnlocked && (
                          <span className="chapter-unlock-badge">
                            <i className="bi bi-unlock-fill"></i>
                            Đã mở khóa
                          </span>
                        )}
                      </div>
                      <div className="story-detail-chapter-meta">
                        <span>{formatDate(chapter.createdAt)}</span>
                        <span>• 10 phút đọc</span>
                      </div>
                      <span className="story-detail-chapter-arrow">
                        {isActuallyLocked ? <i className="bi bi-lock-fill"></i> : '→'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="no-chapters">Chưa có chương nào cho truyện này.</div>
              )}
              {filteredAndSortedChapters.length > 10 && (
                <div className="story-detail-chapter-more">Xem thêm chương</div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="story-detail-comment-list-modern">
              {/* Hiển thị danh sách bình luận */}
              {comments && comments.length > 0 ? (
                <ul className="story-detail-comment-list">
                  {comments.map(c => (
                    <li key={c.id} className="story-detail-comment-item">
                      <div className="story-detail-comment-avatar-wrap">
                        <img src={c.avatar || 'https://via.placeholder.com/32x32/6b7280/ffffff?text=U'} alt={c.username} className="story-detail-comment-avatar" />
                      </div>
                      <div className="story-detail-comment-content-block">
                        <div className="story-detail-comment-meta">
                          <span className="story-detail-comment-username">{c.username}</span>
                          <span className="story-detail-comment-time">{timeAgo(c.createdAt)}</span>
                        </div>
                        <div className="story-detail-comment-content">{c.content}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{color:'#888', padding:'1rem'}}>Chưa có bình luận nào.</div>
              )}
              {/* Thêm form gửi bình luận nếu muốn */}
            </div>
          )}

          {activeTab === 'rating' && (
            <div className="story-detail-rating-modern">
              <div className="story-detail-rating-summary">
                <div className="story-detail-rating-average">
                  <div className="story-detail-rating-score">{averageRating.toFixed(1)}</div>
                  <div className="story-detail-rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star} 
                        className={`bi ${star <= averageRating ? 'bi-star-fill' : 'bi-star'}`}
                        style={{color: star <= averageRating ? '#ffc107' : '#ddd'}}
                      ></i>
                    ))}
                  </div>
                  <div className="story-detail-rating-count">{ratingCount} đánh giá</div>
                </div>
              </div>
              
              <div className="story-detail-rating-form">
                <h4>Đánh giá của bạn</h4>
                <div className="story-detail-rating-stars-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <i 
                      key={star} 
                      className={`bi ${star <= userRating ? 'bi-star-fill' : 'bi-star'}`}
                      style={{color: star <= userRating ? '#ffc107' : '#ddd', cursor: 'pointer'}}
                      onClick={() => setUserRating(star)}
                    ></i>
                  ))}
                </div>
                <textarea
                  placeholder="Viết nhận xét của bạn (tùy chọn)..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="story-detail-rating-comment"
                  rows="3"
                />
                <button 
                  className="story-detail-rating-submit"
                  onClick={() => handleRating(userRating)}
                  disabled={userRating === 0}
                >
                  Gửi đánh giá
                </button>
              </div>

              {/* Danh sách đánh giá của người dùng khác */}
              <div className="story-detail-ratings-list">
                <h4>Đánh giá từ độc giả ({ratings.length})</h4>
                {ratings.length > 0 ? (
                  <div className="story-detail-ratings-container">
                    {ratings.map(rating => (
                      <div key={rating.id} className="story-detail-rating-item">
                        <div className="story-detail-rating-header">
                          <div className="story-detail-rating-user">
                            <img 
                              src={rating.user?.avatar || 'https://via.placeholder.com/32x32/6b7280/ffffff?text=U'} 
                              alt={rating.user?.username || 'User'} 
                              className="story-detail-rating-avatar"
                              onError={e => { e.target.src = 'https://via.placeholder.com/32x32/6b7280/ffffff?text=U'; }}
                            />
                            <span className="story-detail-rating-username">
                              {rating.user?.username || 'Người dùng'}
                            </span>
                          </div>
                          <div className="story-detail-rating-stars-display">
                            {[1, 2, 3, 4, 5].map(star => (
                              <i 
                                key={star} 
                                className={`bi ${star <= rating.rating ? 'bi-star-fill' : 'bi-star'}`}
                                style={{color: star <= rating.rating ? '#ffc107' : '#ddd', fontSize: '14px'}}
                              ></i>
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <div className="story-detail-rating-comment-text">
                            {rating.comment}
                          </div>
                        )}
                        <div className="story-detail-rating-time">
                          {timeAgo(rating.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="story-detail-no-ratings">
                    Chưa có đánh giá nào cho truyện này.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StoryDetail; 