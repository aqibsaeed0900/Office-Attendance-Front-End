import api from './api';
import type { Attendance, MonthlyAttendance } from '../types';

export const attendanceService = {
  checkIn: async (data: {
    user_id: number;
    check_in: string;
    location_lat?: number;
    location_lng?: number;
    notes?: string;
  }): Promise<Attendance> => {
    const response = await api.post('/attendance/check-in', data);
    return response.data.data;
  },

  checkOut: async (id: number, check_out: string): Promise<Attendance> => {
    const response = await api.post(`/attendance/check-out/${id}`, { check_out });
    return response.data.data;
  },

  getMyAttendance: async (params?: { page?: number; pageSize?: number }) => {
    const response = await api.get('/attendance/me', { params });
    return response.data;
  },

  getUserAttendance: async (userId: number, params?: { page?: number; pageSize?: number }) => {
    const response = await api.get(`/attendance/${userId}`, { params });
    const result = response.data;
    const data = Array.isArray(result.data) ? result.data : [];
    return { records: data };
  },

  getMonthlyAttendance: async (userId: number, year: number, month: number): Promise<MonthlyAttendance> => {
    const response = await api.get(`/attendance/${userId}/monthly`, { params: { year, month } });
    return response.data.data;
  },

  adminPunch: async (data: {
    user_id: number;
    check_in?: string;
    check_out?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Attendance> => {
    const response = await api.post('/attendance/admin-punch', data);
    return response.data.data;
  },

  validateLocation: async (officeLocationId: number, location: { latitude: number; longitude: number }) => {
    const response = await api.post(`/office-locations/${officeLocationId}/check-location`, location);
    return response.data;
  },
};
