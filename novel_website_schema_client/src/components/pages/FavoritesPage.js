import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../pages/FavoritesPage.css';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để xem danh sách truyện được theo dõi.');
      setLoading(false);
      return;
    }
    try {
      // Lấy danh sách bookmark của user
      const res = await axios.get('http://localhost:8080/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sắp xếp theo thời gian bookmark mới nhất (nếu có) hoặc theo ID
      const sortedFavorites = res.data.sort((a, b) => b.storyId - a.storyId);
      setFavorites(sortedFavorites);
    } catch (err) {
      setError('Lỗi khi tải danh sách truyện được theo dõi.');
    }
    setLoading(false);
  };

  const handleViewStory = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  // Hàm format thời gian cập nhật (giả lập)
  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const updated = new Date(date);
    const diff = (now - updated) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff/60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff/3600) + ' giờ trước';
    return Math.floor(diff/86400) + ' ngày trước';
  };

  return (
    <div className="favorites-page-container">
      <h2 style={{marginBottom: 24, textAlign: 'left'}}>Tất cả truyện đã theo dõi</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : favorites.length === 0 ? (
        <div>Bạn chưa theo dõi truyện nào.</div>
      ) : (
        <div className="favorites-card-list">
          {favorites.map(item => (
            <div key={item.storyId} className="favorite-story-card" onClick={() => handleViewStory(item.storyId)}>
              <div className="favorite-story-cover-wrap">
                <img src={item.coverImage || '/default-cover.png'} alt={item.title} className="favorite-story-cover" />
              </div>
              <div className="favorite-story-info">
                <span className={`favorite-story-status-badge ${item.status === 'COMPLETED' ? 'completed' : 'ongoing'}`}>{item.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}</span>
                <div className="favorite-story-title">{item.title}</div>
                <div className="favorite-story-author">{item.author || 'Không rõ'}</div>
              
                <div className="favorite-story-meta-row">
                  {/* <span className="favorite-story-rating"><i className="bi bi-star-fill" style={{color:'#fbc02d'}}></i> {item.rating || '4.7'}</span> */}
                  <span className="favorite-story-chapters">{item.chapterCount || 0} chương</span>
                </div>
                <div className="favorite-story-meta-row"> Thể loại: 
                  <span className="favorite-story-genre-badge">{item.genre || item.category || 'Fantasy'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage; 