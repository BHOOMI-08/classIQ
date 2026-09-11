import { useState, useEffect, useCallback } from 'react';
import { attendanceAnalyticsService } from '../services/attendanceAnalyticsService.js';

export const useAttendanceHealth = (classroomId = null) => {
  const [healthData, setHealthData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (classroomId) {
        const [hRes, fRes] = await Promise.all([
          attendanceAnalyticsService.getClassHealth(classroomId),
          attendanceAnalyticsService.getForecast(classroomId),
        ]);
        setHealthData(hRes?.data || null);
        setForecast(fRes?.data || null);
      } else {
        const hRes = await attendanceAnalyticsService.getMyHealth();
        setHealthData(hRes?.data || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance health');
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { healthData, forecast, loading, error, refreshHealth: fetchHealth };
};
