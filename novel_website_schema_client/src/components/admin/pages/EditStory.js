import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import FileUpload from '../common/FileUpload';
import './EditStory.css';

function EditStory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    status: 'ONGOING'
  });

  useEffect(() => {
    fetchStory();
    fetchCategories();
  }, [id]);

  const fetchStory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8080/api/admin/stories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const story = response.data;
      setFormData({
        title: story.title || '',
        author: story.author || '',
        description: story.description || '',
        coverImage: story.coverImage || '',
        status: story.status || 'ONGOING'
      });
      
      setSelectedCategories(story.categories || []);
      setCurrentCoverImage(story.coverImage || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      alert('Lỗi khi tải thông tin truyện: ' + (error.response?.data?.message || error.message));
      navigate('/admin/stories');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề truyện!');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', formData.status);
      
      // Add categories
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          formDataToSend.append('categories', category);
        });
      }
      
      // Add cover image file if exists
      if (coverImageFile) {
        formDataToSend.append('coverImage', coverImageFile);
      }

      await axios.put(`http://localhost:8080/api/admin/stories/${id}`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Cập nhật truyện thành công!');
      navigate('/admin/stories');
    } catch (err) {
      console.error('Error updating story:', err);
      alert('Lỗi khi cập nhật truyện: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (categoryName, checked) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryName]);
    } else {
      setSelectedCategories(selectedCategories.filter(cat => cat !== categoryName));
    }
  };

  const handleCoverImageChange = (file) => {
    setCoverImageFile(file);
  };

  const handleCoverImageRemove = () => {
    setCoverImageFile(null);
  };

  if (loading) {
    return (
      <div className="edit-story-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-clockwise spin"></i>
          <p>Đang tải thông tin truyện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-story-container">
      <div className="edit-story-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/admin/stories')}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>
        <h1>Sửa truyện</h1>
      </div>

      <div className="edit-story-content">
        <form onSubmit={handleSubmit} className="story-form">
          <div className="form-section">
            <h2>Thông tin cơ bản</h2>
            
            <div className="form-group">
              <label htmlFor="title">Tiêu đề truyện *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Nhập tiêu đề truyện"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Tác giả</label>
              <input
                id="author"
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                placeholder="Nhập tên tác giả"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập mô tả truyện"
                rows="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="ONGOING">Đang cập nhật</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="PAUSED">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Ảnh bìa</h2>
            
            <div className="form-group">
              <FileUpload
                id="coverImage"
                label="Chọn ảnh bìa mới"
                onFileChange={handleCoverImageChange}
                onFileRemove={handleCoverImageRemove}
                placeholder="Chọn file ảnh mới"
                fileInfo="Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)"
              />
            </div>

            {currentCoverImage && !coverImageFile && (
              <div className="current-cover">
                <h3>Ảnh bìa hiện tại</h3>
                <div className="current-cover-container">
                  <img 
                    src={currentCoverImage.startsWith('http') ? currentCoverImage : `http://localhost:8080/uploads/story-covers/${currentCoverImage}`}
                    alt="Current cover"
                    className="current-cover-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="current-cover-error" style={{display: 'none'}}>
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>Không thể tải ảnh</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Thể loại</h2>
            
            <div className="categories-grid">
              {categories.map(category => (
                <label key={category.id} className="category-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                  />
                  <span className="category-name">{category.name}</span>
                </label>
              ))}
            </div>
            
            {selectedCategories.length > 0 && (
              <div className="selected-categories">
                <h4>Thể loại đã chọn:</h4>
                <div className="selected-tags">
                  {selectedCategories.map((cat, index) => (
                    <span key={index} className="selected-tag">
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(cat, false)}
                        className="remove-tag"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/admin/stories')}
              className="cancel-btn"
              disabled={saving}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={saving || !formData.title.trim()}
            >
              {saving ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  Cập nhật truyện
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStory; 