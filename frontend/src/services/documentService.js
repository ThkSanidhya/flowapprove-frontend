import api from './api';

export const documentService = {
  // Get all documents
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Get document by ID
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Upload document
  upload: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Approve document
  approve: async (id, comment) => {
    const response = await api.post(`/documents/${id}/approve`, { comment });
    return response.data;
  },

  // Reject document
  reject: async (id, comment) => {
    const response = await api.post(`/documents/${id}/reject`, { comment });
    return response.data;
  },

  // Add comment
  addComment: async (id, comment) => {
    const response = await api.post(`/documents/${id}/comments`, { comment });
    return response.data;
  }
};