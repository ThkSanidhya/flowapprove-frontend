import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function EnhancedDocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [sendBackReason, setSendBackReason] = useState('');
  const [sendBackTarget, setSendBackTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('document');
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallReason, setRecallReason] = useState('');
  const [versionFile, setVersionFile] = useState(null);
  const [versionNote, setVersionNote] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'sendback') setShowSendBackModal(true);
  }, [location]);

  useEffect(() => {
    loadDocument();
  }, [id]);

  // When the send-back modal opens, default the target to the immediately previous step
  useEffect(() => {
    if (showSendBackModal && document?.currentStep) {
      setSendBackTarget(Math.max(1, document.currentStep - 1));
    }
  }, [showSendBackModal, document?.currentStep]);

  const loadDocument = async () => {
    try {
      const response = await api.get(`/documents/${id}`);
      setDocument(response.data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/documents/${id}/approve`, { comment: approvalComment });
      toast.success('Document approved!');
      loadDocument();
      setApprovalComment('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Approval failed');
    }
  };

  const handleSendBack = async () => {
    if (!sendBackReason) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await documentService.sendBack(id, sendBackReason, sendBackTarget);
      toast.success('Document sent back for revision');
      setShowSendBackModal(false);
      setSendBackReason('');
      setApprovalComment('');
      loadDocument();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send back');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this document? The creator will need to upload a revised version.')) return;
    try {
      await documentService.reject(id, approvalComment);
      toast.success('Document rejected');
      loadDocument();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Reject failed');
    }
  };

  const handleRecall = async () => {
    if (!recallReason) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await documentService.recall(id, recallReason);
      toast.success('Document recalled');
      setShowRecallModal(false);
      setRecallReason('');
      loadDocument();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Recall failed');
    }
  };

  const handleUploadVersion = async () => {
    if (!versionFile) {
      toast.error('Choose a file first');
      return;
    }
    const formData = new FormData();
    formData.append('file', versionFile);
    if (versionNote) formData.append('version_note', versionNote);
    setUploading(true);
    try {
      await documentService.uploadVersion(id, formData);
      toast.success('New version uploaded');
      setVersionFile(null);
      setVersionNote('');
      loadDocument();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await api.post(`/documents/${id}/comments/reference`, {
        comment,
        pageNumber: pageNumber ? parseInt(pageNumber) : null
      });
      toast.success('Comment added');
      setComment('');
      setPageNumber('');
      loadDocument();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      case 'CANCELLED': return '#6c757d';
      case 'PENDING': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      case 'PENDING': return 'Pending';
      default: return status;
    }
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  if (loading) return <div className="spinner"></div>;
  if (!document) return <div className="card">Document not found</div>;

  const fileUrl = getFileUrl(document.file_url);

  const formatDateTime = (date) => new Date(date).toLocaleString();
  const historyEntries = document.history || [];
  const sendbackType = document.sendbackType || 'PREVIOUS_ONLY';

  // Steps the approver may send back to (1..current_step-1)
  const previousSteps = (document.timeline || []).filter(
    (s) => s.stepOrder < document.currentStep
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px' }}>{document.title}</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Document ID: WF{String(document.id).padStart(6, '0')}</p>
        </div>
        <button onClick={() => navigate('/documents')} className="btn btn-secondary">Back to Documents</button>
      </div>

      {/* Status Badge */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', backgroundColor: getStatusColor(document.status), color: 'white' }}>
          {getStatusText(document.status)}
        </span>
        {document.canApprove && document.status === 'PENDING' && (
          <span style={{ marginLeft: '10px', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', backgroundColor: '#dc3545', color: 'white' }}>
            ⚡ AWAITING YOUR APPROVAL
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Workflow Progress</span>
          <span>{document.progress || 0}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${document.progress || 0}%`, height: '100%', backgroundColor: '#28a745', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
        {['document', 'timeline', 'activity', 'comments', 'versions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #0066cc' : 'none',
              color: activeTab === tab ? '#0066cc' : '#666',
              fontWeight: activeTab === tab ? '500' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'activity' ? 'Activity Timeline' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Document Preview Tab */}
      {activeTab === 'document' && (
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="card">
            <h3>Document Preview</h3>
            {fileUrl && (
              <div style={{ marginTop: '15px' }}>
                {document.file_type?.includes('image') ? (
                  <img src={fileUrl} alt={document.title} style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
                    <p><strong>{document.file_name}</strong></p>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Size: {(document.file_size / 1024).toFixed(2)} KB<br />Type: {document.file_type}</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">📖 Open Document in New Tab</a>
                      <a href={fileUrl} download className="btn btn-secondary">💾 Download</a>
                    </div>
                    <p style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>Preview not available. Click "Open Document" to view.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div>
            {document.canApprove && document.status === 'PENDING' && (
              <div className="card" style={{ border: '2px solid #ffc107', backgroundColor: '#fff9e6' }}>
                <h3 style={{ color: '#ffc107', marginBottom: '15px' }}>⚡ Your Approval Required</h3>
                <div className="form-group">
                  <label>Comment (Optional)</label>
                  <textarea value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} rows="3" placeholder="Add approval comment..." />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={handleApprove} className="btn btn-success" style={{ padding: '12px' }}>✅ Approve</button>
                  {document.currentStep > 1 && (
                    <button onClick={() => setShowSendBackModal(true)} className="btn btn-secondary" style={{ padding: '12px' }}>↩️ Send Back</button>
                  )}
                  <button onClick={handleReject} className="btn btn-danger" style={{ padding: '12px' }}>❌ Reject</button>
                </div>
              </div>
            )}

            {/* Recall card — only creator, only PENDING */}
            {document.canRecall && (
              <div className="card" style={{ border: '2px solid #6c757d' }}>
                <h3>Recall Document</h3>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
                  Withdraw this document from the approval flow. Its status will become <strong>Cancelled</strong>.
                </p>
                <button onClick={() => setShowRecallModal(true)} className="btn btn-secondary" style={{ width: '100%' }}>
                  Recall Document
                </button>
              </div>
            )}

            <div className="card">
              <h3>Add Comment</h3>
              <div className="form-group">
                <label>Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3" placeholder="Add your comment..." />
              </div>
              <div className="form-group">
                <label>Page Number (Optional)</label>
                <input type="number" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} placeholder="Page number" style={{ width: '100%' }} />
              </div>
              <button onClick={handleAddComment} className="btn btn-primary">Post Comment</button>
            </div>
            <div className="card">
              <h3>Document Info</h3>
              <div style={{ fontSize: '14px' }}>
                <div><strong>Uploaded by:</strong> {document.creator?.name || document.created_by_name}</div>
                <div><strong>Uploaded on:</strong> {formatDateTime(document.created_at)}</div>
                <div><strong>File Size:</strong> {(document.file_size / 1024).toFixed(2)} KB</div>
                {document.workflow_name && <div><strong>Workflow:</strong> {document.workflow_name}</div>}
                <div><strong>Current Step:</strong> {document.current_step}/{document.timeline?.length || 1}</div>
                <div><strong>Send-back policy:</strong> {sendbackType === 'ANY_PREVIOUS' ? 'Any previous step' : 'Previous step only'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="card">
          <h3>Workflow Steps</h3>
          <div style={{ marginTop: '20px' }}>
            {document.timeline?.map((step, idx) => (
              <div key={step.stepOrder} style={{ display: 'flex', marginBottom: '30px', position: 'relative', paddingLeft: '30px' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: step.status === 'APPROVED' ? '#28a745' : step.status === 'REJECTED' ? '#dc3545' : step.isCurrent ? '#ffc107' : '#e0e0e0',
                  border: '2px solid white', boxShadow: '0 0 0 2px #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white'
                }}>
                  {step.status === 'APPROVED' ? '✓' : step.status === 'REJECTED' ? '✗' : step.stepOrder}
                </div>
                {idx < (document.timeline?.length || 0) - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', width: '2px', height: 'calc(100% + 30px)', backgroundColor: '#ddd' }} />}
                <div style={{ flex: 1, marginLeft: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Step {step.stepOrder}: {step.user?.name}</strong>
                    <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '12px', backgroundColor: getStatusColor(step.status), color: 'white' }}>{getStatusText(step.status)}</span>
                  </div>
                  {step.comment && <p style={{ marginTop: '5px', color: '#666' }}>Comment: {step.comment}</p>}
                  {step.approvedAt && <p style={{ fontSize: '12px', color: '#999' }}>{formatDateTime(step.approvedAt)}</p>}
                  {step.isCurrent && step.status === 'PENDING' && (
                    <p style={{ marginTop: '5px', color: '#ffc107' }}>⏳ Awaiting action from {step.user?.name}{step.user?.id === user?.id && <span style={{ color: '#dc3545' }}> (THIS IS YOU!)</span>}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline Tab */}
      {activeTab === 'activity' && (
        <div className="card">
          <h3>Activity Timeline</h3>
          {historyEntries.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No activity yet</p>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              {historyEntries.map((entry, idx) => {
                const isPositive = entry.action === 'APPROVED';
                const isNegative = entry.action === 'REJECTED' || entry.action === 'SENT_BACK' || entry.action === 'RECALLED';
                const color = isPositive ? '#28a745' : isNegative ? '#dc3545' : '#007bff';
                return (
                  <div key={entry.id} style={{ position: 'relative', marginBottom: '30px' }}>
                    {idx < historyEntries.length - 1 && (
                      <div style={{ position: 'absolute', left: '8px', top: '28px', width: '2px', height: 'calc(100% - 10px)', backgroundColor: '#ddd', zIndex: 0 }} />
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color, border: '2px solid white', boxShadow: '0 0 0 2px #ddd', marginTop: '4px', flexShrink: 0, zIndex: 1 }} />
                      <div style={{ flex: 1, backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '12px', borderLeft: `4px solid ${color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '15px' }}>{entry.user?.name}</strong>
                          <span style={{ fontSize: '12px', color: '#999' }}>{formatDateTime(entry.createdAt)}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', backgroundColor: isPositive ? '#d4edda' : isNegative ? '#f8d7da' : '#cce5ff', color: isPositive ? '#155724' : isNegative ? '#721c24' : '#004085' }}>
                            {entry.action.replace('_', ' ')}
                          </span>
                        </div>
                        {entry.comment && <p style={{ color: '#555', marginTop: '6px', fontSize: '13px', fontStyle: 'italic' }}>“{entry.comment}”</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="card">
          <h3>All Comments</h3>
          {document.comments?.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No comments yet</p>
          ) : (
            document.comments?.map((c) => (
              <div key={c.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{c.user?.name}</strong>
                  <span style={{ fontSize: '12px', color: '#999' }}>{formatDateTime(c.createdAt)}</span>
                </div>
                <p style={{ marginTop: '8px' }}>{c.comment}</p>
                {c.pageNumber && <span style={{ fontSize: '12px', color: '#0066cc', backgroundColor: '#e3f2fd', padding: '2px 8px', borderRadius: '3px', display: 'inline-block' }}>📄 Page {c.pageNumber}</span>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div className="card">
          <h3>Document Versions</h3>

          {/* Upload-new-version panel — visible to whoever the backend authorized */}
          {document.canUploadVersion && (
            <div style={{
              marginTop: '15px',
              marginBottom: '20px',
              padding: '20px',
              border: '2px dashed #0066cc',
              borderRadius: '8px',
              backgroundColor: '#f0f8ff'
            }}>
              <h4 style={{ marginTop: 0 }}>📤 Upload a New Version</h4>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
                {document.status === 'REJECTED'
                  ? 'This document was rejected. Upload a revised file to restart the workflow from step 1.'
                  : 'This document was sent back to you. Upload a revised file (the workflow will resume from your step).'}
              </p>
              <div className="form-group">
                <input type="file" onChange={(e) => setVersionFile(e.target.files?.[0] || null)} />
              </div>
              <div className="form-group">
                <textarea
                  rows="2"
                  placeholder="What changed? (optional)"
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                />
              </div>
              <button onClick={handleUploadVersion} className="btn btn-primary" disabled={!versionFile || uploading}>
                {uploading ? 'Uploading…' : 'Upload New Version'}
              </button>
            </div>
          )}

          {(!document.versions || document.versions.length === 0) ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No previous versions</p>
          ) : (
            document.versions.map((v) => (
              <div key={v.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Version {v.versionNumber}</strong>
                  <span style={{ fontSize: '12px', color: '#999' }}>{formatDateTime(v.createdAt)}</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  <div>File: {v.fileName}</div>
                  <div>Size: {(v.fileSize / 1024).toFixed(2)} KB</div>
                  {v.versionNote && <div>Note: {v.versionNote}</div>}
                  <div>Uploaded by: {v.uploadedBy?.name}</div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <a href={getFileUrl(v.fileUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>Download Version {v.versionNumber}</a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Send Back Modal */}
      {showSendBackModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2>Send Back Document</h2>

            {/* Step selector */}
            {sendbackType === 'ANY_PREVIOUS' && previousSteps.length > 1 ? (
              <div className="form-group">
                <label>Send back to step *</label>
                <select
                  value={sendBackTarget ?? ''}
                  onChange={(e) => setSendBackTarget(parseInt(e.target.value, 10))}
                >
                  {previousSteps.map((s) => (
                    <option key={s.stepOrder} value={s.stepOrder}>
                      Step {s.stepOrder} — {s.user?.name}
                    </option>
                  ))}
                </select>
                <small style={{ color: '#666' }}>Everything from the chosen step onward will be reset to pending.</small>
              </div>
            ) : (
              <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                <strong>ℹ️ Will be sent back to step {Math.max(1, (document.currentStep || 1) - 1)}</strong>
                {previousSteps.length > 0 && (
                  <div style={{ marginTop: '5px' }}>
                    {previousSteps[previousSteps.length - 1]?.user?.name}
                  </div>
                )}
                {sendbackType === 'PREVIOUS_ONLY' && document.currentStep > 2 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#856404' }}>
                    This workflow only allows sending back to the immediately previous step.
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Reason *</label>
              <textarea value={sendBackReason} onChange={(e) => setSendBackReason(e.target.value)} rows="4" placeholder="Explain why this document needs revision..." required />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSendBack} className="btn btn-danger">Send Back</button>
              <button onClick={() => { setShowSendBackModal(false); setSendBackReason(''); }} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Recall Modal */}
      {showRecallModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2>Recall Document</h2>
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e2e3e5', borderRadius: '8px', borderLeft: '4px solid #6c757d' }}>
              <strong>This will cancel the document</strong>
              <div style={{ marginTop: '5px', fontSize: '13px', color: '#555' }}>
                All pending approvals will be cleared and the document status will become Cancelled. This cannot be undone.
              </div>
            </div>
            <div className="form-group">
              <label>Reason *</label>
              <textarea value={recallReason} onChange={(e) => setRecallReason(e.target.value)} rows="3" placeholder="Why are you recalling this document?" required />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleRecall} className="btn btn-danger">Confirm Recall</button>
              <button onClick={() => { setShowRecallModal(false); setRecallReason(''); }} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
