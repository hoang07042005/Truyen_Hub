import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CategoryManagement.css';

class CategoryManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      stats: {
        totalCategories: 0,
        totalStories: 0,
        mostPopularCategory: ''
      },
      loading: true,
      error: '',
      showAddForm: false,
      newCategory: {
        name: '',
        slug: '',
        description: '',
        color: '#8B5CF6'
      },
      formLoading: false,
      formError: '',
      showEditForm: false,
      editingCategory: null,
      editCategory: {
        name: '',
        slug: '',
        description: '',
        color: '#8B5CF6'
      }
    };
  }

  componentDidMount() {
    this.fetchCategories();
    this.fetchStats();
  }

  fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.setState({ categories: response.data });
    } catch (err) {
      console.error('Error fetching categories:', err);
      this.setState({ error: 'Không thể tải danh sách thể loại' });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categories/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.setState({ stats: response.data });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  handleEditCategory = (category) => {
    this.setState({
      showEditForm: true,
      editingCategory: category,
      editCategory: {
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        color: category.color || '#8B5CF6'
      },
      showAddForm: false // Hide add form if open
    });
  };

  handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/categories/admin/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchCategories();
        this.fetchStats();
      } catch (err) {
        console.error('Error deleting category:', err);
        alert('Không thể xóa thể loại');
      }
    }
  };

  handleAddCategory = () => {
    this.setState({ 
      showAddForm: true,
      showEditForm: false, // Hide edit form if open
      editingCategory: null,
      formError: ''
    });
  };

  handleCancelAdd = () => {
    this.setState({
      showAddForm: false,
      newCategory: { name: '', slug: '', description: '', color: '#8B5CF6' },
      formError: ''
    });
  };

  handleCancelEdit = () => {
    this.setState({
      showEditForm: false,
      editingCategory: null,
      editCategory: { name: '', slug: '', description: '', color: '#8B5CF6' },
      formError: ''
    });
  };

  handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'edit-name') {
      // Auto-generate slug from name
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      this.setState(prevState => ({
        editCategory: {
          ...prevState.editCategory,
          name: value,
          slug: slug
        }
      }));
    } else if (name === 'edit-color-picker') {
      // Handle color picker change
      this.setState(prevState => ({
        editCategory: {
          ...prevState.editCategory,
          color: value
        }
      }));
    } else {
      // Handle other inputs normally
      const fieldName = name.replace('edit-', '');
      this.setState(prevState => ({
        editCategory: {
          ...prevState.editCategory,
          [fieldName]: value
        }
      }));
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // Auto-generate slug from name
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      this.setState(prevState => ({
        newCategory: {
          ...prevState.newCategory,
          name: value,
          slug: slug
        }
      }));
    } else if (name === 'color-picker') {
      // Handle color picker change
      this.setState(prevState => ({
        newCategory: {
          ...prevState.newCategory,
          color: value
        }
      }));
    } else {
      // Handle other inputs normally
      this.setState(prevState => ({
        newCategory: {
          ...prevState.newCategory,
          [name]: value
        }
      }));
    }
  };

  handleSubmitCategory = async (e) => {
    e.preventDefault();
    this.setState({ formLoading: true, formError: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/categories/admin', this.state.newCategory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Category created:', response.data);

      // Reset form
      this.setState({
        showAddForm: false,
        newCategory: { name: '', slug: '', description: '', color: '#8B5CF6' },
        formError: ''
      });

      // Refresh categories and stats
      this.fetchCategories();
      this.fetchStats();
    } catch (err) {
      console.error('Error creating category:', err);
      this.setState({ 
        formError: err.response?.data?.message || 'Không thể tạo thể loại mới' 
      });
    } finally {
      this.setState({ formLoading: false });
    }
  };

  handleSubmitEdit = async (e) => {
    e.preventDefault();
    this.setState({ formLoading: true, formError: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/categories/admin/${this.state.editingCategory.id}`, this.state.editCategory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Category updated:', response.data);

      // Reset form
      this.setState({
        showEditForm: false,
        editingCategory: null,
        editCategory: { name: '', slug: '', description: '', color: '#8B5CF6' },
        formError: ''
      });

      // Refresh categories and stats
      this.fetchCategories();
      this.fetchStats();
    } catch (err) {
      console.error('Error updating category:', err);
      this.setState({ 
        formError: err.response?.data?.message || 'Không thể cập nhật thể loại' 
      });
    } finally {
      this.setState({ formLoading: false });
    }
  };

  render() {
    const { categories, stats, loading, error, showAddForm, newCategory, formLoading, formError, showEditForm, editCategory } = this.state;

    if (loading) {
      return <div className="loading">Đang tải...</div>;
    }

    return (
      <div className="category-management">
        {/* Header Section */}
        <div className="category-header">
          <div className="header-content">
            <h1 className="page-title-category">Quản lý thể loại</h1>
            <p className="page-subtitle-category">Quản lý tất cả thể loại truyện trên hệ thống</p>
          </div>
          <button 
            className={`add-category-btn ${showAddForm ? 'active' : ''}`} 
            onClick={this.handleAddCategory}
          >
            <i className="bi bi-plus"></i>
            Thêm thể loại
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Add Category Form */}
        {showAddForm && (
          <div className="add-category-form-container">
            <div className="add-category-form-card">
              <h2 className="form-title">Thêm thể loại mới</h2>
              
              {formError && (
                <div className="error-message">{formError}</div>
              )}

              <form onSubmit={this.handleSubmitCategory} className="add-category-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Tên thể loại</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newCategory.name}
                    onChange={this.handleInputChange}
                    placeholder="Nhập tên thể loại..."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug" className="form-label">Slug</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={newCategory.slug}
                    onChange={this.handleInputChange}
                    placeholder="slug-the-loai"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description" className="form-label">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newCategory.description}
                    onChange={this.handleInputChange}
                    placeholder="Mô tả về thể loại..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color" className="form-label">Màu sắc</label>
                  <div className="color-input-group">
                    <div className="color-swatch-container">
                      <div 
                        className="color-swatch" 
                        style={{ backgroundColor: newCategory.color }}
                        onClick={() => document.getElementById('color-picker').click()}
                      ></div>
                      <input
                        type="color"
                        id="color-picker"
                        name="color-picker"
                        value={newCategory.color}
                        onChange={this.handleInputChange}
                        className="hidden-color-picker"
                      />
                    </div>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={newCategory.color}
                      onChange={this.handleInputChange}
                      placeholder="#8B5CF6"
                      className="form-input color-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Đang thêm...' : 'Thêm thể loại'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={this.handleCancelAdd}
                    disabled={formLoading}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Form */}
        {showEditForm && (
          <div className="add-category-form-container">
            <div className="add-category-form-card">
              <h2 className="form-title">Chỉnh sửa thể loại</h2>
              
              {formError && (
                <div className="error-message">{formError}</div>
              )}

              <form onSubmit={this.handleSubmitEdit} className="add-category-form">
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">Tên thể loại</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="edit-name"
                    value={editCategory.name}
                    onChange={this.handleEditInputChange}
                    placeholder="Nhập tên thể loại..."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-slug" className="form-label">Slug</label>
                  <input
                    type="text"
                    id="edit-slug"
                    name="edit-slug"
                    value={editCategory.slug}
                    onChange={this.handleEditInputChange}
                    placeholder="slug-the-loai"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-description" className="form-label">Mô tả</label>
                  <textarea
                    id="edit-description"
                    name="edit-description"
                    value={editCategory.description}
                    onChange={this.handleEditInputChange}
                    placeholder="Mô tả về thể loại..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-color" className="form-label">Màu sắc</label>
                  <div className="color-input-group">
                    <div className="color-swatch-container">
                      <div 
                        className="color-swatch" 
                        style={{ backgroundColor: editCategory.color }}
                        onClick={() => document.getElementById('edit-color-picker').click()}
                      ></div>
                      <input
                        type="color"
                        id="edit-color-picker"
                        name="edit-color-picker"
                        value={editCategory.color}
                        onChange={this.handleEditInputChange}
                        className="hidden-color-picker"
                      />
                    </div>
                    <input
                      type="text"
                      id="edit-color"
                      name="edit-color"
                      value={editCategory.color}
                      onChange={this.handleEditInputChange}
                      placeholder="#8B5CF6"
                      className="form-input color-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Đang cập nhật...' : 'Cập nhật thể loại'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={this.handleCancelEdit}
                    disabled={formLoading}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Cards Grid */}
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header-card">
                <div 
                  className="category-initial" 
                  style={{ backgroundColor: category.color || '#8B5CF6' }}
                >
                  {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="category-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => this.handleEditCategory(category)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => this.handleDeleteCategory(category.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div className="category-content">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-stats">
                  <span className="story-count">{category.storyCount || 0} truyện</span>
                  <div className="color-info">
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: category.color || '#8B5CF6' }}
                    ></div>
                    <span className="color-code">{category.color || '#8B5CF6'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="category-stats-section">
          <h2 className="stats-title">Thống kê thể loại</h2>
          <div className="stats-grid">
            <div className="stats-item-category">
              <div className="stats-number total-categories">{stats.totalCategories}</div>
              <div className="stats-label">Tổng thể loại</div>
            </div>
            <div className="stats-item-category">
              <div className="stats-number total-stories">{stats.totalStories.toLocaleString()}</div>
              <div className="stats-label">Tổng truyện</div>
            </div>
            <div className="stats-item-category">
              <div className="stats-number popular-category">{stats.mostPopularCategory}</div>
              <div className="stats-label">Thể loại phổ biến nhất</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Wrapper component để sử dụng useNavigate hook
const CategoryManagementWithNavigation = (props) => {
  const navigate = useNavigate();
  return <CategoryManagement {...props} navigate={navigate} />;
};

export default CategoryManagementWithNavigation;