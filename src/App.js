import AcademicSupervisorDashboard from './pages/AcademicSupervisorDashboard';
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import IndustrySupervisorDashboard from './pages/IndustrySupervisorDashboard';
import DeptCoordinatorDashboard from './pages/DeptCoordinatorDashboard';
import './App.css';

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // 1. If no user is logged in, immediately redirect to Login
  if (!user) return <Navigate to="/login" />;

  // 2. If user is logged in but has the wrong role, send them to Login
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  // 3. If both checks pass, render the protected page (children)
  return children;
};

// --- APPLICATION ROUTES ---
function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Login Page: If user is already logged in, send them to their specific dashboard */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Student Routes */}
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Company HR Routes */}
      <Route 
        path="/company_hr/*" 
        element={
          <ProtectedRoute allowedRoles={['company_hr']}>
            <CompanyDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Industry Supervisor Routes */}
      <Route 
        path="/industry_supervisor/*" 
        element={
          <ProtectedRoute allowedRoles={['industry_supervisor']}>
            <IndustrySupervisorDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Department Coordinator Routes */}
      <Route 
        path="/department_coordinator/*" 
        element={
          <ProtectedRoute allowedRoles={['department_coordinator']}>
            <DeptCoordinatorDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route: Redirects logged-in users to their dashboard, or non-logged-in to login */}
      <Route 
        path="*" 
        element={<Navigate to={user ? `/${user.role}` : '/login'} />} 
      />
    </Routes>
  );
}

// --- MAIN APP ENTRY POINT ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}