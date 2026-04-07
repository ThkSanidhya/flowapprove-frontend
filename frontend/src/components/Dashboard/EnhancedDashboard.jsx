import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    inProgress: 0,
    pendingMyAction: 0,
    approvedByMe: 0,
    sentBack: 0,
    completed: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Use the correct endpoint: /dashboard/stats
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      
      // You can also fetch recent activities separately if needed
      // For now, we'll use empty array
      setRecentActivities([]);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const insightCards = [
    { 
      label: 'Total Documents', 
      value: stats.totalDocuments || 0, 
      color: '#0066cc', 
      bgColor: '#e3f2fd',
      icon: '📄',
      filter: null
    },
    { 
      label: 'My Turn', 
      value: stats.pendingMyAction || 0, 
      color: '#ff4444', 
      bgColor: '#ffe5e5',
      icon: '⏰', 
      highlight: true,
      filter: 'PENDING'
    },
    { 
      label: 'In Progress', 
      value: stats.inProgress || 0, 
      color: '#ffc107', 
      bgColor: '#fff3cd',
      icon: '🔄',
      filter: 'PENDING'
    },
    { 
      label: 'Approved by Me', 
      value: stats.approvedByMe || 0, 
      color: '#28a745', 
      bgColor: '#d4edda',
      icon: '✅',
      filter: 'APPROVED'
    },
    { 
      label: 'Sent Back', 
      value: stats.sentBack || 0, 
      color: '#dc3545', 
      bgColor: '#f8d7da',
      icon: '↩️',
      filter: 'REJECTED'
    },
    { 
      label: 'Completed', 
      value: stats.completed || 0, 
      color: '#20c997', 
      bgColor: '#d1f2eb',
      icon: '🎉',
      filter: 'APPROVED'
    }
  ];

  const handleCardClick = (filter) => {
    if (filter) {
      // Trigger filter on the document table
      window.dispatchEvent(new CustomEvent('filterDocuments', { detail: filter }));
      // Navigate to documents page with filter
      // window.location.href = `/documents?status=${filter}`;
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#666' }}>
          Here's your document approval overview
        </p>
      </div>

      {/* Insights Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {insightCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card"
            onClick={() => handleCardClick(card.filter)}
            style={{ 
              borderLeft: card.highlight ? `4px solid ${card.color}` : 'none',
              backgroundColor: card.bgColor,
              cursor: card.filter ? 'pointer' : 'default',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              if (card.filter) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (card.filter) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{card.icon}</div>
            <div className="stat-label" style={{ color: card.color, fontWeight: '500' }}>
              {card.label}
            </div>
            <div className="stat-value" style={{ color: card.color, fontSize: '32px', fontWeight: 'bold' }}>
              {card.value}
            </div>
            {card.highlight && stats.pendingMyAction > 0 && (
              <div style={{ 
                fontSize: '12px', 
                color: '#dc3545',
                marginTop: '8px',
                fontWeight: '500'
              }}>
                ⚡ Requires your attention!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activities - Optional */}
      {recentActivities.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Recent Activities</h2>
          <div className="card">
            {recentActivities.map((activity) => (
              <Link
                key={activity.id}
                to={`/documents/${activity.documentId}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{activity.user?.name}</strong> {activity.action.toLowerCase()}
                      <span> "{activity.document?.title}"</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {activity.comment && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontStyle: 'italic' }}>
                      "{activity.comment}"
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}