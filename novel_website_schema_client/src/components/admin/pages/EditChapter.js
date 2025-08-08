import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EditChapter.css';

function EditChapter() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [story, setStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapterNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchChapterData();
  }, [chapterId]);

  const fetchChapterData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8080/api/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const chapterData = response.data;
      setChapter(chapterData);
      setFormData({
        title: chapterData.title || '',
        content: chapterData.content || '',
        chapterNumber: chapterData.chapterNumber || ''
      });

      // Fetch story data
      if (chapterData.storyId) {
        const storyResponse = await axios.get(`http://localhost:8080/api/admin/stories/${chapterData.storyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStory(storyResponse.data);
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error);
      setErrors({ fetch: 'Lỗi khi tải dữ liệu chương: ' + (error.response?.data?.message || error.message) });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề chương không được để trống';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung chương không được để trống';
    }
    
    if (!formData.chapterNumber || formData.chapterNumber < 1) {
      newErrors.chapterNumber = 'Số chương phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('adminToken');
      const chapterData = {
        id: chapter.id,
        storyId: chapter.storyId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        chapterNumber: parseInt(formData.chapterNumber)
      };

      await axios.put(`http://localhost:8080/api/chapters/admin/${chapterId}/update`, chapterData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Redirect to story view page
      navigate(`/admin/view-story/${chapter.storyId}`);
    } catch (error) {
      console.error('Error updating chapter:', error);
      setErrors({ submit: 'Lỗi khi cập nhật chương: ' + (error.response?.data?.message || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/view-story/${chapter?.storyId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8080/api/chapters/admin/${chapterId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirect to story view page
      navigate(`/admin/view-story/${chapter.storyId}`);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setErrors({ delete: 'Lỗi khi xóa chương: ' + (error.response?.data?.message || error.message) });
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

  if (!chapter || !story) {
    return (
      <div className="edit-chapter-container">
        <div className="edit-chapter-loading">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Đang tải thông tin chương...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-chapter-container">
      <div className="edit-chapter-header">
        <button 
          className="edit-chapter-back-btn"
          onClick={handleCancel}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>
        <h1>Sửa chương</h1>
      </div>

      <div className="edit-chapter-content">
        <div className="edit-chapter-story-info">
          <div className="edit-chapter-story-cover">
            <img 
              src={story.coverImage.startsWith('http') ? story.coverImage : `http://localhost:8080/uploads/story-covers/${story.coverImage}`}
              alt={story.title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="edit-chapter-cover-placeholder" style={{display: 'none'}}>
              <i className="bi bi-image"></i>
              <span>Không có ảnh</span>
            </div>
          </div>
          <div className="edit-chapter-story-details">
            <h2>{story.title}</h2>
            <p className="edit-chapter-story-author">Tác giả: {story.author || 'Không xác định'}</p>
            <p className="edit-chapter-story-date">Ngày tạo: {formatDate(story.createdAt)}</p>
            <p className="edit-chapter-story-chapters">Số chương hiện tại: {story.chapterCount || 0}</p>
          </div>
        </div>

        <form className="edit-chapter-form" onSubmit={handleSubmit}>
          <div className="edit-chapter-form-section">
            <h3>Thông tin chương</h3>
            
            <div className="edit-chapter-form-group">
              <label htmlFor="chapterNumber">Số chương *</label>
              <input
                type="number"
                id="chapterNumber"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={handleInputChange}
                className={errors.chapterNumber ? 'edit-chapter-input-error' : 'edit-chapter-input'}
                min="1"
                required
              />
              {errors.chapterNumber && (
                <span className="edit-chapter-error-message">{errors.chapterNumber}</span>
              )}
            </div>

            <div className="edit-chapter-form-group">
              <label htmlFor="title">Tiêu đề chương *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'edit-chapter-input-error' : 'edit-chapter-input'}
                placeholder="Nhập tiêu đề chương"
                required
              />
              {errors.title && (
                <span className="edit-chapter-error-message">{errors.title}</span>
              )}
            </div>
          </div>

          <div className="edit-chapter-form-section">
            <h3>Nội dung chương</h3>
            
            <div className="edit-chapter-form-group">
              <label htmlFor="content">Nội dung *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={errors.content ? 'edit-chapter-textarea-error' : 'edit-chapter-textarea'}
                placeholder="Nhập nội dung chương..."
                rows="20"
                required
              />
              {errors.content && (
                <span className="edit-chapter-error-message">{errors.content}</span>
              )}
            </div>

            <div className="edit-chapter-content-stats">
              <div className="edit-chapter-stat-item">
                <i className="bi bi-file-text"></i>
                <span>{getWordCount(formData.content)} từ</span>
              </div>
              <div className="edit-chapter-stat-item">
                <i className="bi bi-clock"></i>
                <span>~{getReadingTime(getWordCount(formData.content))} phút đọc</span>
              </div>
              <div className="edit-chapter-stat-item">
                <i className="bi bi-calendar"></i>
                <span>Cập nhật: {formatDate(chapter.updatedAt)}</span>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="edit-chapter-error-alert">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{errors.submit}</span>
            </div>
          )}

          {errors.delete && (
            <div className="edit-chapter-error-alert">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{errors.delete}</span>
            </div>
          )}

          <div className="edit-chapter-actions">
            <button 
              type="button" 
              className="edit-chapter-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              <i className="bi bi-x-circle"></i>
              Hủy bỏ
            </button>
            
            <button 
              type="button" 
              className="edit-chapter-delete-btn"
              onClick={handleDelete}
              disabled={loading}
            >
              <i className="bi bi-trash"></i>
              Xóa chương
            </button>
            
            <button 
              type="submit" 
              className="edit-chapter-save-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditChapter; 