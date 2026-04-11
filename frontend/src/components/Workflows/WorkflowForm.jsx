import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowService } from '../../services/workflowService';
import { userService } from '../../services/userService';  // Add this import
import toast from 'react-hot-toast';

export default function WorkflowForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sendbackType: 'PREVIOUS_ONLY',
    steps: [{ userId: '', order: 1 }]
  });

  useEffect(() => {
    loadUsers();
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const loadUsers = async () => {
    try {
      // Use the userService instead of direct fetch
      const data = await userService.getAll();
      setUsers(data);
      console.log('Users loaded:', data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadWorkflow = async () => {
    try {
      const data = await workflowService.getById(id);
      setFormData({
        name: data.name,
        sendbackType: data.sendback_type || data.sendbackType || 'PREVIOUS_ONLY',
        steps: data.steps.map(step => ({
          userId: step.user || step.userId,
          order: step.order
        }))
      });
    } catch (error) {
      toast.error('Failed to load workflow');
      navigate('/workflows');
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { userId: '', order: formData.steps.length + 1 }]
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter workflow name');
      return;
    }

    if (formData.steps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }

    for (let step of formData.steps) {
      if (!step.userId) {
        toast.error('Please select a user for each step');
        return;
      }
    }

    setLoading(true);
    try {
      if (id) {
        await workflowService.update(id, formData);
        toast.success('Workflow updated successfully');
      } else {
        await workflowService.create(formData);
        toast.success('Workflow created successfully');
      }
      navigate('/workflows');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        {id ? 'Edit Workflow' : 'Create Workflow'}
      </h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Workflow Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Invoice Approval, Document Review"
            required
          />
        </div>

        <div className="form-group">
          <label>Send-back Policy</label>
          <select
            value={formData.sendbackType}
            onChange={(e) => setFormData({ ...formData, sendbackType: e.target.value })}
          >
            <option value="PREVIOUS_ONLY">Previous step only (strict)</option>
            <option value="ANY_PREVIOUS">Any previous step (flexible)</option>
          </select>
          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
            Controls whether an approver can jump a document back to any earlier step
            or only the immediately preceding one.
          </small>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '18px' }}>Approval Steps</h3>
            <button type="button" onClick={addStep} className="btn btn-primary">
              + Add Step
            </button>
          </div>

          {formData.steps.map((step, index) => (
            <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', background: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong>Step {step.order}</strong>
                {formData.steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(index)} className="btn btn-danger" style={{ padding: '5px 10px' }}>
                    Remove
                  </button>
                )}
              </div>
              <div className="form-group">
                <label>Approver *</label>
                <select
                  value={step.userId}
                  onChange={(e) => updateStep(index, 'userId', e.target.value)}
                  required
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (id ? 'Update Workflow' : 'Create Workflow')}
          </button>
          <button type="button" onClick={() => navigate('/workflows')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}