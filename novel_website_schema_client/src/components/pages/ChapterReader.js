import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../pages/ChapterReader.css';

function ChapterReader() {
  const navigate = useNavigate();
  const { storyId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allChapters, setAllChapters] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [bgMode, setBgMode] = useState('white'); // 'white', 'dark', 'sepia', 'cream'
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchChapter();
    fetchStory();
    fetchAllChapters();
    saveHistory();
    fetchComments();
  }, [chapterId, storyId]);

  const saveHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(
        'http://localhost:8080/api/history/read',
        { storyId: parseInt(storyId), chapterId: parseInt(chapterId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // Có thể log lỗi nếu cần
    }
  };

  const fetchChapter = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`http://localhost:8080/api/chapters/${chapterId}`, { headers });
      const chapterData = response.data;
      
      // Kiểm tra xem chương có bị khóa không
      if (chapterData.isLocked && token) {
        // Kiểm tra xem user đã mở khóa chương này chưa
        try {
          const unlockResponse = await axios.get(`http://localhost:8080/api/chapters/unlock/${chapterId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Kiểm tra response để xem đã mở khóa chưa
          if (unlockResponse.data && unlockResponse.data.unlocked === true) {
            // Đã mở khóa, hiển thị chương bình thường
            setChapter(chapterData);
          } else {
            // Chưa mở khóa, chuyển hướng đến trang unlock
            navigate(`/stories/${storyId}/chapters/${chapterId}/unlock`);
            return;
          }
        } catch (unlockErr) {
          console.error('Error checking unlock status:', unlockErr);
          // Nếu có lỗi khi kiểm tra, chuyển hướng đến trang unlock
          navigate(`/stories/${storyId}/chapters/${chapterId}/unlock`);
          return;
        }
      } else {
        // Chương không bị khóa hoặc user chưa đăng nhập
        setChapter(chapterData);
      }
    } catch (err) {
      setError('Lỗi khi tải chương');
      console.error('Error fetching chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStory = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/stories/${storyId}`);
      setStory(response.data);
    } catch (err) {
      console.error('Error fetching story:', err);
    }
  };

  const fetchAllChapters = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/chapters/story/${storyId}`);
      setAllChapters(response.data);
    } catch (err) {
      // handle error
    }
  };

  const handlePreviousChapter = () => {
    if (chapter && allChapters.length > 0) {
      const idx = allChapters.findIndex(ch => ch.id === chapter.id);
      if (idx > 0) {
        const prevChapter = allChapters[idx - 1];
        navigate(`/stories/${storyId}/chapters/${prevChapter.id}`);
      }
    }
  };

  const handleNextChapter = () => {
    if (chapter && allChapters.length > 0) {
      const idx = allChapters.findIndex(ch => ch.id === chapter.id);
      if (idx < allChapters.length - 1) {
        const nextChapter = allChapters[idx + 1];
        navigate(`/stories/${storyId}/chapters/${nextChapter.id}`);
      }
    }
  };

  const handleBack = () => {
    navigate(`/stories/${storyId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const fetchComments = async () => {
    setCommentLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/comments/chapter/${chapterId}`);
      setComments(res.data);
    } catch (err) {
      setCommentError('Lỗi khi tải bình luận');
    }
    setCommentLoading(false);
  };

  const handlePostComment = async () => {
    if (!commentContent.trim()) return;
    setPosting(true);
    setCommentError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setCommentError('Bạn cần đăng nhập để bình luận.');
      setPosting(false);
      return;
    }
    try {
      await axios.post(
        'http://localhost:8080/api/comments',
        { storyId: parseInt(storyId), chapterId: parseInt(chapterId), content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentContent('');
      fetchComments();
    } catch (err) {
      setCommentError('Lỗi khi gửi bình luận');
    }
    setPosting(false);
  };

  if (loading) {
    return (
      <div className="chapter-reader-container">
        <div className="loading">Đang tải chương...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chapter-reader-container">
        <div className="error-message">{error}</div>
        <button onClick={handleBack} className="back-btn">← Quay lại</button>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="chapter-reader-container">
        <div className="error-message">Không tìm thấy chương</div>
        <button onClick={handleBack} className="back-btn">← Quay lại</button>
      </div>
    );
  }

  return (
    <div className="chapter-reader-container" style={{position: 'relative'}}>
      {/* Modal settings */}
      {showSettings && (
        <div className="chapter-reader-settings-modal">
          <div className="chapter-reader-settings-content">
            <div className="settings-title">Cài đặt đọc</div>
            <div className="settings-section">
              <div className="settings-label">Cỡ chữ</div>
              <div className="settings-fontsize-controls">
                <button onClick={() => setFontSize(f => Math.max(12, f - 2))}>-</button>
                <span>{fontSize}px</span>
                <button onClick={() => setFontSize(f => Math.min(32, f + 2))}>+</button>
              </div>
            </div>
            <div className="settings-section">
              <div className="settings-label">Màu nền</div>
              <div className="settings-bg-controls">
                <button className={bgMode === 'white' ? 'active' : ''} onClick={() => setBgMode('white')}>Trắng</button>
                <button className={bgMode === 'cream' ? 'active' : ''} onClick={() => setBgMode('cream')}>Kem</button>
                <button className={bgMode === 'dark' ? 'active' : ''} onClick={() => setBgMode('dark')}>Tối</button>
                <button className={bgMode === 'sepia' ? 'active' : ''} onClick={() => setBgMode('sepia')}>Sepia</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header đơn giản */}
      <div className="chapter-reader-header-simple">
        <button className="chapter-back-btn" onClick={handleBack}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="chapter-header-titles">
          <div className="chapter-story-title">{story?.title}</div>
          <div className="chapter-title-info">Chương {chapter.chapterNumber}: {chapter.title}</div>
        </div>
        <span className="chapter-header-settings-icon" onClick={() => setShowSettings(!showSettings)}>
          <i className="bi bi-gear"></i>
        </span>
      </div>
      {/* ...content, navigation... */}
      <div className="chapter-content">
        <div
          className="content-wrapper"
          style={{
            fontSize: `${fontSize}px`,
            background: bgMode === 'white' ? '#fff'
              : bgMode === 'cream' ? '#fdf6e3'
              : bgMode === 'sepia' ? '#f4ecd8'
              : '#181a1b',
            color: bgMode === 'dark' ? '#f3f3f3' : '#374151',
            borderRadius: 12,
            transition: 'all 0.2s'
          }}
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            <p key={index} className="paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className="chapter-navigation-modern">
        <button 
          onClick={handlePreviousChapter}
          disabled={chapter.chapterNumber <= 1}
          className="chapter-nav-btn prev-btn"
        >
          ← Chương trước
        </button>
        <div className="chapter-progress-modern">
          {chapter.chapterNumber} / {story?.chapterCount || 0}
        </div>
        <button 
          onClick={handleNextChapter}
          disabled={chapter.chapterNumber >= (story?.chapterCount || 0)}
          className="chapter-nav-btn next-btn"
        >
          Chương tiếp →
        </button>
      </div>
      {/* Bình luận chương */}
      <div className="chapter-comments-section">
        <h3>Bình luận</h3>
        {commentLoading ? (
          <div>Đang tải bình luận...</div>
        ) : (
          <div>
            {comments.length === 0 ? (
              <div>Chưa có bình luận nào.</div>
            ) : (
              <ul className="chapter-comments-list">
                {comments.map(c => (
                  <li key={c.id} className="chapter-comment-item" style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                    <img
                      src={c.avatar || 'https://via.placeholder.com/32x32/6b7280/ffffff?text=U'}
                      alt="avatar"
                      className="chapter-comment-avatar"
                      style={{width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#eee'}}
                    />
                    <div style={{flex: 1}}>
                      <div className="chapter-comment-meta">
                        <span className="chapter-comment-user">{c.username || `User #${c.userId}`}</span>
                        <span className="chapter-comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="chapter-comment-content">{c.content}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="chapter-comment-form">
          <textarea
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            placeholder="Nhập bình luận..."
            rows={2}
            disabled={posting}
          />
          <button onClick={handlePostComment} disabled={posting || !commentContent.trim()}>
            {posting ? 'Đang gửi...' : 'Gửi'}
          </button>
          {commentError && <div className="comment-error">{commentError}</div>}
        </div>
      </div>
    </div>
  );
}

export default ChapterReader; 