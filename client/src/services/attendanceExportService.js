import { getAccessToken } from './api.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const attendanceExportService = {
  downloadSessionCsv: async (sessionId) => {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/attendance/sessions/${sessionId}/export`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-attendance-${sessionId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadClassroomCsv: async (classroomId, { startDate, endDate } = {}) => {
    const token = getAccessToken();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${BASE_URL}/attendance/classrooms/${classroomId}/export${query}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export classroom CSV report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classroom-attendance-${classroomId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
