import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Token không hợp lệ hoặc đã hết hạn');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

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
    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', null, {
        params: {
          token: token,
          newPassword: formData.newPassword
        }
      });

      setSuccess('Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        // Xử lý error response từ backend
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Đặt lại mật khẩu thất bại');
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-logo">
            <div className="logo-icon"><i className="bi bi-exclamation-triangle"></i></div>
          </div>
          <h2>Token không hợp lệ</h2>
          <p className="reset-password-subtitle">Token đã hết hạn hoặc không tồn tại</p>
          <button 
            className="reset-password-btn"
            onClick={() => navigate('/forgot-password')}
          >
            Quay lại trang quên mật khẩu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <button 
        className="reset-password-back-btn" 
        onClick={() => navigate('/login')}
        title="Quay lại đăng nhập"
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      
      <div className="reset-password-card">
        <div className="reset-password-logo">
          <div className="logo-icon"><i className="bi bi-shield-check"></i></div>
        </div>
        
        <h2>Đặt lại mật khẩu</h2>
        <p className="reset-password-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>
        
        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i>
            {typeof error === 'string' ? error : 'Đã xảy ra lỗi không xác định'}
          </div>
        )}
        {success && (
          <div className="success-message">
            <i className="bi bi-check-circle"></i>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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

          <button type="submit" disabled={loading} className="reset-password-btn">
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>

        <div className="reset-password-links">
          <button 
            type="button" 
            className="back-to-login-btn"
            onClick={() => navigate('/login')}
          >
            <i className="bi bi-arrow-left"></i> Quay lại đăng nhập
          </button>
          
          <div className="support-link">
            Cần hỗ trợ? <button 
              type="button" 
              className="contact-btn"
              onClick={() => navigate('/contact')}
            >
              Liên hệ chúng tôi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 