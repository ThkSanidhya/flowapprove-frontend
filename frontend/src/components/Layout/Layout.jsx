import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Role-based navigation items
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠', roles: ['ADMIN', 'USER'] },
    { name: 'Documents', path: '/documents', icon: '📄', roles: ['ADMIN', 'USER'] },
    { name: 'Workflows', path: '/workflows', icon: '🔄', roles: ['ADMIN'] },  // Only Admin can manage workflows
    { name: 'Users', path: '/users', icon: '👥', roles: ['ADMIN'] },          // Only Admin can manage users
    { name: 'Reports', path: '/reports', icon: '📊', roles: ['ADMIN'] },       // Only Admin can view reports
  ];

  // Filter navigation based on user role
  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  // Get current page title
  const currentPage = visibleNavigation.find(item => item.path === location.pathname)?.name || 'Dashboard';

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '20px', color: '#0066cc' }}>FlowApprove</h2>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {user?.role === 'ADMIN' ? 'Admin Portal' : 'Employee Portal'}
          </p>
        </div>
        <nav className="nav">
          {visibleNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '20px', borderTop: '1px solid #eee' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: '500' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{user?.role}</div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              {user?.organizationName || 'Organization'}
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1 style={{ fontSize: '24px' }}>{currentPage}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}