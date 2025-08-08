import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UnlockChapterButton.css';

const UnlockChapterButton = ({ chapterId, coinsRequired, onUnlockSuccess }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUnlockStatus();
    }, [chapterId]);

    const checkUnlockStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/chapters/unlock/${chapterId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setIsUnlocked(response.data.unlocked);
            setIsLoading(false);
        } catch (error) {
            console.error('Error checking unlock status:', error);
            setError('Không thể kiểm tra trạng thái chapter');
            setIsLoading(false);
        }
    };

    const handleUnlock = async () => {
        setIsUnlocking(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/chapters/unlock', {
                chapterId: chapterId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setIsUnlocked(true);
                if (onUnlockSuccess) {
                    onUnlockSuccess();
                }
            } else {
                setError(response.data.message || 'Mở khóa thất bại');
            }
        } catch (error) {
            console.error('Error unlocking chapter:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Có lỗi xảy ra khi mở khóa chapter');
            }
        } finally {
            setIsUnlocking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="unlock-button loading">
                <div className="spinner"></div>
                <span>Đang kiểm tra...</span>
            </div>
        );
    }

    if (isUnlocked) {
        return (
            <div className="unlock-button unlocked">
                <span>✓ Đã mở khóa</span>
            </div>
        );
    }

    return (
        <div className="unlock-button-container">
            <button 
                className={`unlock-button ${isUnlocking ? 'unlocking' : ''}`}
                onClick={handleUnlock}
                disabled={isUnlocking}
            >
                {isUnlocking ? (
                    <>
                        <div className="spinner"></div>
                        <span>Đang mở khóa...</span>
                    </>
                ) : (
                    <>
                        <span className="unlock-icon">🔓</span>
                        <span>Mở khóa ({coinsRequired} 🪙)</span>
                    </>
                )}
            </button>
            {error && (
                <div className="unlock-error">
                    {error}
                </div>
            )}
        </div>
    );
};

export default UnlockChapterButton; 