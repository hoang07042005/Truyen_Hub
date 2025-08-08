import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../common/FileUpload';
import './AddStory.css';

function AddStory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    status: 'ONGOING'
  });

  const [coverImageFile, setCoverImageFile] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      setLoading(true);
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

      await axios.post('http://localhost:8080/api/admin/stories', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Thêm truyện thành công!');
      navigate('/admin/stories');
    } catch (err) {
      console.error('Error adding story:', err);
      alert('Lỗi khi thêm truyện: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
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

  return (
    <div className="add-story-container">
      <div className="add-story-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/admin/stories')}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>
        <h1>Thêm truyện mới</h1>
      </div>

      <div className="add-story-content">
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
                label="Chọn ảnh bìa"
                onFileChange={handleCoverImageChange}
                onFileRemove={handleCoverImageRemove}
                placeholder="Chọn file ảnh"
                fileInfo="Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)"
              />
            </div>
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
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-clockwise spin"></i>
                  Đang thêm...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle"></i>
                  Thêm truyện
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStory; 