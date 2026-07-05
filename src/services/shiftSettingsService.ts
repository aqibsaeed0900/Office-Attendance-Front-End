import api from './api';
import type { ShiftSetting } from '../types';

export const shiftSettingsService = {
  get: async (): Promise<ShiftSetting | null> => {
    const response = await api.get('/shift-settings');
    return response.data.data;
  },

  update: async (id: number, data: Partial<ShiftSetting>): Promise<ShiftSetting> => {
    const response = await api.put(`/shift-settings/${id}`, data);
    return response.data.data;
  },
};
