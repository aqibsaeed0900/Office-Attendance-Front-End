import api from './api';
import type { EmployeeReport } from '../types';

export const reportsService = {
  getReports: async (year?: number, month?: number): Promise<EmployeeReport[]> => {
    const response = await api.get('/reports', { params: { year, month } });
    const result = response.data;
    return Array.isArray(result.data) ? result.data : [];
  },

  exportCSV: async (year?: number, month?: number): Promise<void> => {
    const response = await api.get('/reports/export', {
      params: { year, month },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-report-${year || new Date().getFullYear()}-${month || (new Date().getMonth()+1)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
