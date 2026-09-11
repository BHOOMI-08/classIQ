import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { classroomTimelineService } from '../../services/classroomTimelineService.js';
import { useEngagementSocket } from '../../hooks/useEngagementSocket.js';
import ClassroomTimeline from '../../components/ClassroomTimeline.jsx';

export default function ClassroomTimelinePage() {
  const { classId } = useParams();
  const [activities, setActivities] = useState([]);
  const [selectedModule, setSelectedModule] = useState('all');

  const fetchTimeline = useCallback(async (moduleFilter = 'all') => {
    try {
      const res = await classroomTimelineService.getTimeline(classId, moduleFilter);
      setActivities(res.data?.activities || []);
    } catch (_) {}
  }, [classId]);

  useEffect(() => {
    fetchTimeline(selectedModule);
  }, [fetchTimeline, selectedModule]);

  const handleSocketEvent = useCallback((event) => {
    if (event === 'timeline-updated') {
      fetchTimeline(selectedModule);
    }
  }, [fetchTimeline, selectedModule]);

  useEngagementSocket(classId, handleSocketEvent);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <ClassroomTimeline
        activities={activities}
        selectedModule={selectedModule}
        onFilterChange={(mod) => setSelectedModule(mod)}
      />
    </div>
  );
}
