import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CoinBalance from '../common/CoinBalance';
import './CoinShop.css';

// Import logo images
import vnpayLogo from '../../assets/logo/logo_vnpay.png';
import momoLogo from '../../assets/logo/logo_momo.png';
import zalopayLogo from '../../assets/logo/logo_zalopay.png';

const CoinShop = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {
        fetchPackages();
        fetchCurrentBalance();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/coin-packages');
            setPackages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Không thể tải danh sách gói tiền xu');
            setLoading(false);
        }
    };

    const fetchCurrentBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://localhost:8080/api/coins/balance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentBalance(response.data.coins || 0);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        setCustomAmount(''); // Clear custom amount when package is selected
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        setSelectedPackage(null); // Clear selected package when custom amount is entered
    };

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
    };

    const calculateCoinsFromAmount = (amount) => {
        // Logic tính xu dựa trên số tiền
        if (amount >= 2000000) return 24000;
        if (amount >= 1000000) return 11500;
        if (amount >= 500000) return 5500;
        if (amount >= 200000) return 2150;
        if (amount >= 100000) return 1050;
        if (amount >= 50000) return 500;
        return Math.floor(amount / 100); // 1 xu = 100 VND
    };

    const getSelectedAmount = () => {
        if (selectedPackage) {
            return selectedPackage.price;
        }
        if (customAmount) {
            return parseInt(customAmount) || 0;
        }
        return 0;
    };

    const getSelectedCoins = () => {
        if (selectedPackage) {
            return selectedPackage.coins + selectedPackage.bonusCoins;
        }
        if (customAmount) {
            return calculateCoinsFromAmount(parseInt(customAmount) || 0);
        }
        return 0;
    };

    const handlePurchase = async () => {
        const amount = getSelectedAmount();
        if (amount === 0) {
            alert('Vui lòng chọn gói hoặc nhập số tiền');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vui lòng đăng nhập để mua tiền xu');
                return;
            }

            // Tạo package tạm thời nếu dùng custom amount
            let packageId = selectedPackage ? selectedPackage.id : null;
            
            const response = await axios.post('http://localhost:8080/api/payments/create', {
                packageId: packageId,
                customAmount: customAmount ? parseInt(customAmount) : null,
                paymentMethod: paymentMethod
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                alert('Có lỗi xảy ra khi tạo thanh toán');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Có lỗi xảy ra khi tạo thanh toán');
        }
    };

    if (loading) {
        return (
            <div className="coin-shop-page">
                <div className="coin-shop-loading">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="coin-shop-page">
                <div className="coin-shop-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="coin-shop-page">
            <div className="coin-shop-container">
                {/* Left Column */}
                <div className="coin-shop-left">
                    {/* Coin Packages */}
                    <div className="coin-packages-section">
                        <h2 className="section-title">Gói nạp xu</h2>
                        <div className="packages-grid">
                            {packages.map((pkg) => (
                                <div 
                                    key={pkg.id} 
                                    className={`coin-package ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                                    onClick={() => handlePackageSelect(pkg)}
                                >
                                    <div className="package-bonus-badge">
                                        +{pkg.bonusCoins} xu
                                    </div>
                                    <div className="package-coins">
                                        {pkg.coins.toLocaleString()} xu
                                    </div>
                                    <div className="package-price">
                                        {pkg.price.toLocaleString()} ₫
                                    </div>
                                    {pkg.bonusCoins > 0 && (
                                        <div className="package-bonus-text">
                                            Tặng {pkg.bonusCoins} xu
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="custom-amount-section">
                        <h2 className="section-title">Số tiền tùy chỉnh</h2>
                        <div className="custom-amount-input">
                            <input
                                type="number"
                                placeholder="Nhập số tiền (tối thiểu 10,000₫)"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                                min="10000"
                            />
                            <span className="currency-label">VND</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="payment-methods-section">
                        <h2 className="section-title">Phương thức thanh toán</h2>
                        <div className="payment-methods-grid">
                            <div 
                                className={`payment-method ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                                onClick={() => handlePaymentMethodSelect('VNPAY')}
                            >
                                <div className="payment-method-icon vnpay">
                                    <img src={vnpayLogo} alt="VNPAY" className="payment-logo" />
                                </div>
                                <span className="payment-method-name">VNPAY</span>
                                {paymentMethod === 'VNPAY' && <i className="bi bi-check-circle-fill"></i>}
                            </div>
                            <div className="payment-method disabled">
                                <div className="payment-method-icon momo disabled">
                                    <img src={momoLogo} alt="MoMo" className="payment-logo" />
                                </div>
                                <span className="payment-method-name">MoMo</span>
                                <span className="payment-method-status">Hiện tại không có</span>
                            </div>
                            <div className="payment-method disabled">
                                <div className="payment-method-icon zalopay disabled">
                                    <img src={zalopayLogo} alt="ZaloPay" className="payment-logo" />
                                </div>
                                <span className="payment-method-name">ZaloPay</span>
                                <span className="payment-method-status">Hiện tại không có</span>
                            </div>
                            <div className="payment-method disabled">
                                <div className="payment-method-icon bank disabled">
                                    <i className="bi bi-bank"></i>
                                </div>
                                <span className="payment-method-name">Chuyển khoản</span>
                                <span className="payment-method-status">Hiện tại không có</span>
                            </div>
                        </div>
                    </div>

                   
                </div>

                {/* Right Column - Order Details */}
                <div className="coin-shop-right">
                    <div className="order-details-card">
                        <h2 className="order-details-title">Chi tiết đơn hàng</h2>
                        
                        <div className="order-details-content">
                            <div className="order-detail-row">
                                <span>Số tiền nạp:</span>
                                <span className="order-amount">{getSelectedAmount().toLocaleString()} VND</span>
                            </div>
                            <div className="order-detail-row">
                                <span>Số xu nhận được:</span>
                                <span className="order-coins">{getSelectedCoins().toLocaleString()} xu</span>
                            </div>
                            <div className="order-detail-row total">
                                <span>Tổng cộng:</span>
                                <span className="order-total">{getSelectedAmount().toLocaleString()} VND</span>
                            </div>
                        </div>

                        <button 
                            className={`purchase-button ${getSelectedAmount() === 0 ? 'disabled' : ''}`}
                            onClick={handlePurchase}
                            disabled={getSelectedAmount() === 0}
                        >
                            Nạp xu ngay
                        </button>

                        <div className="current-promotions">
                            <h3>Ưu đãi hiện tại</h3>
                            <div className="promotion-item">
                                <i className="bi bi-gift-fill"></i>
                                <span>Nạp từ 100K tặng 50 xu</span>
                            </div>
                            <div className="promotion-item">
                                <i className="bi bi-crown-fill"></i>
                                <span>Nạp từ 1M tặng 1500 xu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoinShop; 