import { useEffect } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useEngagementSocket(classId, onEvent) {
  useEffect(() => {
    if (!classId) return;

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    const socket = socketInstance;

    socket.emit('join:classroom-engagement', { classroomId: classId });

    const handlePulseStarted = (data) => onEvent?.('pulse-started', data);
    const handlePulseUpdated = (data) => onEvent?.('pulse-updated', data);
    const handlePulseClosed = (data) => onEvent?.('pulse-closed', data);

    const handlePollStarted = (data) => onEvent?.('poll-started', data);
    const handlePollUpdated = (data) => onEvent?.('poll-updated', data);
    const handlePollRevealed = (data) => onEvent?.('poll-answer-revealed', data);
    const handlePollClosed = (data) => onEvent?.('poll-closed', data);

    const handleDoubtCreated = (data) => onEvent?.('doubt-created', data);
    const handleDoubtUpvoted = (data) => onEvent?.('doubt-upvoted', data);
    const handleDoubtResolved = (data) => onEvent?.('doubt-resolved', data);

    const handleExitTicketStarted = (data) => onEvent?.('exit-ticket-started', data);
    const handleExitTicketClosed = (data) => onEvent?.('exit-ticket-closed', data);
    const handleTimelineUpdated = (data) => onEvent?.('timeline-updated', data);

    socket.on('engagement:pulse-started', handlePulseStarted);
    socket.on('engagement:pulse-updated', handlePulseUpdated);
    socket.on('engagement:pulse-closed', handlePulseClosed);

    socket.on('engagement:poll-started', handlePollStarted);
    socket.on('engagement:poll-updated', handlePollUpdated);
    socket.on('engagement:poll-answer-revealed', handlePollRevealed);
    socket.on('engagement:poll-closed', handlePollClosed);

    socket.on('engagement:doubt-created', handleDoubtCreated);
    socket.on('engagement:doubt-upvoted', handleDoubtUpvoted);
    socket.on('engagement:doubt-resolved', handleDoubtResolved);

    socket.on('engagement:exit-ticket-started', handleExitTicketStarted);
    socket.on('engagement:exit-ticket-closed', handleExitTicketClosed);
    socket.on('engagement:timeline-updated', handleTimelineUpdated);

    return () => {
      socket.emit('leave:classroom-engagement', { classroomId: classId });
      socket.off('engagement:pulse-started', handlePulseStarted);
      socket.off('engagement:pulse-updated', handlePulseUpdated);
      socket.off('engagement:pulse-closed', handlePulseClosed);
      socket.off('engagement:poll-started', handlePollStarted);
      socket.off('engagement:poll-updated', handlePollUpdated);
      socket.off('engagement:poll-answer-revealed', handlePollRevealed);
      socket.off('engagement:poll-closed', handlePollClosed);
      socket.off('engagement:doubt-created', handleDoubtCreated);
      socket.off('engagement:doubt-upvoted', handleDoubtUpvoted);
      socket.off('engagement:doubt-resolved', handleDoubtResolved);
      socket.off('engagement:exit-ticket-started', handleExitTicketStarted);
      socket.off('engagement:exit-ticket-closed', handleExitTicketClosed);
      socket.off('engagement:timeline-updated', handleTimelineUpdated);
    };
  }, [classId, onEvent]);
}
