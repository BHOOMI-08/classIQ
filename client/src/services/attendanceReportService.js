import { getAccessToken } from './api.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const attendanceReportService = {
  downloadClassroomCsv: async (classroomId) => {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/attendance/reports/classrooms/${classroomId}/csv`, {
      method: 'GET',
      credentials: 'include',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });

    if (!response.ok) throw new Error('Failed to generate CSV report');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classroom-report-${classroomId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadClassroomPdf: async (classroomId) => {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/attendance/reports/classrooms/${classroomId}/pdf`, {
      method: 'GET',
      credentials: 'include',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });

    if (!response.ok) throw new Error('Failed to generate PDF report');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classroom-report-${classroomId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
