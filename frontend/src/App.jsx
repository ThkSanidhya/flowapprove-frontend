import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
// Import UserDashboard instead of old Dashboard
import UserDashboard from './components/Dashboard/UserDashboard';
import Layout from './components/Layout/Layout';
import WorkflowList from './components/Workflows/WorkflowList';
import WorkflowForm from './components/Workflows/WorkflowForm';
import UserList from './components/Users/UserList';
// Document imports
import DocumentUpload from './components/Documents/DocumentUpload';
import DocumentList from './components/Documents/DocumentList';
import EnhancedDocumentDetail from './components/Documents/EnhancedDocumentDetail';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="spinner"></div>;
  }
  
  if (!user || !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Admin-only routes */}
      <Route
        path="/workflows"
        element={
          <AdminRoute>
            <Layout>
              <WorkflowList />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/workflows/create"
        element={
          <AdminRoute>
            <Layout>
              <WorkflowForm />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/workflows/edit/:id"
        element={
          <AdminRoute>
            <Layout>
              <WorkflowForm />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminRoute>
            <Layout>
              <UserList />
            </Layout>
          </AdminRoute>
        }
      />
      {/* Document Routes - accessible by all authenticated users */}
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentUpload />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EnhancedDocumentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;