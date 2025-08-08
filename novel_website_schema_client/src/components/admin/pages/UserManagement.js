import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage - 1,
        size: 5,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        sort: 'createdAt,desc'
      });

      const response = await axios.get(`http://localhost:8080/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Users data received:', response.data);
      if (response.data.content) {
        response.data.content.forEach(user => {
          console.log('User avatar data:', user.username, 'avatar:', user.avatar);
        });
      }
      
      setUsers(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalElements || 0);
    } catch (err) {
      setError('Lỗi khi tải danh sách người dùng');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:8080/api/admin/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
      alert('Xóa người dùng thành công!');
    } catch (err) {
      alert('Lỗi khi xóa người dùng: ' + (err.response?.data || 'Lỗi không xác định'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(`http://localhost:8080/api/admin/users/${userId}/role`, {
        role: newRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchUsers();
      alert('Cập nhật vai trò thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật vai trò: ' + (err.response?.data || 'Lỗi không xác định'));
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'USER': { text: 'Người dùng', class: 'role-user' },
      'PREMIUM': { text: 'Premium', class: 'role-premium' },
      'AUTHOR': { text: 'Tác giả', class: 'role-author' },
      'ADMIN': { text: 'Admin', class: 'role-admin' }
    };
    const roleInfo = roleMap[role] || { text: role, class: 'role-unknown' };
    return <span className={`role-badge ${roleInfo.class}`}>{roleInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading">Đang tải danh sách người dùng...</div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div className="header-content">
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tất cả người dùng trên hệ thống</p>
        </div>
        <button 
          className="add-user-btn"
          onClick={() => navigate('/admin/add-user')}
        >
          <i className="bi bi-plus-circle"></i>
          Thêm người dùng
        </button>
      </div>

      <div className="user-management-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'USER' ? 'active' : ''}`}
            onClick={() => setStatusFilter('USER')}
          >
            Người dùng
          </button>
          {/* <button 
            className={`filter-tab ${statusFilter === 'PREMIUM' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PREMIUM')}
          >
            Premium
          </button> */}
          <button 
            className={`filter-tab ${statusFilter === 'AUTHOR' ? 'active' : ''}`}
            onClick={() => setStatusFilter('AUTHOR')}
          >
            Tác giả
          </button>
        </div>
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="user-management-table">
        <table>
          <thead>
            <tr>
              <th>NGƯỜI DÙNG</th>
              <th>EMAIL</th>
              <th>VAI TRÒ</th>
              <th>NGÀY THAM GIA</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.avatar && user.avatar.trim() !== '' ? (
                        <img
                          src={
                            user.avatar
                              ? user.avatar.startsWith('http')
                                ? user.avatar
                                : user.avatar.startsWith('/uploads/')
                                  ? `http://localhost:8080${user.avatar}`
                                  : `http://localhost:8080/uploads/avatars/${user.avatar}`
                              : ''
                          }
                          alt={user.username}
                          onError={(e) => {
                            console.log('Avatar load error for user:', user.username, 'avatar:', user.avatar);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="avatar-placeholder" style={{display: user.avatar && user.avatar.trim() !== '' ? 'none' : 'flex'}}>
                        <i className="bi bi-person"></i>
                      </div>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-stats">{user.storiesReadCount || 0} truyện đã đọc</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="USER">Người dùng</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="AUTHOR">Tác giả</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/admin/edit-user/${user.id}`)}
                      title="Sửa người dùng"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/admin/view-user/${user.id}`)}
                      title="Xem người dùng"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => openDeleteModal(user)}
                      title="Xóa người dùng"
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

      {users.length === 0 && !loading && (
        <div className="no-users">
          <i className="bi bi-people"></i>
          <p>Không có người dùng nào</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            <span>Hiển thị {((currentPage - 1) * 5) + 1} đến {Math.min(currentPage * 5, totalItems)} trong tổng số {totalItems.toLocaleString()} người dùng</span>
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
              <p>Bạn có chắc chắn muốn xóa người dùng "<strong>{selectedUser?.username}</strong>"?</p>
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
                console.log('Confirming delete for user:', selectedUser);
                handleDeleteUser();
              }} className="danger" disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <i className="bi bi-arrow-clockwise spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  'Xóa người dùng'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement; 