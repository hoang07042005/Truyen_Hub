import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!email) {
      setError('Vui lòng nhập email');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      // Gọi API quên mật khẩu (cần implement ở backend)
      await axios.post('http://localhost:8080/api/auth/forgot-password', {
        email: email
      });

      setSuccess('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn');
      setEmail('');
    } catch (err) {
      if (err.response) {
        setError(err.response.data || 'Có lỗi xảy ra khi gửi email');
      } else {
        setError('Lỗi kết nối server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <button 
        className="forgot-password-back-btn" 
        onClick={() => navigate('/login')}
        title="Quay lại đăng nhập"
      >
        <i className="bi bi-arrow-left"></i>
      </button>
      
      <div className="forgot-password-card">
        <div className="forgot-password-logo">
          <div className="logo-icon"><i className="bi-book"></i></div>
        </div>
        
        <h2>Quên mật khẩu?</h2>
        <p className="forgot-password-subtitle">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email đã đăng ký</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
            />
          </div>

          <button type="submit" disabled={loading} className="forgot-password-btn">
            {loading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại'}
          </button>
        </form>

        <div className="forgot-password-links">
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

export default ForgotPassword; 