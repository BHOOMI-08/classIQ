import { useState, useEffect, useCallback } from 'react';
import { attendanceSessionService } from '../services/attendanceSessionService.js';

export const useActiveAttendanceSession = (classroomId) => {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveSession = useCallback(async () => {
    if (!classroomId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await attendanceSessionService.getActiveSession(classroomId);
      setActiveSession(res?.data?.session || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch active attendance session');
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  return { activeSession, loading, error, refreshSession: fetchActiveSession };
};
