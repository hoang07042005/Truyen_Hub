import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChangePassword.css';

function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      setLoading(false);
      return;
    }

    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Đổi mật khẩu thành công');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data || 'Đổi mật khẩu thất bại');
      } else {
        setError('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <button 
        className="change-password-back-btn" 
        onClick={() => navigate('/profile')}
        title="Quay lại hồ sơ"
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      
      <div className="change-password-card">
        <div className="change-password-logo">
          <div className="logo-icon"><i className="bi bi-shield-lock"></i></div>
        </div>
        
        <h2>Đổi mật khẩu</h2>
        <p className="change-password-subtitle">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button type="submit" disabled={loading} className="change-password-btn">
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>

        <div className="change-password-links">
          <button 
            type="button" 
            className="back-to-profile-btn"
            onClick={() => navigate('/profile')}
          >
            <i className="bi bi-arrow-left"></i> Quay lại hồ sơ
          </button>
          
          <div className="security-tips">
            <h4>Mẹo bảo mật:</h4>
            <ul>
              <li>Sử dụng ít nhất 8 ký tự</li>
              <li>Kết hợp chữ hoa, chữ thường và số</li>
              <li>Không sử dụng thông tin cá nhân</li>
              <li>Thay đổi mật khẩu định kỳ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword; 