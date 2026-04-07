import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DocumentTable({ initialFilter }) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: initialFilter || '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadDocuments();
  }, [pagination.page, filters]);

  useEffect(() => {
    // Listen for filter events from dashboard cards
    const handleFilter = (e) => {
      setFilters(prev => ({ ...prev, status: e.detail || '' }));
      setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    window.addEventListener('filterDocuments', handleFilter);
    return () => window.removeEventListener('filterDocuments', handleFilter);
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await api.get(`/dashboard/documents?${params}`);
      setDocuments(response.data.documents);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (e) => {
    setFilters({ ...filters, status: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleDateFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '', dateFrom: '', dateTo: '' });
    setPagination({ ...pagination, page: 1 });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading && pagination.page === 1) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={handleSearch}
              placeholder="Search by ID or title..."
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={filters.status} onChange={handleStatusFilter}>
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleDateFilter}
                placeholder="From"
              />
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleDateFilter}
                placeholder="To"
              />
            </div>
          </div>
          <button onClick={clearFilters} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Document Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Document ID</th>
              <th>Document Name</th>
              <th>Uploaded By</th>
              <th>Created Date</th>
              <th>Current Owner</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  No documents found
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <React.Fragment key={doc.id}>
                  <tr>
                    <td>
                      <button
                        onClick={() => toggleExpand(doc.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        {expandedRow === doc.id ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace' }}>{doc.documentId}</span>
                    </td>
                    <td>
                      <strong>{doc.title}</strong>
                      {doc.description && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{doc.description}</div>
                      )}
                    </td>
                    <td>{doc.uploadedBy}</td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      {doc.currentOwner}
                      {doc.isMyTurn && (
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '3px',
                          fontSize: '10px'
                        }}>
                          YOUR TURN
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: doc.statusColor + '20',
                        color: doc.statusColor
                      }}>
                        {doc.status}
                      </span>
                    </td>
                    <td>{formatDate(doc.updatedAt)}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="btn btn-primary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                  {expandedRow === doc.id && (
                    <tr>
                      <td colSpan="9" style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          {/* Workflow Progress */}
                          <div>
                            <h4 style={{ marginBottom: '10px' }}>Workflow Progress</h4>
                            <div style={{ marginBottom: '15px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>Progress</span>
                                <span>{doc.progress}%</span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '6px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${doc.progress}%`,
                                  height: '100%',
                                  backgroundColor: '#28a745'
                                }} />
                              </div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <div>Total Steps: {doc.totalSteps}</div>
                              <div>Current Step: {doc.currentStep}/{doc.totalSteps}</div>
                              <div>Current Owner: {doc.currentOwner}</div>
                            </div>
                          </div>

                          {/* Last Activity */}
                          <div>
                            <h4 style={{ marginBottom: '10px' }}>Last Activity</h4>
                            {doc.lastActivity ? (
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                <div><strong>{doc.lastActivity.user?.name}</strong></div>
                                <div style={{ marginTop: '5px' }}>{doc.lastActivity.comment}</div>
                                <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>
                                  {formatDateTime(doc.lastActivity.createdAt)}
                                </div>
                              </div>
                            ) : (
                              <p style={{ color: '#999' }}>No activity yet</p>
                            )}
                          </div>

                          {/* Quick Actions */}
                          {doc.isMyTurn && (
                            <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => navigate(`/documents/${doc.id}`)}
                                  className="btn btn-success"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => navigate(`/documents/${doc.id}?action=sendback`)}
                                  className="btn btn-danger"
                                >
                                  Send Back
                                </button>
                                <button
                                  onClick={() => navigate(`/documents/${doc.id}`)}
                                  className="btn btn-primary"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderTop: '1px solid #eee'
          }}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}