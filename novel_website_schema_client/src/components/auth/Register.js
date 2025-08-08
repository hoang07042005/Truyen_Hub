import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../auth/Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
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
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSuccess('Đăng ký thành công');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      if (err.response) {
        setError(err.response.data || 'Đăng ký thất bại');
      } else {
        setError('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <button 
        className="register-back-btn" 
        onClick={() => navigate('/')}
        title="Về trang chủ"
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      
      <div className="register-card">
        <div className="register-logo">
          <div className="logo-icon"><i className="bi-book"></i></div>
        </div>
        
        <h2>Đăng ký tài khoản</h2>
        <p className="register-subtitle">Tạo tài khoản mới để khám phá thế giới truyện tuyệt vời!</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="social-login">
          <p className="social-separator">Hoặc đăng ký bằng</p>
          <div className="social-buttons">
            <button type="button" className="social-btn google-btn">
              <i className="bi bi-google"></i>
              Google
            </button>
            <button type="button" className="social-btn facebook-btn">
              <i className="bi bi-facebook"></i>
              Facebook
            </button>
          </div>
        </div>

        <div className="login-link">
          Đã có tài khoản? <button 
            type="button" 
            className="link-btn"
            onClick={() => navigate('/login')}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register; 