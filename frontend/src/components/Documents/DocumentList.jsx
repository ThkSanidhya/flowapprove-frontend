import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import toast from 'react-hot-toast';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await documentService.getAll();
      setDocuments(data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'APPROVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      case 'CANCELLED': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px' }}>Documents</h1>
        <Link to="/documents/upload" className="btn btn-primary">
          + Upload Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>No documents uploaded yet.</p>
          <Link to="/documents/upload" className="btn btn-primary">
            Upload Your First Document
          </Link>
        </div>
      ) : (
        <div className="grid">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              to={`/documents/${doc.id}`}
              className="card"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>
                  {doc.title}
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    backgroundColor: getStatusColor(doc.status),
                    color: 'white'
                  }}
                >
                  {doc.status}
                </span>
              </div>
              
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                {doc.description || 'No description'}
              </p>
              
              <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                <div>Uploaded by: {doc.creator?.name || doc.created_by_name}</div>
                <div>Date: {new Date(doc.created_at).toLocaleDateString()}</div>
                {doc.workflow_name && <div>Workflow: {doc.workflow_name}</div>}
                <div>Step: {doc.current_step}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}