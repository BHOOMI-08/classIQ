import { useState, useEffect, useCallback } from 'react';
import { attendanceAnalyticsService } from '../services/attendanceAnalyticsService.js';

export const useAttendanceAnalytics = (classroomId, filters = {}) => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!classroomId) return;
    try {
      setLoading(true);
      setError(null);

      const [ovRes, trRes] = await Promise.all([
        attendanceAnalyticsService.getTeacherOverview(classroomId, filters),
        attendanceAnalyticsService.getTeacherTrends(classroomId, filters),
      ]);

      setOverview(ovRes?.data || null);
      setTrends(trRes?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load classroom analytics');
    } finally {
      setLoading(false);
    }
  }, [classroomId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { overview, trends, loading, error, refreshAnalytics: fetchAnalytics };
};
