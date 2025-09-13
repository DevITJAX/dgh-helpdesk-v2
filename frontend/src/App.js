import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './features/dashboard/Dashboard';
import Tickets from './features/tickets/Tickets';
import Users from './features/users/Users';
import Equipment from './features/equipment/Equipment';
import Profile from './features/auth/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/common/Layout';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tickets" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tickets />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute requiredRole="ADMIN">
                    <Layout>
                      <Users />
                    </Layout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipment" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute requiredRole={['ADMIN', 'TECHNICIAN']}>
                    <Layout>
                      <Equipment />
                    </Layout>
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
