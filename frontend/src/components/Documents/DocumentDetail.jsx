import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const data = await documentService.getById(id);
      setDocument(data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await documentService.approve(id, approvalComment);
      toast.success('Document approved!');
      loadDocument();
      setApprovalComment('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = async () => {
    if (!approvalComment) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await documentService.reject(id, approvalComment);
      toast.success('Document rejected');
      loadDocument();
      setApprovalComment('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Rejection failed');
    }
  };

  const handleAddComment = async () => {
    if (!comment) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await documentService.addComment(id, comment);
      toast.success('Comment added');
      setComment('');
      loadDocument();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const canApprove = () => {
    if (!document || document.status !== 'PENDING') return false;
    const currentApproval = document.approvals?.find(
      a => a.stepOrder === document.currentStep
    );
    return currentApproval?.userId === user?.id;
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#ffc107';
      case 'APPROVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px' }}>{document.title}</h1>
        <button onClick={() => navigate('/documents')} className="btn btn-secondary">
          Back to Documents
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Main Content */}
        <div>
          <div className="card">
            <h3>Document Details</h3>
            <div className="form-group">
              <strong>File:</strong> {document.fileName}
            </div>
            <div className="form-group">
              <strong>Description:</strong> {document.description || 'No description'}
            </div>
            <div className="form-group">
              <strong>Uploaded by:</strong> {document.creator?.name} ({document.creator?.email})
            </div>
            <div className="form-group">
              <strong>Uploaded on:</strong> {new Date(document.createdAt).toLocaleString()}
            </div>
            {document.fileUrl && (
              <div className="form-group">
                <a href={`http://localhost:5000${document.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Download File
                </a>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="card">
            <h3>Comments</h3>
            <div className="form-group">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              <button onClick={handleAddComment} className="btn btn-primary" style={{ marginTop: '10px' }}>
                Post Comment
              </button>
            </div>
            
            {document.comments?.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                {document.comments.map((comment) => (
                  <div key={comment.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <strong>{comment.user?.name}</strong>
                    <p style={{ marginTop: '5px' }}>{comment.comment}</p>
                    <small style={{ color: '#999' }}>{new Date(comment.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="card">
            <h3>History</h3>
            {document.history?.length > 0 ? (
              document.history.map((entry) => (
                <div key={entry.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  <strong>{entry.user?.name}</strong> - {entry.action}
                  <p style={{ marginTop: '5px', fontSize: '14px' }}>{entry.comment}</p>
                  <small style={{ color: '#999' }}>{new Date(entry.createdAt).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <p>No history yet</p>
            )}
          </div>
        </div>

        {/* Approval Sidebar */}
        <div>
          <div className="card">
            <h3>Approval Status</h3>
            <div style={{ marginBottom: '15px' }}>
              <strong>Status:</strong>{' '}
              <span style={{
                padding: '2px 8px',
                borderRadius: '3px',
                backgroundColor: getStatusColor(document.status),
                color: 'white',
                display: 'inline-block'
              }}>
                {document.status}
              </span>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Current Step:</strong> {document.currentStep}/{document.workflow?.steps?.length || 1}
            </div>
            
            <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>Approval Steps</h4>
            {document.approvals?.map((approval) => (
              <div key={approval.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <strong>Step {approval.stepOrder}</strong> - {approval.user?.name}
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  Status: {approval.status}
                  {approval.comment && <div>Comment: {approval.comment}</div>}
                  {approval.approvedAt && <div>Date: {new Date(approval.approvedAt).toLocaleString()}</div>}
                </div>
              </div>
            ))}

            {canApprove() && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h4>Your Approval Required</h4>
                <div className="form-group">
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="Add comment (required for rejection)..."
                    rows="3"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleApprove} className="btn btn-success">
                    Approve
                  </button>
                  <button onClick={handleReject} className="btn btn-danger">
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}