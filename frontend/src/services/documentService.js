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
  },

  // Send back to a previous step. targetStep is optional — if omitted the
  // backend defaults to current_step - 1 (immediately previous step).
  sendBack: async (id, reason, targetStep = null) => {
    const payload = { reason };
    if (targetStep !== null && targetStep !== undefined) {
      payload.target_step = targetStep;
    }
    const response = await api.post(`/documents/${id}/sendback`, payload);
    return response.data;
  },

  // Upload a new version of a document (after sendback or rejection).
  // `formData` must be a FormData with `file` and optional `version_note`.
  uploadVersion: async (id, formData) => {
    const response = await api.post(`/documents/${id}/upload-version`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Recall / withdraw a PENDING document (creator only).
  recall: async (id, reason) => {
    const response = await api.post(`/documents/${id}/recall`, { reason });
    return response.data;
  },
};