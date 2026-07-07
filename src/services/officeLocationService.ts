import api from './api';
import type { OfficeLocation, OfficeLocationFormData } from '../types';

export const officeLocationService = {
  getOfficeLocations: async (params?: { isActive?: boolean }) => {
    const response = await api.get('/office-locations', { params });
    const result = response.data;
    const data = Array.isArray(result.data) ? result.data : [];
    return { data, total: result.total || data.length };
  },

  getOfficeLocationById: async (id: number): Promise<OfficeLocation> => {
    const response = await api.get(`/office-locations/${id}`);
    return response.data.data;
  },

  createOfficeLocation: async (data: OfficeLocationFormData): Promise<OfficeLocation> => {
    const response = await api.post('/office-locations', data);
    return response.data.data;
  },

  updateOfficeLocation: async (id: number, data: Partial<OfficeLocation>): Promise<OfficeLocation> => {
    const response = await api.put(`/office-locations/${id}`, data);
    return response.data.data;
  },

  deleteOfficeLocation: async (id: number): Promise<void> => {
    await api.delete(`/office-locations/${id}`);
  },

  validateLocation: async (
    officeLocationId: number,
    location: { latitude: number; longitude: number }
  ) => {
    const response = await api.post(`/office-locations/${officeLocationId}/check-location`, location);
    return response.data;
  },
};
