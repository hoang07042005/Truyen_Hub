import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/CategoryPage.css';

// Map tên thể loại (không dấu, thường) sang class màu và icon
const CATEGORY_STYLE_MAP = [
  { keys: ['tien-hiep', 'fantasy'], color: 'cat-fantasy', icon: 'bi-stars' },
  { keys: ['kiem-hiep', 'action'], color: 'cat-action', icon: 'bi-lightning-fill' },
  { keys: ['do-thi', 'urban'], color: 'cat-drama', icon: 'bi-building' },
  { keys: ['huyen-huyen', 'mystery'], color: 'cat-mystery', icon: 'bi-search' },
  { keys: ['vo-ng-du', 'game'], color: 'cat-sci-fi', icon: 'bi-controller' },
  { keys: ['khoa-huyen', 'sci-fi'], color: 'cat-sci-fi', icon: 'bi-rocket' },
  { keys: ['lang-man', 'romance', 'tinh-cam'], color: 'cat-romance', icon: 'bi-heart-fill' },
  { keys: ['hai-huoc', 'comedy'], color: 'cat-comedy', icon: 'bi-emoji-laughing' },
  { keys: ['kinh-di', 'horror'], color: 'cat-horror', icon: 'bi-ghost' },
  { keys: ['lich-su', 'history'], color: 'cat-drama', icon: 'bi-clock-history' },
  { keys: ['trinh-tham', 'detective'], color: 'cat-mystery', icon: 'bi-search' },
  { keys: ['drama'], color: 'cat-drama', icon: 'bi-chat-left-text' },
];

function toKey(str) {
  return str
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getCategoryStyle(name) {
  const key = toKey(name);
  for (const style of CATEGORY_STYLE_MAP) {
    if (style.keys.includes(key)) return style;
  }
  return { color: 'cat-default', icon: 'bi-book' };
}

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState('all');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchStories();
  }, [selected]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/categories/with-count');
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    let url = 'http://localhost:8080/api/stories?page=0&size=8';
    if (selected !== 'all') {
      url = `http://localhost:8080/api/stories/category/${selected}?page=0&size=8`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      setStories(data.content || data);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const getRandomRating = (id) => {
    const seed = id.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    return (4.0 + (seed % 10) * 0.1).toFixed(1);
  };

  if (!Array.isArray(categories)) return <div>Lỗi tải thể loại</div>;

  return (
    <div className="category-main">
      <div className="category-header">
        <div className="category-header-title">Thể loại truyện</div>
        <div className="category-header-desc">Khám phá các thể loại truyện đa dạng</div>
      </div>
      <div className="category-boxes">
        {categories.map(cat => {
          const style = getCategoryStyle(cat.name);
          const storyCount = cat.storyCount ?? 0;
          const bg = style.color ? `var(--cat-bg)` : '';
          return (
            <div
              key={cat.id}
              className={`category-box ${style.color}`}
              style={{ background: '#fff' }}
              onClick={() => setSelected(cat.id)}
            >
              <div className="category-box-bg" style={{ backgroundImage: `var(--cat-bg)` }}></div>
              <div className="category-box-gradient"></div>
              <div className="category-box-content">
                <div className="category-box-row">
                  <div className="category-box-icon"><i className={`bi ${style.icon}`}></i></div>
                  <div className="category-box-count">
                    {storyCount}
                    <span className="category-box-count-label">truyện</span>
                  </div>
                </div>
                <div className="category-box-title">{cat.name}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="category-tabs">
        <button
          className={`category-tab${selected === 'all' ? ' active' : ''}`}
          onClick={() => setSelected('all')}
        >Tất cả</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab${selected === cat.id ? ' active' : ''}`}
            onClick={() => setSelected(cat.id)}
          >{cat.name}</button>
        ))}
      </div>
      <div className="category-stories-grid">
        {loading ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: '1.1rem'}}>Đang tải...</div>
        ) : stories.map(story => (
          <div className="category-story-card" key={story.id} onClick={() => navigate(`/stories/${story.id}`)} style={{cursor: 'pointer'}}>
            <div className="category-story-cover">
              <img src={story.coverImage || 'https://via.placeholder.com/200x300?text=No+Cover'} alt={story.title} />
              <div className="category-story-rating">
                <i className="bi bi-star-fill"></i>
                <span>{getRandomRating(story.id)}</span>
              </div>
            </div>
            <div className="category-story-info">
              <div className="category-story-title">{story.title}</div>
              <div className="category-story-author">{story.author || 'Không xác định'}</div>
              <div className="category-story-description">{story.description?.substring(0, 60) || 'Một câu chuyện hấp dẫn...'}...</div>
              <div className="category-story-stats">
                <span><i className="bi bi-file-earmark-text"></i> {story.chapterCount || 0} chương</span>
                <span><i className="bi bi-eye"></i> {story.views ? (story.views / 1000).toFixed(1) + 'K' : '0'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage; 