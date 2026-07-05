import api from './api';
import type { User, CreateUserInput, UpdateUserInput } from '../types';

export const userService = {
  getUsers: async (params?: { page?: number; pageSize?: number; status?: string; search?: string }) => {
    const response = await api.get('/users', { params });
    const result = response.data;
    const data = Array.isArray(result.data) ? result.data : [];
    return { data, total: result.total || data.length };
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: CreateUserInput): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  updateUser: async (id: number, data: UpdateUserInput): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getUserAttendanceSummary: async (userId: number, year: number, month: number) => {
    const response = await api.get(`/users/${userId}/summary`, { params: { year, month } });
    return response.data.data;
  },
};
