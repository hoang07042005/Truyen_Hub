import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './UnlockChapter.css';

function UnlockChapter() {
  const navigate = useNavigate();
  const { storyId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [story, setStory] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChapterInfo();
    fetchUserCoins();
  }, [chapterId]);

  const fetchChapterInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/chapters/${chapterId}`);
      setChapter(response.data);
      
      // Fetch story info
      const storyResponse = await axios.get(`http://localhost:8080/api/stories/${storyId}`);
      setStory(storyResponse.data);
    } catch (err) {
      setError('Không thể tải thông tin chương');
      console.error('Error fetching chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoins = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:8080/api/coins/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCoins(response.data.coins || 0);
    } catch (err) {
      console.error('Error fetching user coins:', err);
    }
  };

  const handleUnlockChapter = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để mở khóa chương');
      return;
    }

    if (userCoins < (chapter.coinsRequired || 10)) {
      alert('Bạn không đủ xu để mở khóa chương này. Vui lòng nạp thêm xu!');
      navigate('/coin-shop');
      return;
    }

    setUnlocking(true);
    try {
      await axios.post('http://localhost:8080/api/chapters/unlock', {
        chapterId: parseInt(chapterId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Mở khóa chương thành công!');
      // Refresh trang story detail để cập nhật trạng thái
      navigate(`/stories/${storyId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi mở khóa chương';
      alert(errorMessage);
      setError(errorMessage);
    } finally {
      setUnlocking(false);
    }
  };

  const handleBuyCoins = () => {
    navigate('/coin-shop');
  };

  const handleBack = () => {
    navigate(`/stories/${storyId}`);
  };

  if (loading) {
    return (
      <div className="unlock-chapter-container">
        <div className="loading">Đang tải thông tin chương...</div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="unlock-chapter-container">
        <div className="error-message">{error || 'Không tìm thấy chương'}</div>
        <button onClick={handleBack} className="back-btn">← Quay lại</button>
      </div>
    );
  }

  const coinsRequired = chapter.coinsRequired || 10;
  const hasEnoughCoins = userCoins >= coinsRequired;

  return (
    <div className="unlock-chapter-container">
      <div className="unlock-chapter-card">
        <div className="unlock-chapter-header">
          <button onClick={handleBack} className="back-btn">
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>
          <h1>Mở khóa chương</h1>
        </div>

        <div className="unlock-chapter-content">
          <div className="chapter-info">
            <div className="story-title">{story?.title}</div>
            <div className="chapter-title">
            {chapter.title}
            </div>
            <div className="chapter-description">
              Chương này đã bị khóa và yêu cầu {coinsRequired} xu để mở khóa
            </div>
          </div>

          <div className="coins-info">
            <div className="coins-required">
              <i className="bi bi-coin"></i>
              <span>Xu cần thiết: {coinsRequired}</span>
            </div>
            <div className="user-coins">
              <i className="bi bi-wallet"></i>
              <span>Xu hiện tại: {userCoins}</span>
            </div>
          </div>

          {!hasEnoughCoins && (
            <div className="insufficient-coins">
              <i className="bi bi-exclamation-triangle"></i>
              <p>Bạn không đủ xu để mở khóa chương này</p>
              <p>Cần thêm {coinsRequired - userCoins} xu</p>
            </div>
          )}

          <div className="unlock-actions">
            {hasEnoughCoins ? (
              <button 
                className="unlock-btn"
                onClick={handleUnlockChapter}
                disabled={unlocking}
              >
                {unlocking ? (
                  <>
                    <i className="bi bi-arrow-clockwise spin"></i>
                    Đang mở khóa...
                  </>
                ) : (
                  <>
                    <i className="bi bi-unlock-fill"></i>
                    Mở khóa chương ({coinsRequired} xu)
                  </>
                )}
              </button>
            ) : (
              <button className="buy-coins-btn" onClick={handleBuyCoins}>
                <i className="bi bi-coin"></i>
                Mua thêm xu
              </button>
            )}
          </div>

          <div className="unlock-benefits">
            <h3>Lợi ích khi mở khóa:</h3>
            <ul>
              <li><i className="bi bi-check-circle"></i> Đọc toàn bộ nội dung chương</li>
              <li><i className="bi bi-check-circle"></i> Không bị giới hạn thời gian</li>
              <li><i className="bi bi-check-circle"></i> Có thể bookmark và đánh giá</li>
              <li><i className="bi bi-check-circle"></i> Hỗ trợ tác giả</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnlockChapter; 