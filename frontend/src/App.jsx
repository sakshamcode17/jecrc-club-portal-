import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import ClubDetail from './pages/ClubDetail';
import ClubApplication from './pages/ClubApplication';
import Profile from './pages/Profile';
import Directory from './pages/Directory';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import useAuthStore from './store/authStore';
import useAdminStore from './store/adminStore';

const App = () => {
  const { isAuthenticated } = useAuthStore();
  const { isAdminAuthenticated } = useAdminStore();

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/directory" element={isAuthenticated ? <Directory /> : <Navigate to="/login" />} />

        {/* Student Protected */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/clubs/:slug" element={isAuthenticated ? <ClubDetail /> : <Navigate to="/login" />} />
        <Route path="/apply/:slug" element={isAuthenticated ? <ClubApplication /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

