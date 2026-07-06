import api from './api';
import type { UserDevice } from '../types';

export const deviceService = {
  getAllDevices: async (): Promise<UserDevice[]> => {
    const response = await api.get('/devices');
    return response.data.data;
  },

  getUserDevices: async (userId: number): Promise<UserDevice[]> => {
    const response = await api.get(`/devices/user/${userId}`);
    return response.data.data;
  },

  unbindDevice: async (deviceId: number): Promise<void> => {
    await api.delete(`/devices/${deviceId}`);
  },

  resetUserDevices: async (userId: number): Promise<void> => {
    await api.delete(`/devices/user/${userId}/reset`);
  },
};
