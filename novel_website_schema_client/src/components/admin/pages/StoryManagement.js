import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StoryManagement.css';

function StoryManagement() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage - 1,
        size: 5, // Thay đổi từ 10 thành 5
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        sort: 'createdAt,desc' // Sắp xếp theo ngày tạo, mới nhất lên đầu
      });

      const response = await axios.get(`http://localhost:8080/api/admin/stories?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStories(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalElements || 0);
    } catch (err) {
      setError('Lỗi khi tải danh sách truyện');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleDeleteStory = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8080/api/admin/stories/${selectedStory.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowDeleteModal(false);
      setSelectedStory(null);
      fetchStories();
      alert('Xóa truyện thành công!');
    } catch (err) {
      alert('Lỗi khi xóa truyện: ' + (err.response?.data || 'Lỗi không xác định'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (storyId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`http://localhost:8080/api/admin/stories/${storyId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchStories();
      alert('Cập nhật trạng thái thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái: ' + (err.response?.data || 'Lỗi không xác định'));
    }
  };

  const openDeleteModal = (story) => {
    console.log('Opening delete modal for story:', story);
    setSelectedStory(story);
    setShowDeleteModal(true);
    console.log('Modal state should be true now');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ONGOING': { text: 'Đang cập nhật', class: 'status-ongoing' },
      'COMPLETED': { text: 'Hoàn thành', class: 'status-completed' },
      'PAUSED': { text: 'Tạm dừng', class: 'status-paused' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="story-management-container">
        <div className="loading">Đang tải danh sách truyện...</div>
      </div>
    );
  }

  console.log('Current modal state:', { showDeleteModal, selectedStory });

  return (
    <div className="story-management-container">
      <div className="story-management-header">
        <div className="header-content">
          <h1>Quản lý truyện</h1>
          <p>Quản lý tất cả truyện trên hệ thống</p>
        </div>
        <button 
          className="add-story-btn"
          onClick={() => navigate('/admin/add-story')}
        >
          <i className="bi bi-plus-circle"></i>
          Thêm truyện mới
        </button>
      </div>



      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="story-management-table">
        <table>
          <thead>
            <tr>
              {/* <th>ID</th> */}
              <th>Truyện</th>
              <th>Thể loại</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Thống kê</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stories.map(story => (
              <tr key={story.id}>
                {/* <td>{story.id}</td> */}
                <td>
                  <div className="story-cell">
                    <div className="story-cover">
                      {story.coverImage ? (
                        <img 
                          src={story.coverImage} 
                          alt={story.title}
                          className="story-cover-thumb"
                          onError={e => { 
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="story-cover-no-image">
                          <i className="bi bi-image"></i>
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="story-cover-no-image" style={{display: 'none'}}>
                        <i className="bi bi-image"></i>
                        <span>No Image</span>
                      </div>
                    </div>
                    <div className="story-info">
                      <div className="story-title">{story.title}</div>
                      <div className="story-chapters">{story.chapterCount || 0} chương</div>
                    </div>
                  </div>
                </td>
                <td>
                <div className="story-categories">
                      {story.categories?.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="category-tag">{cat}</span>
                      ))}
                      {story.categories?.length > 2 && (
                        <span className="category-more">+{story.categories.length - 2}</span>
                      )}
                    </div>
                </td>
                <td>{story.author || 'Không xác định'}</td>
                <td>
                  <select
                    value={story.status}
                    onChange={(e) => handleStatusChange(story.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="ONGOING">Đang cập nhật</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="PAUSED">Tạm dừng</option>
                  </select>
                </td>
                <td>
                  <div className="stats-cell">
                    <div className="stats-item">
                      <i className="bi bi-eye"></i>
                      <span>{story.viewCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="stats-item">
                      <i className="bi bi-star-fill"></i>
                      <span>{story.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </td>
                <td>{formatDate(story.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/admin/edit-story/${story.id}`)}
                      title="Sửa truyện"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/admin/view-story/${story.id}`)}
                      title="Xem truyện"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => openDeleteModal(story)}
                      title="Xóa truyện"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stories.length === 0 && !loading && (
        <div className="no-stories">
          <i className="bi bi-book"></i>
          <p>Không có truyện nào</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            <span>Hiển thị {((currentPage - 1) * 5) + 1} đến {Math.min(currentPage * 5, totalItems)} trong tổng số {totalItems} kết quả</span>
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Trước
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`pagination-btn page-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{zIndex: 9999}}>
          <div className="modal delete-modal" style={{border: '3px solid red'}}>
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button onClick={() => {
                console.log('Closing modal');
                setShowDeleteModal(false);
              }}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa truyện "<strong>{selectedStory?.title}</strong>"?</p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => {
                console.log('Cancel delete');
                setShowDeleteModal(false);
              }} disabled={deleteLoading}>
                Hủy
              </button>
              <button onClick={() => {
                console.log('Confirming delete for story:', selectedStory);
                handleDeleteStory();
              }} className="danger" disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <i className="bi bi-arrow-clockwise spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa truyện'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoryManagement; 