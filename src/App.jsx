import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages (Single Login & Register)
import LoginPage from './pages/auth/LoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';

// Dashboards (Single-Screen Portals)
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';

// Route Guards
const StudentRoute = ({ children }) => {
  const { user, isStudent, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs font-mono text-slate-500">Checking session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/teacher/dashboard" replace />;
  return children;
};

const TeacherRoute = ({ children }) => {
  const { user, isTeacher, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs font-mono text-slate-500">Checking session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isTeacher) return <Navigate to="/student/dashboard" replace />;
  return children;
};

// Root Redirector
const RootRedirect = () => {
  const { user, isStudent, isTeacher, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (isStudent) return <Navigate to="/student/dashboard" replace />;
  if (isTeacher) return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<StudentRegisterPage />} />
          <Route path="/register/student" element={<StudentRegisterPage />} />

          {/* Legacy login redirects */}
          <Route path="/login/student" element={<Navigate to="/login" replace />} />
          <Route path="/login/teacher" element={<Navigate to="/login" replace />} />
          <Route path="/login/select" element={<Navigate to="/login" replace />} />

          {/* Protected Routes inside Clean Layout */}
          <Route element={<DashboardLayout />}>
            {/* Student Workspace (Single-screen submit + browse) */}
            <Route
              path="/student"
              element={
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              }
            />
            <Route path="/student/projects" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/projects/:id" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/projects/:id/edit" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/submit" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/feedback" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/profile" element={<Navigate to="/student/dashboard" replace />} />

            {/* Teacher & Admin Workspace (Single-screen see projects + grade) */}
            <Route
              path="/teacher"
              element={
                <TeacherRoute>
                  <TeacherDashboard />
                </TeacherRoute>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <TeacherRoute>
                  <TeacherDashboard />
                </TeacherRoute>
              }
            />
            <Route path="/teacher/submissions" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/submissions/:id" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/pending" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/students" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/teacher/profile" element={<Navigate to="/teacher/dashboard" replace />} />

            {/* Directory / Showcase link */}
            <Route path="/showcase" element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
