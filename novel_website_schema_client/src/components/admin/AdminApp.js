import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LayoutAdmin from './layout/LayoutAdmin';
import DashboardAdmin from './pages/DashboardAdmin';
import Statistics from './pages/Statistics';
import StoryManagement from './pages/StoryManagement';
import CategoryManagement from './pages/CategoryManagement';
import UserManagement from './pages/UserManagement';
import AddStory from './pages/AddStory';
import EditStory from './pages/EditStory';
import ViewStory from './pages/ViewStory';
import AddChapter from './pages/AddChapter';
import EditChapter from './pages/EditChapter';
import ViewChapter from './pages/ViewChapter';

function AdminApp() {
  return (
    <LayoutAdmin>
      <Routes>
        <Route path="/" element={<DashboardAdmin />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/stories" element={<StoryManagement />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/stories/add" element={<AddStory />} />
        <Route path="/stories/:id/edit" element={<EditStory />} />
        <Route path="/stories/:id" element={<ViewStory />} />
        <Route path="/stories/:storyId/chapters/add" element={<AddChapter />} />
        <Route path="/stories/:storyId/chapters/:chapterId/edit" element={<EditChapter />} />
        <Route path="/stories/:storyId/chapters/:chapterId" element={<ViewChapter />} />
      </Routes>
    </LayoutAdmin>
  );
}

export default AdminApp; 