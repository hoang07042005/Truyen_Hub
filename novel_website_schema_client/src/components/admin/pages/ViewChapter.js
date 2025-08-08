import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ViewChapter.css';

function ViewChapter() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChapterData();
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8080/api/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const chapterData = response.data;
      setChapter(chapterData);

      // Fetch story data
      if (chapterData.storyId) {
        const storyResponse = await axios.get(`http://localhost:8080/api/admin/stories/${chapterData.storyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStory(storyResponse.data);
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error);
      setError('Lỗi khi tải dữ liệu chương: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/admin/view-story/${chapter?.storyId}`);
  };

  const handleEdit = () => {
    navigate(`/admin/stories/${chapter.storyId}/chapters/${chapterId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8080/api/chapters/admin/${chapterId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirect to story view page
      navigate(`/admin/view-story/${chapter.storyId}`);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setError('Lỗi khi xóa chương: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
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

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (wordCount) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  if (loading && !chapter) {
    return (
      <div className="view-chapter-container">
        <div className="view-chapter-loading">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Đang tải thông tin chương...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-chapter-container">
        <div className="view-chapter-error">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={handleBack} className="view-chapter-back-btn">
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="view-chapter-container">
        <div className="view-chapter-error">
          <i className="bi bi-question-circle"></i>
          <p>Không tìm thấy chương</p>
          <button onClick={handleBack} className="view-chapter-back-btn">
            <i className="bi bi-arrow-left"></i>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-chapter-container">
      <div className="view-chapter-header">
        <button 
          className="view-chapter-back-btn"
          onClick={handleBack}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>
        <h1>Xem chương</h1>
      </div>

      <div className="view-chapter-content">
        {/* Story Information */}
        {story && (
          <div className="view-chapter-story-info">
            <div className="view-chapter-story-cover">
              <img 
                src={story.coverImage.startsWith('http') ? story.coverImage : `http://localhost:8080/uploads/story-covers/${story.coverImage}`}
                alt={story.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="view-chapter-cover-placeholder" style={{display: 'none'}}>
                <i className="bi bi-image"></i>
                <span>Không có ảnh</span>
              </div>
            </div>
            <div className="view-chapter-story-details">
              <h2>{story.title}</h2>
              <p className="view-chapter-story-author">Tác giả: {story.author || 'Không xác định'}</p>
              <p className="view-chapter-story-date">Ngày tạo: {formatDate(story.createdAt)}</p>
              <p className="view-chapter-story-chapters">Số chương hiện tại: {story.chapterCount || 0}</p>
            </div>
          </div>
        )}

        {/* Chapter Information */}
        <div className="view-chapter-info-section">
          <div className="view-chapter-info-header">
            <h3>Thông tin chương</h3>
            <div className="view-chapter-actions">
              <button 
                className="view-chapter-edit-btn"
                onClick={handleEdit}
                disabled={loading}
              >
                <i className="bi bi-pencil"></i>
                Sửa chương
              </button>
              <button 
                className="view-chapter-delete-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                <i className="bi bi-trash"></i>
                Xóa chương
              </button>
            </div>
          </div>

          <div className="view-chapter-info-grid">
            <div className="view-chapter-info-item">
              <label>Số chương:</label>
              <span>{chapter.chapterNumber}</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Tiêu đề:</label>
              <span>{chapter.title}</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Lượt xem:</label>
              <span>{formatNumber(chapter.views)}</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Ngày tạo:</label>
              <span>{formatDate(chapter.createdAt)}</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Cập nhật:</label>
              <span>{formatDate(chapter.updatedAt)}</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Số từ:</label>
              <span>{getWordCount(chapter.content)} từ</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Thời gian đọc:</label>
              <span>~{getReadingTime(getWordCount(chapter.content))} phút</span>
            </div>
            <div className="view-chapter-info-item">
              <label>Slug:</label>
              <span className="view-chapter-slug">{chapter.slug}</span>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="view-chapter-content-section">
          <h3>Nội dung chương</h3>
          <div className="view-chapter-content-text">
            {chapter.content.split('\n').map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="view-chapter-error-alert">
            <i className="bi bi-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewChapter; 