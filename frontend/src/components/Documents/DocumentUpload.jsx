import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import { workflowService } from '../../services/workflowService';
import toast from 'react-hot-toast';

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workflowId: '',
    file: null
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowService.getAll();
      setWorkflows(data);
    } catch {
      toast.error('Failed to load workflows');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      if (formData.workflowId) {
        uploadData.append('workflowId', String(formData.workflowId));
      }

      await documentService.upload(uploadData);
      toast.success('Document uploaded successfully!');
      navigate('/documents');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Upload Document</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Document Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter document title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter document description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Workflow (Optional)</label>
          <select
            value={formData.workflowId}
            onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
          >
            <option value="">No workflow (direct approval)</option>
            {workflows.map(workflow => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name} ({workflow.steps?.length || 0} steps)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>File *</label>
          <div style={{
            border: '2px dashed #ddd',
            borderRadius: '5px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#fafafa'
          }}>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ marginBottom: '10px' }}
            />
            {formData.file && (
              <div style={{ marginTop: '10px' }}>
                <p>✅ Selected: {formData.file.name}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {(formData.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Supported: PDF, DOC, DOCX, JPG, PNG (Max 50 MB)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
          <button type="button" onClick={() => navigate('/documents')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}