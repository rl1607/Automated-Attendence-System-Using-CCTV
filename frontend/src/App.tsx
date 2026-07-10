import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout';

// Pages lazy-like definitions
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CCTV from './pages/CCTV';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import TimetableSlots from './pages/Timetable';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';

// Helper Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/cctv" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'faculty']}>
                <CCTV />
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'faculty']}>
                <Students />
              </ProtectedRoute>
            } />
            
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Faculty />
              </ProtectedRoute>
            } />
            
            <Route path="/timetable" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'faculty']}>
                <TimetableSlots />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Analytics />
              </ProtectedRoute>
            } />
            
            <Route path="/messages" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'faculty']}>
                <Messages />
              </ProtectedRoute>
            } />
            
            <Route path="/audit-logs" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
