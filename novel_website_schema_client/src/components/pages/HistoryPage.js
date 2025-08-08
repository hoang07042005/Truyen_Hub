import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../pages/HistoryPage.css';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để xem lịch sử đọc.');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('http://localhost:8080/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      setError('Lỗi khi tải lịch sử đọc.');
    }
    setLoading(false);
  };

  // Gộp lịch sử: chỉ lấy entry mới nhất cho mỗi truyện và sắp xếp theo thời gian mới nhất
  const groupedHistory = Object.values(
    history.reduce((acc, item) => {
      if (
        !acc[item.storyId] ||
        new Date(item.lastReadAt) > new Date(acc[item.storyId].lastReadAt)
      ) {
        acc[item.storyId] = item;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt));

  const handleReadAgain = (storyId, chapterId) => {
    navigate(`/stories/${storyId}/chapters/${chapterId}`);
  };

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
    <div className="history-page-container">
      <h2 style={{marginBottom: 24, textAlign: 'left'}}>Lịch sử đọc gần đây</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : history.length === 0 ? (
        <div>Bạn chưa đọc chương nào.</div>
      ) : (
        <div className="history-list-modern">
          {groupedHistory.map(item => (
            <div key={item.id} className="history-row-modern" onClick={() => handleReadAgain(item.storyId, item.chapterId)}>
              <div className="history-cover-wrap">
                <img src={item.coverImage || '/default-cover.png'} alt={item.title} className="history-cover-img" />
              </div>
              <div className="history-info-block">
                <div className="history-title-row">
                  <span className="history-story-title">{item.title || `Truyện #${item.storyId}`}</span>
                </div>
                <div className="history-author">{item.author || ''}</div>
                <div className="history-chapter-title">
                  {item.chapterTitle || `Chương ${item.chapterNumber}: #${item.chapterId}`}
                </div>
               
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage; 