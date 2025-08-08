import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../pages/StoryList.css';

function StoryList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Lấy search term từ URL params
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl !== searchTerm) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchStories();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory, selectedSort]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8080/api/stories?page=${currentPage}&size=20`;
      let sortParam = '';
      if (selectedSort === 'popular') {
        sortParam = '&sort=views,desc';
      } else if (selectedSort === 'latest') {
        sortParam = '&sort=createdAt,desc';
      } else if (selectedSort === 'views') {
        sortParam = '&sort=views,desc';
      } else if (selectedSort === 'rating') {
        sortParam = '&sort=views,desc'; // Tạm thời sort theo views, sẽ sort lại ở frontend
      }
      
      if (searchTerm) {
        url = `http://localhost:8080/api/stories/search?keyword=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=20${sortParam}`;
      } else if (selectedCategory) {
        url = `http://localhost:8080/api/stories/category/${selectedCategory}?page=${currentPage}&size=20${sortParam}`;
      } else {
        url += sortParam;
      }

      const response = await axios.get(url);
      
      let processedStories = response.data;
      if (response.data.content) {
        processedStories = response.data.content;
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      } else {
        setTotalPages(1);
        setTotalElements(processedStories.length);
      }
      
      // Sort lại theo selectedSort nếu cần
      if (selectedSort === 'rating') {
        processedStories.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (selectedSort === 'likes') {
        processedStories.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      }
      
      setStories(processedStories);
    } catch (err) {
      setError('Lỗi khi tải danh sách truyện');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(0);
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSort('popular');
    setCurrentPage(0);
  };

  const handleStoryClick = (storyId) => {
    navigate(`/stories/${storyId}`);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };



  if (loading && stories.length === 0) {
    return (
      <div className="story-list-container">
        <div className="story-list-loading">Đang tải danh sách truyện...</div>
      </div>
    );
  }

  return (
    <div className="story-list-container">
      <div className="story-list-header">
        <h1>Danh sách truyện</h1>
        <p>Khám phá kho tàng truyện đa dạng và phong phú</p>
      </div>

      {/* Search and Filter */}
      <div className="story-list-filters">
        <form onSubmit={handleSearch} className="story-list-search-form">
          <div className="story-list-search-input-container">
            <i className="bi-search story-list-search-icon"></i>
          <input
            type="text"
              placeholder="Tìm kiếm theo tên truyện hoặc tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="story-list-search-input"
          />
          </div>
        </form>

        <div className="story-list-filter-controls">
          <div className="story-list-filter-group">
            <label className="story-list-filter-label">Thể loại:</label>
          <select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
              className="story-list-filter-select"
          >
            <option value="">Tất cả thể loại</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          </div>

          <div className="story-list-filter-group">
            <label className="story-list-filter-label">Sắp xếp:</label>
            <select 
              value={selectedSort} 
              onChange={handleSortChange}
              className="story-list-filter-select"
            >
              <option value="popular">Phổ biến</option>
              <option value="latest">Mới nhất</option>
              <option value="views">Lượt xem</option>
              <option value="rating">Đánh giá</option>
              <option value="likes">Lượt thích</option>
            </select>
          </div>

          {/* {(searchTerm || selectedCategory || selectedSort !== 'popular') && (
            <button onClick={clearFilters} className="story-list-clear-btn">
              <i className="bi-x-circle me-1"></i>Xóa bộ lọc
            </button>
          )} */}
        </div>
      </div>

      {/* Dòng hiển thị số truyện nằm bên dưới bộ lọc */}
      <div className="story-list-results-info" style={{margin: '1.2rem 0'}}>
        Hiển thị {stories.length} trong tổng số {totalElements} truyện
      </div>

      {error && <div className="story-list-error-message">{error}</div>}

      {/* Stories Grid */}
      <div className="story-list-stories-grid">
        {stories.map(story => (
          <div key={story.id} className="story-list-story-card" onClick={() => handleStoryClick(story.id)}>
            <div className="story-list-story-cover">
              <img 
                src={story.coverImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwQzExMS4wNDYgMTUwIDEyMCAxNDEuMDQ2IDEyMCAxMzBDMTIwIDExOC45NTQgMTExLjA0NiAxMTAgMTAwIDExMEM4OC45NTQgMTEwIDgwIDExOC45NTQgODAgMTMwQzgwIDE0MS4wNDYgODguOTU0IDE1MCAxMDAgMTUwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4MCIgeT0iMTEwIj4KPHBhdGggZD0iTTIwIDIwQzIwIDE3LjIzOSAyMi4yMzkgMTUgMjUgMTVIMzVDMzcuNzYxIDE1IDQwIDE3LjIzOSA0MCAyMFYzMEM0MCAzMi43NjEgMzcuNzYxIDM1IDM1IDM1SDI1QzIyLjIzOSAzNSAyMCAzMi43NjEgMjAgMzBWMjBaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyM0gyN1YyNUgyNVYyM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDI3SDI3VjI5SDI1VjI3WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAgMjNIMzJWMjVIMzBWMjNaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMCAyN0gzMlYyOUgzMFYyN1oiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjx0ZXh0IHg9IjEwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjc3NDhBIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4K'} 
                alt={story.title}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTUwQzExMS4wNDYgMTUwIDEyMCAxNDEuMDQ2IDEyMCAxMzBDMTIwIDExOC45NTQgMTExLjA0NiAxMTAgMTAwIDExMEM4OC45NTQgMTEwIDgwIDExOC45NTQgODAgMTMwQzgwIDE0MS4wNDYgODguOTU0IDE1MCAxMDAgMTUwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4MCIgeT0iMTEwIj4KPHBhdGggZD0iTTIwIDIwQzIwIDE3LjIzOSAyMi4yMzkgMTUgMjUgMTVIMzVDMzcuNzYxIDE1IDQwIDE3LjIzOSA0MCAyMFYzMEM0MCAzMi43NjEgMzcuNzYxIDM1IDM1IDM1SDI1QzIyLjIzOSAzNSAyMCAzMi43NjEgMjAgMzBWMjBaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyM0gyN1YyNUgyNVYyM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDI3SDI3VjI5SDI1VjI3WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAgMjNIMzJWMjVIMzBWMjNaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMCAyN0gzMlYyOUgzMFYyN1oiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjx0ZXh0IHg9IjEwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjc3NDhBIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIENvdmVyPC90ZXh0Pgo8L3N2Zz4K';
                }}
              />
              <div className="story-list-story-tags-row">
                <span className="story-list-genre-tag" data-genre={story.categories?.[0] || 'Fantasy'}>{story.categories?.[0] || 'Fantasy'}</span>
                <span className={`story-list-status-tag ${story.status === 'COMPLETED' ? 'completed' : 'ongoing'}`}>
                  {story.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang ra'}
                </span>
              </div>
              <div className="story-list-story-rating">
                <i className="bi-star-fill"></i>
                <span>{story.averageRating ? story.averageRating.toFixed(1) : '0.0'}</span>
              </div>
            </div>
            <div className="story-list-story-info">
              <h3 className="story-list-story-title">{story.title}</h3>
              <p className="story-list-story-author">Tác giả: {story.author || 'Không xác định'}</p>
              <p className="story-list-story-description">{story.description?.substring(0, 80) || 'Một câu chuyện hấp dẫn đang chờ bạn khám phá...'}...</p>
              <div className="story-list-story-stats">
                <span><i className="bi-file-text me-1"></i>{story.chapterCount || 0} chương</span>
                <span><i className="bi-star-fill me-1"></i>{story.averageRating ? story.averageRating.toFixed(1) : '0.0'} ({story.ratingCount || 0})</span>
                <span><i className="bi-heart-fill me-1"></i>{story.likeCount || 0}</span>
                <span><i className="bi-eye me-1"></i>{formatNumber(story.viewCount || story.views || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="story-list-pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="story-list-pagination-btn"
          >
            <i className="bi-chevron-left"></i>
          </button>
          
          <div className="story-list-page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum - 1)}
                  className={`story-list-page-btn ${currentPage === pageNum - 1 ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="story-list-pagination-btn"
          >
            <i className="bi-chevron-right"></i>
          </button>
        </div>
      )}

      {stories.length === 0 && !loading && (
        <div className="story-list-no-stories">
          <p>Không tìm thấy truyện nào phù hợp.</p>
        </div>
      )}
    </div>
  );
}

export default StoryList; 