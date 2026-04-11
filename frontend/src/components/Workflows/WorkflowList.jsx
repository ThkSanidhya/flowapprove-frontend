import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workflowService } from '../../services/workflowService';
import toast from 'react-hot-toast';

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowService.getAll();
      setWorkflows(data);
    } catch (error) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await workflowService.delete(id);
        toast.success('Workflow deleted successfully');
        loadWorkflows();
      } catch (error) {
        toast.error('Failed to delete workflow');
      }
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px' }}>Workflows</h1>
        <Link to="/workflows/create" className="btn btn-primary">
          + Create Workflow
        </Link>
      </div>

      {workflows.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>No workflows created yet.</p>
          <Link to="/workflows/create" className="btn btn-primary">
            Create Your First Workflow
          </Link>
        </div>
      ) : (
        <div className="grid">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="card">
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{workflow.name}</h3>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  Steps: {workflow.steps?.length || 0}
                </p>
                {workflow.steps?.map((step) => (
                  <div key={step.id} style={{ fontSize: '12px', marginTop: '5px', padding: '5px', background: '#f5f5f5', borderRadius: '3px' }}>
                    Step {step.order}: {step.user_name || step.user?.name || `User ${step.user}`}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/workflows/edit/${workflow.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                  Edit
                </Link>
                <button onClick={() => handleDelete(workflow.id)} className="btn btn-danger" style={{ flex: 1 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}