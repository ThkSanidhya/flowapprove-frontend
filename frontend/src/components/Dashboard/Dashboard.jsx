import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const stats = [
    { label: 'Total Documents', value: '0', color: '#0066cc' },
    { label: 'Pending Approvals', value: '0', color: '#ffc107' },
    { label: 'Completed', value: '0', color: '#28a745' },
    { label: 'Workflows', value: '0', color: '#6f42c1' },
  ];

  const quickActions = [
    { name: 'Create Workflow', icon: '➕', path: '/workflows/create', role: 'ADMIN' },
    { name: 'Upload Document', icon: '📄', path: '/documents/upload', role: 'ALL' },
    { name: 'My Tasks', icon: '✅', path: '/tasks', role: 'ALL' },
    { name: 'Manage Users', icon: '👥', path: '/users', role: 'ADMIN' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#666' }}>
          Here's what's happening with your documents today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Quick Actions</h2>
        <div className="grid">
          {quickActions
            .filter(action => action.role === 'ALL' || (action.role === 'ADMIN' && isAdmin()))
            .map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="card"
                style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{action.icon}</div>
                <div style={{ fontWeight: '500', color: '#333' }}>{action.name}</div>
              </Link>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Recent Activity</h2>
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No recent activities yet. Start by creating a workflow or uploading a document!
          </p>
        </div>
      </div>
    </div>
  );
}