import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../auth/Login.css';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '', // Single field for username or email
    password: ''
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

  // Function to detect if input is email or username
  const isEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    if (!formData.identifier) {
      setError('Vui lòng nhập tên đăng nhập hoặc email');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        password: formData.password
      };

      // Auto-detect if identifier is email or username
      if (isEmail(formData.identifier)) {
        requestData.email = formData.identifier;
      } else {
        requestData.username = formData.identifier;
      }

      const response = await axios.post('http://localhost:8080/api/auth/login', requestData);

      setSuccess('Đăng nhập thành công');
      
      // Store user data in localStorage
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('avatar', response.data.avatar);
      
      // Check role and redirect accordingly
      if (response.data.role === 'ADMIN') {
        // Store admin data separately
        localStorage.setItem('adminToken', response.data.accessToken);
        localStorage.setItem('adminUsername', response.data.username);
        localStorage.setItem('adminEmail', response.data.email);
        localStorage.setItem('adminRole', response.data.role);
        localStorage.setItem('adminId', response.data.userId);
        localStorage.setItem('adminAvatar', response.data.avatar);
        
        // Redirect to admin dashboard
        navigate('/admin');
      } else {
        // Regular user - call the success callback with user data
        if (onLoginSuccess) {
          onLoginSuccess({
            accessToken: response.data.accessToken,
            username: response.data.username,
            email: response.data.email,
            userId: response.data.userId,
            role: response.data.role,
            avatar: response.data.avatar
          });
        }
        
        // Redirect to user dashboard
        navigate('/');
      }
      
      setFormData({
        identifier: '',
        password: ''
      });
    } catch (err) {
      if (err.response) {
        setError(err.response.data || 'Đăng nhập thất bại');
      } else {
        setError('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button 
        className="login-back-btn" 
        onClick={() => navigate('/')}
        title="Về trang chủ"
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon"><i className="bi-book"></i></div>
        </div>
        
        <h2>Đăng nhập</h2>
        <p className="login-subtitle">Chào mừng bạn trở lại! Đăng nhập để tiếp tục đọc truyện.</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email hoặc tên đăng nhập</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              placeholder="Nhập email hoặc tên đăng nhập"
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

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <button 
              type="button" 
              className="forgot-password"
              onClick={() => navigate('/forgot-password')}
            >
              Quên mật khẩu?
            </button>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="social-login">
          <p className="social-separator">Hoặc đăng nhập bằng</p>
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

        <div className="register-link">
          Chưa có tài khoản? <button 
            type="button" 
            className="link-btn"
            onClick={() => navigate('/register')}
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;