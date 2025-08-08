import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../common/Breadcrumb.css';

function Breadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const items = [];

    // Add home
    items.push({
      label: 'Trang chủ',
      path: '/',
      isActive: pathSegments.length === 0
    });

    if (pathSegments.length > 0) {
      if (pathSegments[0] === 'stories') {
        items.push({
          label: 'Danh sách truyện',
          path: '/stories',
          isActive: pathSegments.length === 1
        });

        if (pathSegments.length > 1) {
          // Story detail page
          items.push({
            label: 'Chi tiết truyện',
            path: `/stories/${pathSegments[1]}`,
            isActive: pathSegments.length === 2
          });

          if (pathSegments.length > 2 && pathSegments[2] === 'chapters') {
            // Chapter reader page
            items.push({
              label: 'Đọc chương',
              path: `/stories/${pathSegments[1]}/chapters/${pathSegments[3]}`,
              isActive: true
            });
          }
        }
      } else if (pathSegments[0] === 'categories') {
        items.push({
          label: 'Thể loại',
          path: '/categories',
          isActive: true
        });
      } else if (pathSegments[0] === 'ranking') {
        items.push({
          label: 'Bảng xếp hạng',
          path: '/ranking',
          isActive: true
        });
      }
    }

    return items;
  };

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <nav className="breadcrumb">
      <div className="breadcrumb-container">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            <button
              className={`breadcrumb-item ${item.isActive ? 'active' : ''}`}
              onClick={() => !item.isActive && handleBreadcrumbClick(item.path)}
              disabled={item.isActive}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}

export default Breadcrumb; 