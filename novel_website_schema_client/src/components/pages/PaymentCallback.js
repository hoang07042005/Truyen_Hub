import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentCallback.css';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [coins, setCoins] = useState(0);
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Lấy các tham số từ URL
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        const vnp_Amount = searchParams.get('vnp_Amount');
        const vnp_SecureHash = searchParams.get('vnp_SecureHash');

        if (!vnp_ResponseCode || !vnp_TxnRef) {
          setStatus('error');
          setMessage('Thông tin thanh toán không hợp lệ');
          return;
        }

        // Gửi thông tin thanh toán về backend
        const token = localStorage.getItem('token');
        if (!token) {
          setStatus('error');
          setMessage('Phiên đăng nhập đã hết hạn');
          return;
        }

        // Tạo URL với query parameters
        const params = new URLSearchParams({
          vnp_ResponseCode,
          vnp_TxnRef,
          vnp_Amount,
          vnp_SecureHash
        });

        const response = await axios.get(`http://localhost:8080/api/payments/callback?${params.toString()}`);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          setCoins(response.data.coins || 0);
          
          // Lưu thông tin giao dịch
          setTransactionDetails({
            transactionId: vnp_TxnRef,
            amount: parseInt(vnp_Amount) / 100, // VNPAY trả về số tiền nhân 100
            coins: response.data.coins || 0,
            method: 'VNPAY',
            time: new Date().toLocaleString('vi-VN'),
            status: 'Hoàn tất'
          });
          
          // Refresh coin balance trong Layout
          if (window.refreshCoinBalance) {
            window.refreshCoinBalance();
          }
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Thanh toán thất bại');
        }

      } catch (error) {
        console.error('Error processing payment:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    processPayment();
  }, [searchParams]);

  const handleBackToShop = () => {
    navigate('/coin-shop');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="payment-callback-page">
      <div className="payment-callback-container">
        {/* Success Icon */}
        <div className="payment-callback-success-icon">
          <div className="success-circle">
            <i className="bi bi-check-lg"></i>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="payment-callback-main-title">
          Nạp xu thành công!
        </h1>

        {/* Subtitle */}
        <p className="payment-callback-subtitle">
          Xu của bạn đã được cộng vào tài khoản
        </p>

        {/* Coins Amount */}
        <div className="payment-callback-coins-amount">
          <span className="coins-number">+{coins.toLocaleString()} xu</span>
          <p className="coins-description">
            đã được thêm vào tài khoản của bạn
          </p>
        </div>

        {/* Transaction Details Card */}
        {status === 'success' && transactionDetails && (
          <div className="transaction-details-card">
            <div className="transaction-details-content">
              <div className="transaction-detail-row">
                <span className="detail-label">Mã giao dịch:</span>
                <span className="detail-value">{transactionDetails.transactionId}</span>
              </div>
              <div className="transaction-detail-row">
                <span className="detail-label">Số tiền nạp:</span>
                <span className="detail-value">{transactionDetails.amount.toLocaleString()} ₫</span>
              </div>
              <div className="transaction-detail-row">
                <span className="detail-label">Số xu nhận được:</span>
                <span className="detail-value coins-value">{transactionDetails.coins.toLocaleString()} xu</span>
              </div>
              <div className="transaction-detail-row">
                <span className="detail-label">Phương thức:</span>
                <span className="detail-value">{transactionDetails.method}</span>
              </div>
              <div className="transaction-detail-row">
                <span className="detail-label">Thời gian:</span>
                <span className="detail-value">{transactionDetails.time}</span>
              </div>
              <div className="transaction-detail-row">
                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value status-completed">
                  <i className="bi bi-check-circle-fill"></i>
                  {transactionDetails.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="payment-callback-actions">
          {status === 'success' && (
            <button 
              onClick={handleBackToShop} 
              className="payment-callback-btn payment-callback-btn-primary"
            >
              <i className="bi bi-plus-circle"></i>
              Nạp thêm xu
            </button>
          )}
          <button 
            onClick={handleBackToHome} 
            className="payment-callback-btn payment-callback-btn-secondary"
          >
            <i className="bi bi-house"></i>
            Về trang chủ
          </button>
        </div>

        {/* Benefits Section */}
        {status === 'success' && (
          <div className="payment-callback-benefits">
            <h3 className="benefits-title">Bây giờ bạn có thể:</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon unlock">
                  <i className="bi bi-unlock-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Mở khóa chương VIP</h4>
                  <p>Đọc những chương độc quyền và hấp dẫn nhất</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon support">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Ủng hộ tác giả yêu thích</h4>
                  <p>Gửi xu để động viên các tác giả sáng tác</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon adfree">
                  <i className="bi bi-crown-fill"></i>
                </div>
                <div className="benefit-content">
                  <h4>Trải nghiệm không quảng cáo</h4>
                  <p>Đọc truyện mượt mà không bị gián đoạn</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback; 