import api from './api';

export const workflowService = {
  // Get all workflows
  getAll: async () => {
    const response = await api.get('/workflows');
    return response.data;
  },

  // Get workflow by ID
  getById: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  // Create workflow
  create: async (data) => {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  // Update workflow
  update: async (id, data) => {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },

  // Delete workflow
  delete: async (id) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  }
};