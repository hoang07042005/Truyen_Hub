import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ChangePassword from './components/auth/ChangePassword';
import ResetPassword from './components/auth/ResetPassword';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import CategoryPage from './components/pages/CategoryPage';
import StoryList from './components/pages/StoryList';
import StoryDetail from './components/pages/StoryDetail';
import ChapterReader from './components/pages/ChapterReader';
import RankingPage from './components/pages/RankingPage';
import ProfilePage from './components/pages/ProfilePage';
import HistoryPage from './components/pages/HistoryPage';
import FavoritesPage from './components/pages/FavoritesPage';
import CoinShop from './components/pages/CoinShop';
import PaymentCallback from './components/pages/PaymentCallback';
import UnlockChapter from './components/pages/UnlockChapter';

import LayoutAdmin from './components/admin/layout/LayoutAdmin';
import DashboardAdmin from './components/admin/pages/DashboardAdmin';
import StoryManagement from './components/admin/pages/StoryManagement';
import AddStory from './components/admin/pages/AddStory';
import EditStory from './components/admin/pages/EditStory';
import ViewStory from './components/admin/pages/ViewStory';
import AddChapter from './components/admin/pages/AddChapter';
import EditChapter from './components/admin/pages/EditChapter';
import ViewChapter from './components/admin/pages/ViewChapter';
import UserManagement from './components/admin/pages/UserManagement';
import CategoryManagement from './components/admin/pages/CategoryManagement';
import Statistics from './components/admin/pages/Statistics';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ element, isAuthenticated, redirectTo = '/login' }) => {
  return isAuthenticated ? element : <Navigate to={redirectTo} replace />;
};

// Error Page Component
const ErrorPage = ({ message = "Trang không tồn tại" }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
    <h2 style={{ marginBottom: '1rem' }}>{message}</h2>
    <button 
      onClick={() => window.location.href = '/'}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem'
      }}
    >
      Về trang chủ
    </button>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const adminToken = localStorage.getItem('adminToken');
        const adminUsername = localStorage.getItem('adminUsername');
        
        if (adminToken && adminUsername) {
          setIsAdminAuthenticated(true);
          setIsAuthenticated(false);
        } else if (token && username) {
          setIsAuthenticated(true);
          setIsAdminAuthenticated(false);
        } else {
          setIsAuthenticated(false);
          setIsAdminAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setIsAdminAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (userData) => {
    try {
      // Store user data in localStorage
      localStorage.setItem('token', userData.accessToken);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('email', userData.email);
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('avatar', userData.avatar);
      
      setIsAuthenticated(true);
      // Note: Navigation is handled in Login component based on role
    } catch (error) {
      console.error('Error during login:', error);
      alert('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('avatar');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminAvatar');
      
      setIsAuthenticated(false);
      setIsAdminAuthenticated(false);
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Đang tải...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } />
          <Route path="/forgot-password" element={
            isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
          } />
          <Route path="/change-password" element={
            <ProtectedRoute element={<ChangePassword />} isAuthenticated={isAuthenticated} />
          } />
          <Route path="/reset-password" element={
            <ResetPassword />
          } />
          
          {/* Main Application Routes with Layout */}
          <Route path="/" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <Dashboard />
            </Layout>
          } />
          
          <Route path="/categories" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <CategoryPage />
            </Layout>
          } />

          <Route path="/stories" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <StoryList />
            </Layout>
          } />

          <Route path="/stories/:storyId" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <StoryDetail />
            </Layout>
          } />

          <Route path="/stories/:storyId/chapters/:chapterId" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <ChapterReader />
            </Layout>
          } />

          <Route path="/stories/:storyId/chapters/:chapterId/unlock" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <UnlockChapter />
            </Layout>
          } />

          <Route path="/profile" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </Layout>
          } />

          {/* Additional Routes for Future Features */}
          <Route path="/favorites" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <FavoritesPage />
            </Layout>
          } />

          <Route path="/history" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <HistoryPage />
            </Layout>
          } />

          <Route path="/ranking" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <RankingPage />
            </Layout>
          } />

          <Route path="/coin-shop" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <CoinShop />
            </Layout>
          } />

          <Route path="/payment-callback" element={
              <PaymentCallback />
          } />

          <Route path="/latest" element={
            <Layout onLogout={handleLogout} isAuthenticated={isAuthenticated}>
              <ErrorPage message="Tính năng mới cập nhật đang được phát triển" />
            </Layout>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <DashboardAdmin />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/stories" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <StoryManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/add-story" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <AddStory />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/edit-story/:id" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <EditStory />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/view-story/:id" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <ViewStory />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/stories/:storyId/chapters/add" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <AddChapter />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/stories/:storyId/chapters/:chapterId/edit" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <EditChapter />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/stories/:storyId/chapters/:chapterId/view" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <ViewChapter />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/users" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <UserManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/categories" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <CategoryManagement />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin/statistics" element={
            isAdminAuthenticated ? (
              <LayoutAdmin>
                <Statistics />
              </LayoutAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* 404 Error Route */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
