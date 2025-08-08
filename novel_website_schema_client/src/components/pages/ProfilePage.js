import React, { useEffect, useState } from 'react';
import '../pages/ProfilePage.css';
import HistoryPage from './HistoryPage';
import FavoritesPage from './FavoritesPage';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { key: 'overview', label: 'Tổng quan', icon: 'bi-grid' },
  { key: 'favorites', label: 'Theo dõi', icon: 'bi-bookmark' },
  { key: 'history', label: 'Lịch sử đọc', icon: 'bi-clock-history' },
  { key: 'settings', label: 'Cài đặt', icon: 'bi-gear' },
];

function FavoriteSummary({ onViewAll }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Favorites data:', data); // Debug log
        setFavorites(data.slice(0, 3));
        setLoading(false);
      });
  }, []);
  if (loading) return <div>Đang tải...</div>;
  return (
    <div className="profile-summary-card">
      <div className="profile-summary-header">
        <b>Truyện được theo dõi</b>
        <button className="profile-summary-viewall" onClick={onViewAll}>Xem tất cả →</button>
      </div>
      <ul className="profile-fav-list">
        {favorites.map((story, index) => (
          <li key={story.id || story.storyId || index} className="profile-fav-card">
            <div className="profile-fav-cover-wrap">
              <img src={story.coverImage || '/default-cover.png'} alt={story.title} className="profile-fav-cover" />
             
            </div>
            <div className="profile-fav-info">
              <div className="profile-fav-title">{story.title}</div>
              <span className={`profile-fav-status-badge ${story.status === 'COMPLETED' ? 'completed' : 'ongoing'}`}>{story.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}</span>
              <div className="profile-fav-author">{story.author}</div>
              
              <div className="profile-fav-meta-row">
                {story.rating && <span className="profile-fav-rating"><i className="bi bi-star-fill"></i> {story.rating}</span>}
              </div>
              <div className="profile-fav-progress-row">
                {story.chapterCount && <span style={{color:'#4f8cff', fontSize:16}}>{story.chapterCount} chương</span>}
              </div>
              <div className="profile-fav-meta-row">
              Thể loại: <span className="profile-fav-genre-badge">{story.genre}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HistorySummary({ onViewAll }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Lấy mỗi truyện 1 entry mới nhất
        const grouped = Object.values(data.reduce((acc, item) => {
          if (!acc[item.storyId] || new Date(item.lastReadAt) > new Date(acc[item.storyId].lastReadAt)) {
            acc[item.storyId] = item;
          }
          return acc;
        }, {}));
        setHistory(grouped.sort((a,b) => new Date(b.lastReadAt)-new Date(a.lastReadAt)).slice(0,4));
        setLoading(false);
      });
  }, []);
  if (loading) return <div>Đang tải...</div>;
  return (
    <div className="profile-summary-card">
      <div className="profile-summary-header">
        <b>Lịch sử đọc gần đây</b>
        <button className="profile-summary-viewall" onClick={onViewAll}>Xem tất cả →</button>
      </div>
      <ul className="profile-hist-list">
        {history.map(item => (
          <li key={item.id} className="profile-hist-card">
            <div className="profile-hist-cover-wrap">
              <img src={item.coverImage || '/default-cover.png'} alt={item.title} className="profile-hist-cover" />
            </div>
            <div className="profile-hist-info">
              <div className="profile-hist-title-row">
                <span className="profile-hist-title">{item.title || `Truyện #${item.storyId}`}</span>
                {item.lastReadAt && <span className="profile-hist-time">{formatTimeAgo(item.lastReadAt)}</span>}
              </div>
              
              <div className="profile-hist-author">{item.author || ''}</div>
              <div className="profile-hist-chapter">{item.chapterTitle}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const updated = new Date(date);
  const diff = (now - updated) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return Math.floor(diff/60) + ' phút trước';
  if (diff < 86400) return Math.floor(diff/3600) + ' giờ trước';
  return Math.floor(diff/86400) + ' ngày trước';
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editData, setEditData] = useState({ username: '', email: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState(0);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCoinBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/coins/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.coins || 0);
      }
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    } finally {
      setCoinsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn chưa đăng nhập.');
      setLoading(false);
      return;
    }
    fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể lấy thông tin tài khoản.');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setEditData({
          username: data.username || '',
          email: data.email || '',
          avatar: data.avatar || ''
        });
        setAvatarPreview(data.avatar || '');
        setLoading(false);
        // Fetch coin balance after user data is loaded
        fetchCoinBalance();
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files && files[0]) {
      setAvatarFile(files[0]);
      setAvatarPreview(URL.createObjectURL(files[0]));
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    let avatarUrl = editData.avatar;

    if (avatarFile) {
      // Upload file lên server
      const formData = new FormData();
      formData.append('file', avatarFile);
      const uploadRes = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!uploadRes.ok) {
        alert('Upload ảnh thất bại');
        setSaving(false);
        return;
      }
      avatarUrl = await uploadRes.text(); // hoặc uploadRes.json() nếu trả về JSON
    }

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...editData, avatar: avatarUrl })
      });
      if (!res.ok) throw new Error('Cập nhật hồ sơ thất bại');
      const updated = await res.json();
      setUser(updated);
      setShowEdit(false);
      setAvatarFile(null);
      setAvatarPreview(updated.avatar || '');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-page-container">Đang tải thông tin tài khoản...</div>;
  if (error) return <div className="profile-page-container">{error}</div>;
  if (!user) return <div className="profile-page-container">Không tìm thấy thông tin tài khoản.</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-page-dashboard">
        <aside className="profile-page-sidebar-modern">
          <div className="profile-page-avatar-block">
            <div className="profile-page-avatar-wrap">
              <img
                src={user.avatar || 'https://via.placeholder.com/100x100/6b7280/ffffff?text=U'}
                alt="Avatar"
                className="profile-page-avatar-img"
                                  onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x100/6b7280/ffffff?text=U'; }}
              />
              <span className="profile-page-status-dot"></span>
            </div>
            <h2 className="profile-page-name">{user.username}</h2>
            <div className="profile-page-usertag">{user.email}</div>
            <div className="profile-page-badge-row">
              <span className="profile-page-badge"><i className="bi bi-gem"></i> {user.badge}</span>
            </div>
            <div className="profile-page-points-row">
              <span className="profile-page-points">
                <i className="bi bi-coin"></i> 
                {coinsLoading ? 'Đang tải...' : `${coins.toLocaleString()} xu`}
              </span>
              <span className="profile-page-join">
                <i className="bi bi-calendar"></i>
                {user.createdAt && new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button className="profile-page-edit-btn-modern" onClick={() => setShowEdit(true)}>
              <i className="bi bi-pencil"></i> Chỉnh sửa hồ sơ
            </button>
          </div>
          <nav className="profile-page-menu-modern">
            {menuItems.map(item => (
              <button
                key={item.key}
                className={`profile-page-menu-item${activeTab === item.key ? ' active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <i className={`bi ${item.icon}`}></i> {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="profile-page-main">
          {/* Nội dung tab sẽ ở đây */}
          {activeTab === 'overview' && (
            <section className="profile-page-section">
              <div className="profile-summary-dashboard">
                <FavoriteSummary onViewAll={()=>setActiveTab('favorites')} />
                <HistorySummary onViewAll={()=>setActiveTab('history')} />
              </div>
              
            </section>
          )}
          {activeTab === 'favorites' && (
            <section className="profile-page-section">
              <FavoritesPage />
            </section>
          )}
          {activeTab === 'history' && (
            <section className="profile-page-section">
              <HistoryPage />
            </section>
          )}
        </main>
      </div>

      {/* Modal chỉnh sửa hồ sơ */}
      {showEdit && (
        <div className="profile-page-modal">
          <div className="profile-page-modal-content">
            <h3>Chỉnh sửa hồ sơ</h3>
            <form onSubmit={handleEditSubmit}>
              <label>
                Tên đăng nhập:
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <label>
                Ảnh đại diện:
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleEditChange}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: '1px',
                    height: '1px'
                  }}
                />
                <div 
                  onClick={() => document.querySelector('input[name="avatar"]').click()}
                  style={{
                    padding: '0.7rem 1rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: '#f8f9fb',
                    color: '#333',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '0.4rem'
                  }}
                >
                  {avatarPreview || editData.avatar ? 'Đã chọn ảnh' : 'Chưa chọn ảnh'}
                </div>
              </label>
              {(avatarPreview || editData.avatar) && (
                <img
                  src={avatarPreview || editData.avatar}
                  alt="Avatar Preview"
                  className="profile-page-avatar-preview"
                />
              )}
              <div className="profile-page-modal-actions">
                <button type="button" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage; 