import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/RankingPage.css';

const TABS = [
  { id: 'views', label: 'Lượt đọc' },
  { id: 'rating', label: 'Đánh giá' },
  { id: 'likes', label: 'Yêu thích' },
];

const GENRES = ['Romance', 'Horror', 'Action', 'Comedy', 'Mystery', 'Fantasy', 'Sci-Fi'];

function RankingPage() {
  const [activeTab, setActiveTab] = useState('views');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRanking();
  }, [activeTab]);

  const fetchRanking = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (activeTab === 'views') {
        url = 'http://localhost:8080/api/stories?sort=views,desc&page=0&size=20';
      } else if (activeTab === 'rating') {
        url = 'http://localhost:8080/api/stories?sort=rating,desc&page=0&size=20';
      } else if (activeTab === 'likes') {
        url = 'http://localhost:8080/api/stories?sort=likes,desc&page=0&size=20';
      }
      const response = await axios.get(url);
      let stories = response.data.content || response.data;
      // Sort lại theo tab
      if (activeTab === 'views') {
        stories = stories.slice().sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (activeTab === 'rating') {
        stories = stories.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (activeTab === 'likes') {
        stories = stories.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }
      setStories(stories);
    } catch (err) {
      setError('Lỗi khi tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  const getGenre = (story) => {
    // Ưu tiên lấy genre từ story, nếu không có thì random
    if (story.genre) return story.genre;
    const idx = story.id ? story.id % GENRES.length : 0;
    return GENRES[idx];
  };

  const getScore = (story) => {
    if (activeTab === 'views') return story.views;
    if (activeTab === 'rating') return story.rating;
    if (activeTab === 'likes') return story.likes;
    return story.views;
  };

  const getScoreText = (story) => {
    const score = getScore(story);
    if (activeTab === 'views' || activeTab === 'likes') {
      if (!score) return '0';
      if (score >= 1000000) return (score / 1000000).toFixed(1) + 'M';
      if (score >= 1000) return (score / 1000).toFixed(1) + 'K';
      return score.toString();
    }
    if (activeTab === 'rating') {
      return score ? score.toFixed(1) : '0.0';
    }
    return score;
  };

  const getChange = (story) => {
    // Giả lập tăng/giảm, thực tế lấy từ API
    if (story.change !== undefined) return story.change;
    if (!story.id) return 0;
    return story.id % 2 === 0 ? 12 : -2;
  };

  return (
    <div className="ranking-container">
      <div className="ranking-title">Bảng xếp hạng</div>
      <div className="ranking-desc">Những truyện được yêu thích nhất</div>
      <div className="ranking-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`ranking-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ranking-list">
        {loading && <div className="ranking-item">Đang tải...</div>}
        {error && <div className="ranking-item">{error}</div>}
        {!loading && !error && stories.map((story, idx) => (
          <div className="ranking-item" key={story.id}>
            <div className={`ranking-order rank-${idx+1 <= 3 ? idx+1 : 'other'}`}>{idx+1}</div>
            <div className="ranking-cover">
              <img src={story.coverImage || 'https://via.placeholder.com/48x64?text=No+Cover'} alt={story.title} />
            </div>
            <div className="ranking-info">
              <div className="ranking-title-row">
                <div className="ranking-story-title">{story.title}</div>
              </div>
              <div className="ranking-story-author">Tác giả: {story.author || 'Không xác định'}</div>
              <span className="ranking-genre-tag" data-genre={getGenre(story)}>{getGenre(story)}</span>
            </div>
            <div className="ranking-score-block">
              <div className="ranking-score">{getScoreText(story)}</div>
              <div className={getChange(story) >= 0 ? 'ranking-score-up' : 'ranking-score-down'}>
                <i className={`bi ${getChange(story) >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                {getChange(story) >= 0 ? '+' : ''}{getChange(story)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingPage; 