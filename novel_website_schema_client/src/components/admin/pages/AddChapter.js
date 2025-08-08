import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AddChapter.css';

function AddChapter() {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapterNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStoryData();
    fetchNextChapterNumber();
  }, [storyId]);

  const fetchStoryData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8080/api/admin/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStory(response.data);
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  const fetchNextChapterNumber = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8080/api/chapters/admin/story/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const chapters = response.data;
      const nextNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber)) + 1 : 1;
      setFormData(prev => ({ ...prev, chapterNumber: nextNumber.toString() }));
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setFormData(prev => ({ ...prev, chapterNumber: '1' }));
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

    if (!formData.chapterNumber || isNaN(formData.chapterNumber) || parseInt(formData.chapterNumber) < 1) {
      newErrors.chapterNumber = 'Số chương phải là số dương';
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
    try {
      const token = localStorage.getItem('adminToken');
      const chapterData = {
        storyId: parseInt(storyId),
        title: formData.title.trim(),
        content: formData.content.trim(),
        chapterNumber: parseInt(formData.chapterNumber)
      };

      await axios.post(`http://localhost:8080/api/chapters/admin/create`, chapterData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Redirect to story view page
      navigate(`/admin/view-story/${storyId}`);
    } catch (error) {
      console.error('Error creating chapter:', error);
      setErrors({ submit: 'Lỗi khi tạo chương: ' + (error.response?.data?.message || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/view-story/${storyId}`);
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

  if (!story) {
    return (
      <div className="add-chapter-container">
        <div className="add-chapter-loading">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Đang tải thông tin truyện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-chapter-container">
      <div className="add-chapter-header">
        <button 
          className="add-chapter-back-btn"
          onClick={handleCancel}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>
        <h1>Thêm chương mới</h1>
      </div>

      <div className="add-chapter-content">
        <div className="add-chapter-story-info">
          <div className="add-chapter-story-cover">
            <img 
              src={story.coverImage.startsWith('http') ? story.coverImage : `http://localhost:8080/uploads/story-covers/${story.coverImage}`}
              alt={story.title}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="add-chapter-cover-placeholder" style={{display: 'none'}}>
              <i className="bi bi-image"></i>
              <span>Không có ảnh</span>
            </div>
          </div>
          <div className="add-chapter-story-details">
            <h2>{story.title}</h2>
            <p className="add-chapter-story-author">Tác giả: {story.author || 'Không xác định'}</p>
            <p className="add-chapter-story-date">Ngày tạo: {formatDate(story.createdAt)}</p>
            <p className="add-chapter-story-chapters">Số chương hiện tại: {story.chapterCount || 0}</p>
          </div>
        </div>

        <form className="add-chapter-form" onSubmit={handleSubmit}>
          <div className="add-chapter-form-section">
            <h3>Thông tin chương</h3>
            
            <div className="add-chapter-form-group">
              <label htmlFor="chapterNumber">Số chương *</label>
              <input
                type="number"
                id="chapterNumber"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={handleInputChange}
                className={errors.chapterNumber ? 'add-chapter-input-error' : 'add-chapter-input'}
                min="1"
                required
              />
              {errors.chapterNumber && (
                <span className="add-chapter-error-message">{errors.chapterNumber}</span>
              )}
            </div>

            <div className="add-chapter-form-group">
              <label htmlFor="title">Tiêu đề chương *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'add-chapter-input-error' : 'add-chapter-input'}
                placeholder="Nhập tiêu đề chương..."
                required
              />
              {errors.title && (
                <span className="add-chapter-error-message">{errors.title}</span>
              )}
            </div>

            <div className="add-chapter-form-group">
              <label htmlFor="content">Nội dung chương *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={errors.content ? 'add-chapter-textarea-error' : 'add-chapter-textarea'}
                placeholder="Nhập nội dung chương..."
                rows="20"
                required
              />
              {errors.content && (
                <span className="add-chapter-error-message">{errors.content}</span>
              )}
              <div className="add-chapter-content-info">
                <span>Độ dài: {formData.content.length} ký tự</span>
                <span>Ước tính thời gian đọc: {Math.ceil(formData.content.length / 300)} phút</span>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="add-chapter-submit-error">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="add-chapter-form-actions">
            <button 
              type="button" 
              className="add-chapter-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="add-chapter-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="bi bi-plus"></i>
                  Tạo chương
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddChapter; 