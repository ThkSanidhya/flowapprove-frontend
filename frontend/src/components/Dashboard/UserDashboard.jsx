import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DocumentTable from './DocumentTable';

export default function UserDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    inProgress: 0,
    pendingMyAction: 0,
    approvedByMe: 0,
    sentBack: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Total Documents',
      value: stats.totalDocuments,
      color: '#6c757d',
      bgColor: '#f8f9fa',
      icon: '📄',
      filter: null
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: '#ffc107',
      bgColor: '#fff3cd',
      icon: '🔄',
      filter: 'PENDING'
    },
    {
      label: 'Pending My Action',
      value: stats.pendingMyAction,
      color: '#dc3545',
      bgColor: '#f8d7da',
      icon: '⏰',
      filter: 'PENDING',
      highlight: true
    },
    {
      label: 'Approved by Me',
      value: stats.approvedByMe,
      color: '#28a745',
      bgColor: '#d4edda',
      icon: '✅',
      filter: 'APPROVED'
    },
    {
      label: 'Sent Back',
      value: stats.sentBack,
      color: '#fd7e14',
      bgColor: '#fff3e0',
      icon: '↩️',
      filter: 'REJECTED'
    },
    {
      label: 'Completed',
      value: stats.completed,
      color: '#20c997',
      bgColor: '#d1f2eb',
      icon: '🎉',
      filter: 'APPROVED'
    }
  ];

  const handleCardClick = (filter) => {
    setActiveFilter(filter);
    // This will trigger the DocumentTable to filter
    window.dispatchEvent(new CustomEvent('filterDocuments', { detail: filter }));
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#666' }}>
          Here's your document approval overview
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {statsCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.filter)}
            style={{
              backgroundColor: card.bgColor,
              borderRadius: '12px',
              padding: '20px',
              cursor: card.filter ? 'pointer' : 'default',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: activeFilter === card.filter ? `2px solid ${card.color}` : '1px solid #e0e0e0',
              boxShadow: activeFilter === card.filter ? `0 4px 12px ${card.color}40` : 'none'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '32px' }}>{card.icon}</span>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: card.color 
              }}>
                {card.value}
              </span>
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: card.color,
              marginBottom: '5px'
            }}>
              {card.label}
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

      {/* Document Table */}
      <DocumentTable initialFilter={activeFilter} />
    </div>
  );
}